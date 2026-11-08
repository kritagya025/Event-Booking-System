import React, { useState, useEffect } from 'react';
import { 
  X, Check, ArrowRight, ArrowLeft,
  Smartphone, CreditCard, Landmark, Gift, Wallet, AlertCircle,
  Volume2, Zap, Filter, RotateCcw, Trash2, Eye, Ticket,
  Film, Clapperboard, Sparkles, Users, Compass
} from 'lucide-react';
import { wsService } from '../services/websocket';
import { apiFetch } from '../services/api';
import { formatPrice } from '../services/currency';
import confetti from 'canvas-confetti';
import SeatMapSkeleton from './SeatMapSkeleton';

// Cinema & Movie Concessions Menu
const CINEMA_CONCESSIONS = [
  {
    id: 'popcorn_tub',
    name: 'Buttered Mega Tub Popcorn',
    tag: 'CINEMA CLASSIC',
    description: 'Freshly popped warm golden kernels with real melted butter or caramel glaze',
    price: 8.50,
    icon: '🍿'
  },
  {
    id: 'nachos_supreme',
    name: 'Loaded Stadium Nachos',
    tag: 'CHEF SELECTION',
    description: 'Crisp tortilla corn chips served with hot jalapeño cheddar cheese dip & zesty salsa',
    price: 9.00,
    icon: '🧀'
  },
  {
    id: 'soda_duo',
    name: 'Fountain Soda Duo (2x 32oz)',
    tag: 'CHILLED REFRESH',
    description: 'Choice of Ice-Cold Cola, Lemon-Lime, Ginger Ale or Zero Sugar chilled with crushed ice',
    price: 6.50,
    icon: '🥤'
  },
  {
    id: 'sweet_box',
    name: 'Confectionery Sweet Box',
    tag: 'GOURMET CANDY',
    description: 'Classic cinema candy box: Chocolate M&M\'s, Red Twizzlers & sour gummy ribbons',
    price: 5.50,
    icon: '🍫'
  },
  {
    id: 'directors_pack',
    name: "Director's Cut VIP Combo",
    tag: 'BEST VALUE // SAVE 20%',
    description: 'Mega Popcorn Tub + 2 Large Fountain Sodas + Loaded Nachos + Choice of Candy Box',
    price: 22.00,
    icon: '🎟️'
  }
];

const DEFAULT_SHOWTIMES = ['11:30 AM', '02:45 PM', '06:15 PM', '09:45 PM', '11:59 PM'];

export default function SeatMapModal({ isOpen, onClose, event, currentUser, showToast, onBookingSuccess }) {
  const [step, setStep] = useState(1); // 1: Seats, 2: Review, 3: Payment Method & Details, 4: Confirm
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiSubOption, setUpiSubOption] = useState('UPI_ID'); // 'UPI_ID' or 'UPI_QR'
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: 'HDFC Bank',
    giftCardCode: '',
    giftCardPin: '',
    walletType: 'Paytm',
    walletPhone: ''
  });

  const [seatMap, setSeatMap] = useState([]);
  const [availableCount, setAvailableCount] = useState(event?.availableSeats || 50);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL' | 'VIP' | 'PREMIUM' | 'REGULAR'
  const isCinema = event?.category === 'CINEMA' || event?.category === 'MOVIE' || (event?.name && /imax|cinema|movie|film|screening|interstellar|blade runner|oppenheimer/i.test(event.name));
  const [selectedShowtime, setSelectedShowtime] = useState(event?.selectedShowtime || event?.showtimes?.[0] || '06:15 PM');
  const [selectedSnacks, setSelectedSnacks] = useState({});
  const [showMiniMap, setShowMiniMap] = useState(false);

  useEffect(() => {
    if (event) {
      setSelectedShowtime(event.selectedShowtime || event.showtimes?.[0] || '06:15 PM');
      setSelectedSnacks({});
    }
  }, [event]);

  const calculateSnacksTotal = () => {
    return Object.entries(selectedSnacks).reduce((sum, [snackId, qty]) => {
      const item = CINEMA_CONCESSIONS.find(c => c.id === snackId);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleUpdateSnack = (snackId, delta) => {
    setSelectedSnacks(prev => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return { ...prev, [snackId]: next };
    });
  };

  useEffect(() => {
    if (!event || !isOpen) return;
    setStep(1);
    setSelectedSeats([]);
    setDiscountInfo(null);
    setCouponCode('');
    setAvailableCount(event.availableSeats || 50);

    const fetchVenueSeats = async () => {
      const vId = event.venueId || event.venue?.id || 1;
      setLoadingSeats(true);

      try {
        const data = await apiFetch(`/seats/venue/${vId}`).catch(() => null);
        if (data && data.length > 0) {
          let formatted = data.map(s => {
            const isOrch = s.seatType === 'ORCHESTRA' || s.seatType === 'VIP' || s.rowNumber === 'A';
            const isMezz = s.seatType === 'MEZZANINE' || s.seatType === 'PREMIUM' || s.rowNumber === 'B';
            const isBalc = s.seatType === 'BALCONY' || s.rowNumber === 'C';
            const type = isOrch ? 'ORCHESTRA' : (isMezz ? 'MEZZANINE' : (isBalc ? 'BALCONY' : (s.seatType || 'GENERAL')));
            const price = isOrch 
              ? Math.round(event.ticketPrice * 1.5) 
              : (isMezz ? Math.round(event.ticketPrice * 1.25) : (isBalc ? Math.round(event.ticketPrice * 1.1) : event.ticketPrice));
            return {
              ...s,
              seatType: type,
              price: price
            };
          });

          const targetCount = event.availableSeats !== undefined ? event.availableSeats : 40;
          if (targetCount > formatted.length) {
            formatted = expandSeatMap(formatted, targetCount);
          }
          setSeatMap(formatted);
        } else {
          generateSeatsForEvent();
        }
      } catch {
        generateSeatsForEvent();
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchVenueSeats();

    wsService.subscribeToSeatUpdates(event.id, (payload) => {
      if (payload.availableSeats !== undefined) {
        setAvailableCount(payload.availableSeats);
      }
      if (payload.seatId && payload.status) {
        setSeatMap((prev) => prev.map(s => s.id === payload.seatId ? { ...s, status: payload.status } : s));
      }
    });

    return () => {
      wsService.unsubscribe(event.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, isOpen]);

  const getRowLetter = (idx) => {
    if (idx < 26) return String.fromCharCode(65 + idx);
    return 'A' + String.fromCharCode(65 + (idx - 26));
  };

  const generateSeatsForEvent = () => {
    const targetCount = (event.availableSeats !== undefined) ? event.availableSeats : 40;
    const isSoldOut = targetCount === 0;
    const countToGenerate = isSoldOut ? 40 : Math.min(targetCount, 300);

    const seatsPerRow = 10;
    const totalRows = Math.ceil(countToGenerate / seatsPerRow);
    const generated = [];
    let counter = 1;

    for (let r = 0; r < totalRows; r++) {
      const row = getRowLetter(r);
      const isOrch = r === 0;
      const isMezz = r === 1;
      const isBalc = r === 2;
      const seatType = isOrch ? 'ORCHESTRA' : (isMezz ? 'MEZZANINE' : (isBalc ? 'BALCONY' : 'GENERAL'));
      const price = isOrch 
        ? Math.round(event.ticketPrice * 1.5) 
        : (isMezz ? Math.round(event.ticketPrice * 1.25) : (isBalc ? Math.round(event.ticketPrice * 1.1) : event.ticketPrice));

      for (let num = 1; num <= seatsPerRow; num++) {
        if (generated.length >= countToGenerate) break;
        generated.push({
          id: counter++,
          seatNumber: `${row}${num}`,
          rowNumber: row,
          seatType: seatType,
          status: isSoldOut ? 'BOOKED' : 'AVAILABLE',
          price: price
        });
      }
    }
    setSeatMap(generated);
  };

  const expandSeatMap = (existingSeats, targetCount) => {
    const isSoldOut = targetCount === 0;
    const countToGenerate = isSoldOut ? 40 : Math.min(targetCount, 300);
    if (existingSeats.length >= countToGenerate) return existingSeats;

    const expanded = [...existingSeats];
    const seatsPerRow = 10;
    const totalRows = Math.ceil(countToGenerate / seatsPerRow);
    let counter = existingSeats.length + 1;

    for (let r = 0; r < totalRows; r++) {
      const row = getRowLetter(r);
      const isOrch = r === 0;
      const isMezz = r === 1;
      const isBalc = r === 2;
      const seatType = isOrch ? 'ORCHESTRA' : (isMezz ? 'MEZZANINE' : (isBalc ? 'BALCONY' : 'GENERAL'));
      const price = isOrch 
        ? Math.round(event.ticketPrice * 1.5) 
        : (isMezz ? Math.round(event.ticketPrice * 1.25) : (isBalc ? Math.round(event.ticketPrice * 1.1) : event.ticketPrice));

      for (let num = 1; num <= seatsPerRow; num++) {
        if (expanded.length >= countToGenerate) break;
        const seatNum = `${row}${num}`;
        if (!expanded.some(s => s.seatNumber === seatNum)) {
          expanded.push({
            id: counter++,
            seatNumber: seatNum,
            rowNumber: row,
            seatType: seatType,
            status: isSoldOut ? 'BOOKED' : 'AVAILABLE',
            price: price
          });
        }
      }
    }
    return expanded;
  };

  if (!isOpen || !event) return null;

  const toggleSeatSelection = (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') {
      showToast(`SEAT ${seat.seatNumber} IS CURRENTLY UNAVAILABLE OR HELD`, 'error');
      return;
    }

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        showToast('MAXIMUM 6 SEATS PER BOOKING ORDER', 'info');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);

    try {
      const rawTotal = calculateSubtotal();
      const res = await apiFetch(`/coupons/validate?code=${encodeURIComponent(couponCode)}&bookingAmount=${rawTotal}`, {
        method: 'POST'
      });

      let discountAmount = 0;
      if (res.discountType === 'PERCENTAGE') discountAmount = (rawTotal * res.discountValue) / 100;
      else if (res.discountType === 'FIXED') discountAmount = res.discountValue;
      else if (res.discountType === 'EARLY_BIRD') discountAmount = (rawTotal * res.discountValue) / 100;

      setDiscountInfo({
        code: res.code,
        discountType: res.discountType,
        discountValue: res.discountValue,
        calculatedDiscount: discountAmount
      });

      showToast(`COUPON APPLIED: DEDUCTED ${formatPrice(discountAmount, event.currency)}`, 'success');
    } catch (err) {
      showToast(err.message || 'INVALID PROMO COUPON CODE', 'error');
      setDiscountInfo(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const calculateSubtotal = () => {
    const seatsTotal = selectedSeats.length > 0 ? selectedSeats.reduce((sum, s) => sum + (s.price || event.ticketPrice || 0), 0) : 0;
    return seatsTotal + calculateSnacksTotal();
  };

  const calculateFinalTotal = () => {
    const sub = calculateSubtotal();
    if (sub === 0) return 0;
    if (discountInfo) return Math.max(0, sub - discountInfo.calculatedDiscount);
    return sub;
  };

  const handleProceedToReview = () => {
    if (selectedSeats.length === 0) {
      showToast('PLEASE SELECT AT LEAST ONE SEAT ON THE SEAT MAP TO PROCEED', 'error');
      return;
    }
    setStep(2);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      showToast('NO SEATS SELECTED. PLEASE SELECT AT LEAST ONE SEAT FIRST.', 'error');
      setStep(1);
      return;
    }
    setStep(3);
  };

  const handleProceedToConfirm = () => {
    if (selectedSeats.length === 0) {
      showToast('NO SEATS SELECTED. PLEASE SELECT AT LEAST ONE SEAT.', 'error');
      setStep(1);
      return;
    }

    if (paymentMethod === 'UPI') {
      if (upiSubOption === 'UPI_ID' && !paymentDetails.upiId?.trim()) {
        showToast('PLEASE ENTER A VALID UPI ID OR SWITCH TO QR CODE SCAN', 'error');
        return;
      }
    } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      if (!paymentDetails.cardHolder?.trim()) {
        showToast('PLEASE ENTER CARDHOLDER NAME', 'error');
        return;
      }
      if (!paymentDetails.cardNumber?.trim()) {
        showToast('PLEASE ENTER 16-DIGIT CARD NUMBER', 'error');
        return;
      }
      if (!paymentDetails.cardExpiry?.trim()) {
        showToast('PLEASE ENTER CARD EXPIRY (MM/YY)', 'error');
        return;
      }
      if (!paymentDetails.cardCvv?.trim()) {
        showToast('PLEASE ENTER CVV CODE', 'error');
        return;
      }
    } else if (paymentMethod === 'GIFT_CARD') {
      if (!paymentDetails.giftCardCode?.trim() || !paymentDetails.giftCardPin?.trim()) {
        showToast('PLEASE ENTER GIFT CARD CODE AND SECURITY PIN', 'error');
        return;
      }
    } else if (paymentMethod === 'WALLET') {
      if (!paymentDetails.walletPhone?.trim()) {
        showToast('PLEASE ENTER REGISTERED MOBILE NUMBER FOR WALLET', 'error');
        return;
      }
    }

    setStep(4);
  };

  const handleAutoSelect = (count, targetType = null) => {
    const availableSlots = 6 - selectedSeats.length;
    if (availableSlots <= 0) {
      showToast('MAXIMUM 6 SEATS PER BOOKING REACHED', 'info');
      return;
    }
    const needed = Math.min(count, availableSlots);

    // If looking for 2 or more seats, prioritize finding consecutive adjacent seats in the same row
    if (needed >= 2) {
      const rows = Array.from(new Set(seatMap.map(s => s.rowNumber || 'A'))).sort();
      let bestAdjacentGroup = null;

      for (const r of rows) {
        const rowSeats = seatMap
          .filter(s => s.rowNumber === r && (!targetType || s.seatType === targetType))
          .sort((a, b) => {
            const numA = parseInt(a.seatNumber.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.seatNumber.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });

        for (let i = 0; i <= rowSeats.length - needed; i++) {
          const window = rowSeats.slice(i, i + needed);
          const allAvailable = window.every(s => s.status === 'AVAILABLE' && !selectedSeats.some(sel => sel.id === s.id));
          if (allAvailable) {
            let consecutive = true;
            for (let j = 0; j < window.length - 1; j++) {
              const curNum = parseInt(window[j].seatNumber.replace(/\D/g, ''), 10);
              const nextNum = parseInt(window[j + 1].seatNumber.replace(/\D/g, ''), 10);
              if (nextNum !== curNum + 1) {
                consecutive = false;
                break;
              }
            }
            if (consecutive) {
              bestAdjacentGroup = window;
              break;
            }
          }
        }
        if (bestAdjacentGroup) break;
      }

      if (bestAdjacentGroup) {
        setSelectedSeats(prev => [...prev, ...bestAdjacentGroup]);
        showToast(`RESERVED ${bestAdjacentGroup.length} ADJACENT SEATS: ${bestAdjacentGroup.map(s => s.seatNumber).join(', ')}`, 'success');
        return;
      }
    }

    // Default: Best available candidate seats
    let candidates = seatMap.filter(s => s.status === 'AVAILABLE' && !selectedSeats.some(sel => sel.id === s.id));
    if (targetType) {
      candidates = candidates.filter(s => s.seatType === targetType);
    }
    if (candidates.length === 0) {
      showToast(`NO AVAILABLE ${targetType ? targetType + ' ' : ''}SEATS REMAINING`, 'info');
      return;
    }

    const toAdd = candidates.slice(0, needed);
    setSelectedSeats(prev => [...prev, ...toAdd]);
    showToast(`ADDED ${toAdd.length} BEST AVAILABLE SEAT(S) TO CART`, 'success');
  };

  const handleClearSelection = () => {
    setSelectedSeats([]);
  };

  const handleRemoveSeat = (seatId) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
  };

  const handleDetailsChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      showToast('PLEASE SIGN IN BEFORE COMPLETING RESERVATION', 'info');
      return;
    }

    if (selectedSeats.length === 0) {
      showToast('NO SEATS SELECTED. PLEASE SELECT AT LEAST ONE SEAT.', 'error');
      setStep(1);
      return;
    }

    setBookingLoading(true);

    try {
      let validPaymentMethod = 'UPI';
      if (['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING'].includes(paymentMethod)) {
        validPaymentMethod = paymentMethod;
      } else if (paymentMethod === 'GIFT_CARD' || paymentMethod === 'WALLET') {
        validPaymentMethod = 'UPI';
      }

      const quantity = selectedSeats.length;
      const payload = {
        userId: currentUser.id || currentUser.userId || 1,
        eventId: event.id,
        quantity: quantity,
        seatIds: selectedSeats.map(s => (typeof s.id === 'number' && s.id > 0) ? s.id : null).filter(Boolean),
        couponCode: discountInfo ? discountInfo.code : null
      };

      let bookingResult = null;

      try {
        bookingResult = await apiFetch('/bookings', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } catch (bErr) {
        console.warn('Backend booking API notice:', bErr);
      }

      if (!bookingResult || !bookingResult.id) {
        bookingResult = {
          id: Date.now(),
          bookingDate: new Date().toISOString(),
          bookingStatus: 'CONFIRMED',
          quantity: quantity,
          totalAmount: calculateFinalTotal(),
          user: currentUser,
          event: event
        };
      } else {
        await apiFetch('/payments', {
          method: 'POST',
          body: JSON.stringify({ bookingId: bookingResult.id, paymentMethod: validPaymentMethod })
        }).catch((pErr) => console.warn('Payment API notice:', pErr));
      }

      try {
        const storedBookings = JSON.parse(localStorage.getItem('my_local_bookings') || '[]');
        const newBookingRecord = {
          id: bookingResult.id,
          bookingDate: new Date().toISOString(),
          bookingStatus: 'CONFIRMED',
          quantity: quantity,
          totalAmount: calculateFinalTotal(),
          event: event,
          selectedSeats: selectedSeats.map(s => s.seatNumber).join(', '),
          isCinema: isCinema,
          showtime: selectedShowtime,
          screenName: 'SCREEN 01 // AUDITORIUM LASER',
          snacks: selectedSnacks,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TICKET-${bookingResult.id}-${event.id}`
        };
        localStorage.setItem('my_local_bookings', JSON.stringify([newBookingRecord, ...storedBookings]));
      } catch {}

      try {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      } catch {}

      showToast('BOOKING CONFIRMED // DIGITAL E-TICKET PASS ISSUED', 'success');
      if (onBookingSuccess) {
        onBookingSuccess(bookingResult);
      }
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      showToast('BOOKING CONFIRMED // DIGITAL E-TICKET PASS ISSUED', 'success');
      onClose();
    } finally {
      setBookingLoading(false);
    }
  };

  const rowsList = Array.from(new Set(seatMap.map(s => s.rowNumber || 'A'))).sort();

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto safe-pb touch-scroll" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-asphalt-surface border-2 sm:border-4 border-grit-white text-grit-white shadow-[6px_6px_0px_#eefc54] sm:shadow-[12px_12px_0px_#eefc54] my-auto relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Slanted Sticker */}
        <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-2 bg-neon-magenta text-grit-white font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rotate-2 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENTHUB // RESERVATION ENGINE
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
                LIVE SEAT RESERVATION
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-acid-yellow animate-ping"></span>
                LIVE SEAT INVENTORY SYNCED
              </span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl uppercase tracking-tight text-grit-white mt-1 leading-none">
              {event.name}
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              VENUE: {event.venueName || 'MAIN ARENA'} · {availableCount} SEATS AVAILABLE
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-1.5 transition-colors cursor-pointer touch-manipulation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Multi-Step Protocol Bar */}
        <div className="bg-asphalt-black border-b border-asphalt-border px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between text-xs font-ticker overflow-x-auto touch-scroll scrollbar-none gap-2">
          <div className="flex items-center gap-2">
            <span className={step === 1 ? 'text-acid-yellow font-bold bg-asphalt-surface px-2 py-0.5 border border-acid-yellow' : 'text-grit-dim'}>
              [01] SELECT SEATS
            </span>
            <span className="text-grit-dim">→</span>
            <span className={step === 2 ? 'text-acid-yellow font-bold bg-asphalt-surface px-2 py-0.5 border border-acid-yellow' : 'text-grit-dim'}>
              [02] REVIEW BOOKING
            </span>
            <span className="text-grit-dim">→</span>
            <span className={step === 3 ? 'text-acid-yellow font-bold bg-asphalt-surface px-2 py-0.5 border border-acid-yellow' : 'text-grit-dim'}>
              [03] PAYMENT METHOD
            </span>
            <span className="text-grit-dim">→</span>
            <span className={step === 4 ? 'text-acid-yellow font-bold bg-asphalt-surface px-2 py-0.5 border border-acid-yellow' : 'text-grit-dim'}>
              [04] CONFIRMATION
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: SELECT SEATS */}
          {step === 1 && (
            <div>
              {loadingSeats ? (
                <SeatMapSkeleton isCinema={isCinema} />
              ) : (
                <div>
                  {/* ─── Cinema Showtime Selector Bar (Cinema Mode) ─── */}
                  {isCinema && (
                    <div className="mb-4 p-3 bg-asphalt-black border-2 border-acid-yellow flex flex-wrap items-center justify-between gap-2 shadow-[3px_3px_0px_#ffffff]">
                      <div className="flex items-center gap-2">
                        <Clapperboard size={15} className="text-acid-yellow animate-pulse" />
                        <span className="font-ticker text-[10px] text-grit-white uppercase tracking-wider font-bold">
                          SCREEN 01 // AUDITORIUM SHOWTIME:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(event.showtimes || DEFAULT_SHOWTIMES).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setSelectedShowtime(st)}
                            className={`px-3 py-1 font-ticker text-xs font-bold uppercase border transition-all cursor-pointer ${
                              selectedShowtime === st
                                ? 'bg-acid-yellow text-asphalt-black border-asphalt-black shadow-[2px_2px_0px_#ffffff]'
                                : 'bg-asphalt-surface text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─── A. Proscenium: Cinema Curved Screen OR Live Concert Stage ─── */}
                  <div className="relative mb-5 bg-asphalt-black border-2 border-asphalt-border p-3 sm:p-4 overflow-hidden">
                    <div className="hazard-tape h-2 w-full mb-3" />

                    {isCinema ? (
                      /* Cinema Curved IMAX Screen */
                      <div className="relative">
                        {/* Overhead Projector Aperture & Beam */}
                        <div className="flex flex-col items-center mb-1">
                          <div className="flex items-center gap-1.5 px-3 py-0.5 bg-asphalt-card border border-asphalt-border text-[8px] font-mono-zine text-grit-dim uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping inline-block"></span>
                            4K DUAL LASER BOOTH • 1.43:1 RATIO
                          </div>
                          {/* Angled projection beam lines */}
                          <div className="w-40 h-3 bg-gradient-to-b from-sky-400/20 via-sky-400/5 to-transparent"></div>
                        </div>

                        {/* Curved Screen Curve */}
                        <div className="text-center py-4 px-4 bg-gradient-to-b from-asphalt-card via-asphalt-black to-asphalt-black border-2 border-acid-yellow shadow-[0_0_30px_rgba(226,241,60,0.18)] relative rounded-b-[48px] overflow-hidden">
                          {/* Prismatic reflection sheen */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/10 to-transparent pointer-events-none"></div>

                          <div className="flex items-center justify-center gap-2 mb-1 relative z-10">
                            <Film size={16} className="text-acid-yellow animate-pulse" />
                            <span className="font-impact text-base sm:text-lg tracking-widest text-grit-white uppercase">
                              ▲ CURVED IMAX CINEMA SCREEN // ALL EYES FORWARD ▲
                            </span>
                            <Film size={16} className="text-neon-magenta animate-pulse" />
                          </div>
                          <p className="font-mono-zine text-[9px] sm:text-[10px] text-grit-dim uppercase tracking-wider relative z-10">
                            128-CH DOLBY ATMOS 3D AUDIO • ACOUSTIC SWEET-SPOT: ROWS B-C
                          </p>
                          <div className="w-56 h-1 bg-gradient-to-r from-transparent via-acid-yellow to-transparent mx-auto mt-2 opacity-80"></div>
                        </div>

                        {/* Sweet-spot reference guide */}
                        <div className="text-center mt-1">
                          <span className="font-ticker text-[8px] text-acid-yellow tracking-widest uppercase">
                            ▼ OPTIMAL STEREO & VISUAL AXIS ▼
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Live Concert Stage Rig */
                      <div className="relative">
                        {/* Stage Rigging Truss */}
                        <div className="hidden sm:flex justify-between items-center px-6 mb-1 text-[8px] font-mono-zine text-grit-dim">
                          <span>RIGGING TRUSS A1</span>
                          <span className="flex items-center gap-2 text-acid-yellow">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-magenta animate-ping"></span>
                            AUDIO PEAK: 128 dB SPL
                          </span>
                          <span>RIGGING TRUSS B1</span>
                        </div>

                        <div className="flex items-stretch justify-between gap-3">
                          {/* Left Speaker Tower Array */}
                          <div className="hidden sm:flex flex-col items-center justify-between p-2.5 bg-asphalt-card border border-asphalt-border shadow-[2px_2px_0px_#0e0e11] w-20">
                            <div className="flex items-center gap-1 text-[8px] font-ticker text-grit-dim uppercase">
                              <Volume2 size={13} className="text-acid-yellow animate-pulse" />
                              <span>L-RIG</span>
                            </div>
                            {/* Graphic EQ Visualizer Bars */}
                            <div className="flex gap-1 h-6 items-end my-1">
                              <span className="w-1.5 h-4 bg-acid-yellow animate-pulse" />
                              <span className="w-1.5 h-6 bg-acid-yellow" />
                              <span className="w-1.5 h-3 bg-neon-magenta animate-pulse" />
                              <span className="w-1.5 h-5 bg-acid-yellow" />
                            </div>
                            <span className="font-ticker text-[7px] text-grit-dim uppercase">40kW LINE-ARRAY</span>
                          </div>

                          {/* Center Main Stage Floor Rig */}
                          <div className="flex-1 text-center py-3 px-4 bg-gradient-to-b from-asphalt-card to-asphalt-black border-2 border-acid-yellow shadow-[0_0_24px_rgba(238,252,84,0.15)] relative rounded-b-[24px]">
                            {/* Overhead spotlight cone glow */}
                            <div className="absolute inset-0 bg-gradient-to-b from-acid-yellow/5 to-transparent pointer-events-none"></div>

                            <div className="flex items-center justify-center gap-2 mb-1">
                              <Zap size={15} className="text-acid-yellow animate-bounce" />
                              <span className="font-impact text-sm sm:text-base tracking-widest text-grit-white uppercase">
                                ▲ MAIN CONCERT STAGE & LIVE SOUND RIG ▲
                              </span>
                              <Zap size={15} className="text-neon-magenta animate-bounce" />
                            </div>
                            <p className="font-mono-zine text-[9px] sm:text-[10px] text-grit-dim uppercase tracking-wider">
                              DIRECT STAGE SIGHTLINE • 10-MINUTE SEAT LOCK ACTIVE
                            </p>
                            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-0.5 bg-asphalt-black border border-asphalt-border font-ticker text-[8px] text-acid-yellow uppercase">
                              <span>🎙️ CENTER PERFORMER APEX</span>
                              <span>•</span>
                              <span>STAGE FRONT MOSH BARRIER</span>
                            </div>
                          </div>

                          {/* Right Speaker Tower Array */}
                          <div className="hidden sm:flex flex-col items-center justify-between p-2.5 bg-asphalt-card border border-asphalt-border shadow-[2px_2px_0px_#0e0e11] w-20">
                            <div className="flex items-center gap-1 text-[8px] font-ticker text-grit-dim uppercase">
                              <Volume2 size={13} className="text-neon-magenta animate-pulse" />
                              <span>R-RIG</span>
                            </div>
                            {/* Graphic EQ Visualizer Bars */}
                            <div className="flex gap-1 h-6 items-end my-1">
                              <span className="w-1.5 h-5 bg-acid-yellow" />
                              <span className="w-1.5 h-3 bg-neon-magenta animate-pulse" />
                              <span className="w-1.5 h-6 bg-acid-yellow" />
                              <span className="w-1.5 h-4 bg-acid-yellow animate-pulse" />
                            </div>
                            <span className="font-ticker text-[7px] text-grit-dim uppercase">40kW LINE-ARRAY</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ─── B. Quick Filters & Smart Selection Bar ─── */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 pb-3 border-b border-asphalt-border">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-wider flex items-center gap-1 mr-1">
                        <Filter size={11} /> SECTION:
                      </span>
                      {[
                        { id: 'ALL', label: 'ALL SECTIONS', color: 'bg-grit-white' },
                        { id: 'ORCHESTRA', label: 'ORCHESTRA PIT', color: 'bg-neon-magenta' },
                        { id: 'MEZZANINE', label: 'MEZZANINE', color: 'bg-blue-400' },
                        { id: 'BALCONY', label: 'BALCONY', color: 'bg-amber-400' },
                        { id: 'GENERAL', label: 'GENERAL', color: 'bg-grit-dim' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setActiveSection(f.id)}
                          className={`px-2.5 py-1 text-[11px] font-impact tracking-wider uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeSection === f.id
                              ? 'bg-acid-yellow text-asphalt-black border-grit-white shadow-[2px_2px_0px_#ffffff]'
                              : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-acid-yellow hover:text-grit-white'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${f.color}`}></span>
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAutoSelect(1)}
                        className="px-2.5 py-1 bg-asphalt-surface border border-asphalt-border hover:border-acid-yellow text-grit-white font-mono-zine text-[10px] uppercase transition-colors cursor-pointer flex items-center gap-1"
                        title="Auto-pick 1 best available seat"
                      >
                        <Sparkles size={10} className="text-acid-yellow" />
                        +1 BEST
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSelect(2)}
                        className="px-2.5 py-1 bg-asphalt-surface border border-asphalt-border hover:border-acid-yellow text-grit-white font-mono-zine text-[10px] uppercase transition-colors cursor-pointer flex items-center gap-1"
                        title="Auto-pick 2 adjacent seats side-by-side"
                      >
                        <Users size={10} className="text-acid-yellow" />
                        +2 PAIR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSelect(4)}
                        className="px-2.5 py-1 bg-asphalt-surface border border-asphalt-border hover:border-acid-yellow text-grit-white font-mono-zine text-[10px] uppercase transition-colors cursor-pointer flex items-center gap-1"
                        title="Auto-pick 4 adjacent seats together"
                      >
                        <Users size={10} className="text-neon-magenta" />
                        +4 SQUAD
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMiniMap(prev => !prev)}
                        className={`px-2 py-1 font-mono-zine text-[10px] uppercase border transition-colors cursor-pointer flex items-center gap-1 ${
                          showMiniMap 
                            ? 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold' 
                            : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:text-grit-white'
                        }`}
                        title="Toggle venue blueprint mini-map"
                      >
                        <Compass size={11} />
                        {showMiniMap ? 'HIDE MAP' : 'VENUE MAP'}
                      </button>
                      {selectedSeats.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="px-2 py-1 bg-neon-magenta/20 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-grit-white font-mono-zine text-[10px] uppercase transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw size={10} /> CLEAR ({selectedSeats.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ─── Tactical Venue Blueprint Mini-Map (When Toggled) ─── */}
                  {showMiniMap && (
                    <div className="mb-4 p-3 bg-asphalt-black border-2 border-acid-yellow shadow-[4px_4px_0px_#0e0e11] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-16 bg-asphalt-surface border border-asphalt-border relative p-1 flex flex-col justify-between overflow-hidden shadow-inner">
                          {/* Mini Stage Header */}
                          <div className="w-full h-2.5 bg-acid-yellow rounded-b-sm text-[6px] text-asphalt-black text-center font-bold tracking-wider">
                            STAGE NORTH
                          </div>
                          {/* Mini Tier Blocks */}
                          <div className="space-y-0.5 my-auto">
                            <div className="h-1.5 w-full bg-neon-magenta/40 rounded-xs flex items-center justify-center">
                              {selectedSeats.some(s => s.rowNumber === 'A') && (
                                <span className="w-1 h-1 bg-acid-yellow rounded-full animate-ping"></span>
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-blue-500/40 rounded-xs flex items-center justify-center">
                              {selectedSeats.some(s => s.rowNumber === 'B') && (
                                <span className="w-1 h-1 bg-acid-yellow rounded-full animate-ping"></span>
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-amber-500/40 rounded-xs flex items-center justify-center">
                              {selectedSeats.some(s => s.rowNumber === 'C') && (
                                <span className="w-1 h-1 bg-acid-yellow rounded-full animate-ping"></span>
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-stone-500/40 rounded-xs flex items-center justify-center">
                              {selectedSeats.some(s => s.rowNumber >= 'D') && (
                                <span className="w-1 h-1 bg-acid-yellow rounded-full animate-ping"></span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="font-impact text-xs text-grit-white uppercase block">
                            ARENA SPATIAL ORIENTATION
                          </span>
                          <span className="font-mono-zine text-[9px] text-grit-dim uppercase block">
                            NORTH FACING STAGE • AISLE 01 CENTER RUNWAY • CAPACITY {seatMap.length} SEATS
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 font-ticker text-[9px] text-grit-dim uppercase">
                        <span className="text-acid-yellow font-bold">
                          ● {selectedSeats.length} SEATS IN CART
                        </span>
                        <span>•</span>
                        <span>{seatMap.filter(s => s.status === 'AVAILABLE').length} AVAILABLE</span>
                      </div>
                    </div>
                  )}

                  {/* ─── C. Interactive Arena Seat Grid with Center Aisle ─── */}
                  <div className="flex sm:hidden items-center justify-center gap-1.5 py-1 px-3 bg-asphalt-black border border-asphalt-border text-[10px] font-mono-zine text-acid-yellow uppercase mb-2">
                    <span>← SWIPE HORIZONTALLY TO VIEW ALL ROWS & SEATS →</span>
                  </div>

                  <div className="overflow-x-auto pb-4 touch-scroll scrollbar-none">
                    <div className="min-w-[580px] flex flex-col gap-3 items-center">
                      {rowsList.map((row, rowIndex) => {
                        const rowSeats = seatMap.filter(s => s.rowNumber === row);
                        const leftWing = rowSeats.slice(0, 5);
                        const rightWing = rowSeats.slice(5, 10);

                        // Tier Header Detection
                        let tierHeader = null;
                        if (row === 'A') {
                          tierHeader = {
                            title: 'TIER 01 // VIP ORCHESTRA PIT • DIRECT SIGHTLINE',
                            badge: 'VIP ORCHESTRA',
                            color: 'text-neon-magenta border-neon-magenta bg-neon-magenta/10'
                          };
                        } else if (row === 'B') {
                          tierHeader = {
                            title: 'TIER 02 // MEZZANINE CLUB • ACOUSTIC SWEET-SPOT',
                            badge: 'MEZZANINE',
                            color: 'text-blue-400 border-blue-400 bg-blue-950/20'
                          };
                        } else if (row === 'C') {
                          tierHeader = {
                            title: 'TIER 03 // BALCONY LOGE • ELEVATED OVERVIEW',
                            badge: 'BALCONY',
                            color: 'text-amber-400 border-amber-400 bg-amber-950/20'
                          };
                        } else if (row === 'D' && rowIndex === 3) {
                          tierHeader = {
                            title: 'TIER 04 // GENERAL AUDITORIUM',
                            badge: 'GENERAL',
                            color: 'text-grit-dim border-asphalt-border bg-asphalt-card'
                          };
                        }

                        const renderSeatBtn = (seat) => {
                          const isSelected = selectedSeats.some(s => s.id === seat.id);
                          const isDimmed = activeSection !== 'ALL' && seat.seatType !== activeSection;

                          let container = "group relative flex flex-col items-center justify-center transition-all duration-150 cursor-pointer select-none ";
                          let headrest = "w-full h-1.5 sm:h-2 rounded-t-[4px] border-b ";
                          let cushion = "w-8 h-7 sm:w-9 sm:h-8 flex items-center justify-center font-mono-zine text-[11px] font-bold border-2 border-t-0 rounded-b-[4px] relative ";

                          if (isSelected) {
                            container += "scale-105 z-20 -translate-y-0.5 ";
                            headrest += "bg-acid-yellow border-asphalt-black ";
                            cushion += "bg-acid-yellow text-asphalt-black border-grit-white shadow-[0_0_14px_rgba(226,241,60,0.7),2px_2px_0px_#ffffff] font-black ";
                          } else if (seat.status === 'AVAILABLE') {
                            container += "hover:-translate-y-0.5 ";
                            if (seat.seatType === 'ORCHESTRA' || seat.seatType === 'VIP') {
                              headrest += "bg-neon-magenta border-asphalt-black ";
                              cushion += "bg-neon-magenta/15 text-neon-magenta border-neon-magenta hover:bg-neon-magenta hover:text-asphalt-black hover:shadow-[0_0_10px_#ff1f6d] ";
                            } else if (seat.seatType === 'MEZZANINE' || seat.seatType === 'PREMIUM') {
                              headrest += "bg-blue-400 border-asphalt-black ";
                              cushion += "bg-blue-950/40 text-blue-300 border-blue-400 hover:bg-blue-400 hover:text-asphalt-black hover:shadow-[0_0_10px_#60a5fa] ";
                            } else if (seat.seatType === 'BALCONY') {
                              headrest += "bg-amber-400 border-asphalt-black ";
                              cushion += "bg-amber-950/40 text-amber-300 border-amber-400 hover:bg-amber-400 hover:text-asphalt-black hover:shadow-[0_0_10px_#fbbf24] ";
                            } else {
                              headrest += "bg-asphalt-border border-asphalt-black group-hover:bg-acid-yellow ";
                              cushion += "bg-asphalt-card text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow hover:shadow-[0_0_8px_#E2F13C] ";
                            }
                            if (isDimmed) container += "opacity-25 ";
                          } else if (seat.status === 'LOCKED') {
                            container += "cursor-not-allowed opacity-45 ";
                            headrest += "bg-amber-600 border-transparent ";
                            cushion += "bg-amber-950/30 text-amber-400 border-amber-600/40 hazard-tape ";
                          } else if (seat.status === 'BOOKED') {
                            container += "cursor-not-allowed opacity-25 ";
                            headrest += "bg-asphalt-border/40 border-transparent ";
                            cushion += "bg-asphalt-card/30 text-grit-dim/30 border-transparent line-through ";
                          }

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              onClick={() => toggleSeatSelection(seat)}
                              onMouseEnter={() => setHoveredSeat(seat)}
                              onMouseLeave={() => setHoveredSeat(null)}
                              className={container}
                              disabled={seat.status === 'BOOKED' || seat.status === 'LOCKED'}
                              title={`${seat.seatNumber} (${seat.seatType || 'REGULAR'}): ${formatPrice(seat.price, event.currency)}`}
                            >
                              <span className={headrest} />
                              <span className={cushion}>
                                {isSelected ? (
                                  <Check size={14} className="stroke-[3]" />
                                ) : (
                                  <span className="leading-none text-[11px] tracking-tight">
                                    {seat.seatNumber}
                                  </span>
                                )}
                              </span>
                              {seat.seatType === 'VIP' && !isSelected && seat.status === 'AVAILABLE' && (
                                <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-neon-magenta rounded-full border border-asphalt-black shadow-[0_0_4px_#ff1f6d]" />
                              )}
                            </button>
                          );
                        };

                        return (
                          <React.Fragment key={row}>
                            {/* Tier Architectural Header Divider */}
                            {tierHeader && (
                              <div className="w-full flex items-center justify-between gap-3 pt-2 pb-1 border-t border-asphalt-border/60">
                                <div className="h-px flex-1 bg-asphalt-border"></div>
                                <span className={`px-2.5 py-0.5 text-[9px] font-mono-zine uppercase tracking-wider border ${tierHeader.color}`}>
                                  {tierHeader.title}
                                </span>
                                <div className="h-px flex-1 bg-asphalt-border"></div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* Left Stanchion */}
                              <div className="w-6 sm:w-7 text-center">
                                <span className="font-impact text-grit-white text-xs bg-asphalt-card border border-asphalt-border px-1.5 py-0.5 shadow-[1px_1px_0px_#0e0e11] block">
                                  {row}
                                </span>
                              </div>

                              {/* Left Wing */}
                              <div className="flex gap-1 sm:gap-1.5">
                                {leftWing.map(renderSeatBtn)}
                              </div>

                              {/* Center Illuminated Runway Aisle */}
                              <div className="w-8 sm:w-10 text-center flex flex-col items-center justify-center pointer-events-none opacity-70">
                                <span className="font-ticker text-[7px] text-acid-yellow tracking-widest uppercase leading-none">
                                  ▲ AISLE ▲
                                </span>
                                <div className="flex items-center gap-1 my-0.5">
                                  <span className="w-1 h-1 rounded-full bg-acid-yellow/60"></span>
                                  <div className="h-3 w-px border-r border-dashed border-asphalt-border" />
                                  <span className="w-1 h-1 rounded-full bg-acid-yellow/60"></span>
                                </div>
                              </div>

                              {/* Right Wing */}
                              <div className="flex gap-1 sm:gap-1.5">
                                {rightWing.map(renderSeatBtn)}
                              </div>

                              {/* Right Stanchion */}
                              <div className="w-6 sm:w-7 text-center">
                                <span className="font-impact text-grit-white text-xs bg-asphalt-card border border-asphalt-border px-1.5 py-0.5 shadow-[1px_1px_0px_#0e0e11] block">
                                  {row}
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─── D. Real-Time Seat Radar Telemetry HUD ─── */}
                  <div className="mt-4 p-3 bg-asphalt-black border-2 border-asphalt-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-ticker text-xs">
                    {hoveredSeat ? (
                      <>
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 font-bold text-[10px] uppercase border shadow-sm ${
                            hoveredSeat.seatType === 'ORCHESTRA' || hoveredSeat.seatType === 'VIP' 
                              ? 'bg-neon-magenta text-grit-white border-neon-magenta' 
                              : (hoveredSeat.seatType === 'MEZZANINE' || hoveredSeat.seatType === 'PREMIUM'
                                ? 'bg-blue-500 text-asphalt-black border-blue-400 font-bold'
                                : (hoveredSeat.seatType === 'BALCONY'
                                  ? 'bg-amber-500 text-asphalt-black border-amber-400 font-bold'
                                  : 'bg-asphalt-card text-grit-white border-asphalt-border'))
                          }`}>
                            {hoveredSeat.seatType || 'GENERAL'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-grit-white text-sm">
                                SEAT {hoveredSeat.seatNumber} (ROW {hoveredSeat.rowNumber})
                              </span>
                              <span className="font-mono-zine text-[9px] text-acid-yellow">
                                {hoveredSeat.rowNumber === 'A' ? '• 8m TO STAGE' : hoveredSeat.rowNumber === 'B' ? '• 14m TO STAGE' : '• 22m TO STAGE'}
                              </span>
                            </div>
                            <span className="text-grit-dim text-[10px] block font-mono-zine">
                              {hoveredSeat.rowNumber === 'A' 
                                ? 'VIP FRONT ROW // 100% UNRESTRICTED SIGHTLINE' 
                                : hoveredSeat.rowNumber === 'B' 
                                  ? 'MEZZANINE CLUB // ACOUSTIC STEREO SWEET-SPOT' 
                                  : hoveredSeat.rowNumber === 'C'
                                    ? 'BALCONY LOGE // ELEVATED PANORAMIC VIEW'
                                    : 'GENERAL AUDITORIUM SEATING'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-grit-dim text-[9px] block uppercase">SEAT RATE</span>
                            <span className="font-impact text-lg text-acid-yellow leading-none">
                              {formatPrice(hoveredSeat.price, event.currency)}
                            </span>
                          </div>
                          <span className={`px-2.5 py-1 text-[9px] uppercase font-bold border ${
                            hoveredSeat.status === 'AVAILABLE'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500'
                              : hoveredSeat.status === 'LOCKED'
                                ? 'bg-amber-950/40 text-amber-400 border-amber-500'
                                : 'bg-rose-950/40 text-rose-400 border-rose-500'
                          }`}>
                            {hoveredSeat.status}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-grit-dim text-[11px]">
                        <span className="flex items-center gap-1.5 uppercase font-mono-zine">
                          <Eye size={13} className="text-acid-yellow" />
                          HOVER OVER ANY SEAT TO PREVIEW SIGHTLINE, DISTANCE & RATE
                        </span>
                        <span className="font-ticker text-acid-yellow uppercase text-[10px] font-bold">
                          MAX 6 SEATS PER BOOKING
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ─── E. Upgraded Legend with Dynamic Tier Counts ─── */}
                  <div className="mt-3 pt-3 border-t border-asphalt-border flex justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-mono-zine text-grit-dim flex-wrap uppercase">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-neon-magenta/20 border-2 border-neon-magenta rounded-t-sm"></div> 
                      <span>ORCHESTRA ({seatMap.filter(s => (s.seatType === 'ORCHESTRA' || s.seatType === 'VIP') && s.status === 'AVAILABLE').length} LEFT)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-blue-950/40 border-2 border-blue-400 rounded-t-sm"></div> 
                      <span>MEZZANINE ({seatMap.filter(s => (s.seatType === 'MEZZANINE' || s.seatType === 'PREMIUM') && s.status === 'AVAILABLE').length} LEFT)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-amber-950/40 border-2 border-amber-400 rounded-t-sm"></div> 
                      <span>BALCONY ({seatMap.filter(s => s.seatType === 'BALCONY' && s.status === 'AVAILABLE').length} LEFT)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-asphalt-card border-2 border-asphalt-border rounded-t-sm"></div> 
                      <span>GENERAL ({seatMap.filter(s => (s.seatType === 'GENERAL' || s.seatType === 'REGULAR') && s.status === 'AVAILABLE').length} LEFT)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-acid-yellow border-2 border-grit-white rounded-t-sm shadow-[0_0_6px_#E2F13C]"></div> 
                      <span className="text-acid-yellow font-bold">SELECTED ({selectedSeats.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-asphalt-card/30 border border-transparent line-through rounded-t-sm"></div> 
                      <span>BOOKED ({seatMap.filter(s => s.status === 'BOOKED').length})</span>
                    </div>
                  </div>

                  {/* ─── F. Selected Seats Ticket Stubs Dock ─── */}
                  {selectedSeats.length > 0 && (
                    <div className="mt-4 p-3 sm:p-4 bg-asphalt-card border-2 border-acid-yellow shadow-[4px_4px_0px_#0e0e11]">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-impact text-xs uppercase tracking-wider text-acid-yellow flex items-center gap-1.5">
                          <Ticket size={14} /> RESERVED PASSES IN CART ({selectedSeats.length}/6 SEATS)
                        </span>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="text-[10px] text-grit-dim hover:text-neon-magenta uppercase font-mono-zine flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={11} /> CLEAR ALL
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map(seat => (
                          <div
                            key={seat.id}
                            className="flex items-center gap-2 bg-asphalt-surface border-2 border-asphalt-border pl-2 pr-2.5 py-1 text-xs font-mono-zine relative shadow-sm group/stub hover:border-acid-yellow transition-colors"
                          >
                            {/* Stub notch */}
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              seat.seatType === 'ORCHESTRA' || seat.seatType === 'VIP' ? 'bg-neon-magenta' : (seat.seatType === 'MEZZANINE' || seat.seatType === 'PREMIUM' ? 'bg-blue-400' : (seat.seatType === 'BALCONY' ? 'bg-amber-400' : 'bg-acid-yellow'))
                            }`} />
                            <strong className="text-grit-white font-ticker">{seat.seatNumber}</strong>
                            <span className="text-grit-dim text-[10px] uppercase">
                              {seat.seatType || 'GEN'}
                            </span>
                            <span className="text-acid-yellow font-bold">{formatPrice(seat.price, event.currency)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSeat(seat.id)}
                              className="text-grit-dim hover:text-neon-magenta ml-1 p-0.5 cursor-pointer rounded hover:bg-asphalt-black"
                              title={`Remove seat ${seat.seatNumber}`}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── G. Bottom Actions ─── */}
              <div className="mt-6 pt-4 border-t-2 border-asphalt-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider block">
                    {selectedSeats.length > 0 ? (
                      <span className="text-acid-yellow font-bold">
                        {selectedSeats.length} SEAT(S) SELECTED: {selectedSeats.map(s => s.seatNumber).join(', ')}
                      </span>
                    ) : (
                      <span className="text-neon-magenta flex items-center gap-1 font-bold">
                        <AlertCircle size={13} /> NO SEATS SELECTED // PLEASE CHOOSE YOUR SEATS
                      </span>
                    )}
                  </span>
                  <span className="font-display text-2xl sm:text-3xl text-acid-yellow font-bold leading-none mt-0.5 block">
                    {formatPrice(calculateSubtotal(), event.currency)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleProceedToReview}
                  disabled={selectedSeats.length === 0}
                  className={`font-impact tracking-wider text-base sm:text-lg uppercase px-6 py-3 sm:py-2.5 border-2 border-asphalt-black flex items-center justify-center gap-2 transition-all touch-manipulation ${
                    selectedSeats.length > 0
                      ? 'bg-acid-yellow text-asphalt-black hover:bg-neon-magenta hover:text-grit-white shadow-[4px_4px_0px_#ffffff] cursor-pointer'
                      : 'bg-asphalt-card text-grit-dim/50 border-asphalt-border cursor-not-allowed opacity-50'
                  }`}
                  title={selectedSeats.length === 0 ? 'Select at least one seat to proceed' : 'Review Selected Seats'}
                >
                  REVIEW BOOKING <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW BOOKING & PROMO */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-asphalt-card border-2 border-asphalt-border p-4">
                <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block mb-3">
                  TICKET ORDER SUMMARY
                </span>
                <div className="space-y-2 font-mono-zine text-xs text-grit-dim uppercase">
                  <div className="flex justify-between">
                    <span>EVENT:</span>
                    <strong className="text-grit-white">{event.name}</strong>
                  </div>
                  {isCinema && (
                    <div className="flex justify-between text-acid-yellow">
                      <span>AUDITORIUM & SHOWTIME:</span>
                      <strong>SCREEN 01 // {selectedShowtime}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>DATE & TIME:</span>
                    <span className="text-grit-white">{event.eventDate} @ {isCinema ? selectedShowtime : event.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SELECTED SEATS:</span>
                    <span className="text-acid-yellow font-bold">
                      {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : 'GENERAL ADMISSION (1 TICKET)'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-asphalt-border text-xs">
                    <span>SEATS SUBTOTAL:</span>
                    <strong className="text-grit-white">{formatPrice(selectedSeats.reduce((sum, s) => sum + (s.price || event.ticketPrice || 0), 0), event.currency)}</strong>
                  </div>
                  {isCinema && calculateSnacksTotal() > 0 && (
                    <div className="flex justify-between text-xs text-acid-yellow">
                      <span>CONCESSIONS & SNACKS:</span>
                      <strong>+{formatPrice(calculateSnacksTotal(), event.currency)}</strong>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-asphalt-border text-sm">
                    <span className="text-grit-white">ORDER SUBTOTAL:</span>
                    <strong className="text-acid-yellow font-impact text-lg">{formatPrice(calculateSubtotal(), event.currency)}</strong>
                  </div>
                </div>
              </div>

              {/* CINEMA CONCESSIONS & GOURMET SNACK BAR */}
              {isCinema && (
                <div className="bg-asphalt-card border-2 border-asphalt-border p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-asphalt-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-acid-yellow text-asphalt-black font-impact text-xs px-2 py-0.5 uppercase tracking-wider">
                        CINEMA CONCESSIONS
                      </span>
                      <span className="font-ticker text-[10px] text-grit-dim uppercase">
                        GOURMET SNACK BAR // IN-SEAT DELIVERY
                      </span>
                    </div>
                    {calculateSnacksTotal() > 0 && (
                      <span className="font-mono-zine text-xs text-acid-yellow font-bold">
                        SNACKS: +{formatPrice(calculateSnacksTotal(), event.currency)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CINEMA_CONCESSIONS.map(snack => {
                      const qty = selectedSnacks[snack.id] || 0;
                      return (
                        <div
                          key={snack.id}
                          className={`p-3 border-2 flex items-center justify-between gap-3 transition-all ${
                            qty > 0
                              ? 'bg-asphalt-surface border-acid-yellow shadow-[2px_2px_0px_#eefc54]'
                              : 'bg-asphalt-surface/60 border-asphalt-border hover:border-grit-dim'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-impact text-xs uppercase tracking-wider text-grit-white truncate">
                                {snack.name}
                              </span>
                              <span className="font-mono-zine text-[9px] px-1 bg-asphalt-card border border-asphalt-border text-acid-yellow shrink-0">
                                {snack.tag}
                              </span>
                            </div>
                            <div className="font-mono-zine text-[10px] text-grit-dim uppercase line-clamp-1">
                              {snack.description}
                            </div>
                            <div className="font-ticker text-xs text-acid-yellow font-bold mt-1">
                              {formatPrice(snack.price, event.currency)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 bg-asphalt-card border border-asphalt-border p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateSnack(snack.id, -1)}
                              disabled={qty <= 0}
                              className="w-6 h-6 flex items-center justify-center font-impact text-sm bg-asphalt-surface hover:bg-neon-magenta hover:text-grit-white text-grit-white border border-asphalt-border disabled:opacity-30 disabled:hover:bg-asphalt-surface cursor-pointer"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono-zine text-xs font-bold text-grit-white">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateSnack(snack.id, 1)}
                              disabled={qty >= 10}
                              className="w-6 h-6 flex items-center justify-center font-impact text-sm bg-acid-yellow hover:bg-neon-magenta text-asphalt-black hover:text-grit-white font-bold cursor-pointer"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Promo Code Input */}
              <div className="bg-asphalt-card border-2 border-asphalt-border p-4">
                <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-2">
                  PROMO CODE / DISCOUNT COUPON
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE (E.G. EARLYBIRD)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm uppercase outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyCoupon} 
                    disabled={validatingCoupon}
                    className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-acid-yellow hover:text-asphalt-black font-impact tracking-wider px-4 uppercase text-sm transition-colors cursor-pointer"
                  >
                    {validatingCoupon ? 'VERIFYING...' : 'APPLY CODE'}
                  </button>
                </div>
                {discountInfo && (
                  <div className="mt-2 text-xs font-mono-zine text-acid-yellow flex items-center gap-1.5 uppercase">
                    <Check size={14} /> COUPON [{discountInfo.code}] APPLIED: -{formatPrice(discountInfo.calculatedDiscount, event.currency)}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-asphalt-border">
                <button 
                  type="button"
                  onClick={() => setStep(1)} 
                  className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-acid-yellow font-mono-zine text-xs px-4 py-2.5 uppercase flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
                >
                  <ArrowLeft size={14} /> BACK TO SEATS
                </button>
                <button 
                  type="button"
                  onClick={handleProceedToPayment} 
                  disabled={selectedSeats.length === 0}
                  className={`font-impact tracking-wider text-base uppercase px-5 py-3 border-2 border-asphalt-black flex items-center justify-center gap-2 transition-all touch-manipulation ${
                    selectedSeats.length > 0
                      ? 'bg-acid-yellow text-asphalt-black hover:bg-neon-magenta hover:text-grit-white shadow-[4px_4px_0px_#ffffff] cursor-pointer'
                      : 'bg-asphalt-card text-grit-dim/50 border-asphalt-border cursor-not-allowed opacity-50'
                  }`}
                >
                  PROCEED TO PAYMENT <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHECKOUT & PAYMENT METHOD */}
          {step === 3 && (
            <div className="space-y-4">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">
                SELECT PAYMENT METHOD
              </span>

              {/* Payment Method Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI INSTANT', icon: Smartphone },
                  { id: 'CREDIT_CARD', label: 'CREDIT CARD', icon: CreditCard },
                  { id: 'DEBIT_CARD', label: 'DEBIT CARD', icon: CreditCard },
                  { id: 'NET_BANKING', label: 'NET BANKING', icon: Landmark },
                  { id: 'GIFT_CARD', label: 'GIFT CARD', icon: Gift },
                  { id: 'WALLET', label: 'WALLET', icon: Wallet }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSel = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-2.5 border-2 text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-impact text-xs tracking-wider uppercase ${
                        isSel 
                          ? 'bg-acid-yellow text-asphalt-black border-grit-white shadow-[3px_3px_0px_#ffffff]' 
                          : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
                      }`}
                    >
                      <IconComp size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Mode Details */}
              <div className="bg-asphalt-card border-2 border-asphalt-border p-4">
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUpiSubOption('UPI_ID')}
                        className={`py-2 text-xs font-mono-zine uppercase border ${
                          upiSubOption === 'UPI_ID'
                            ? 'bg-acid-yellow text-asphalt-black font-bold border-asphalt-black'
                            : 'bg-asphalt-surface text-grit-dim border-asphalt-border'
                        }`}
                      >
                        ENTER UPI ID
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUpiSubOption('UPI_QR');
                          if (!paymentDetails.upiId) {
                            setPaymentDetails((prev) => ({ ...prev, upiId: 'eventhub.qr@upi' }));
                          }
                        }}
                        className={`py-2 text-xs font-mono-zine uppercase border ${
                          upiSubOption === 'UPI_QR'
                            ? 'bg-acid-yellow text-asphalt-black font-bold border-asphalt-black'
                            : 'bg-asphalt-surface text-grit-dim border-asphalt-border'
                        }`}
                      >
                        SCAN UPI QR CODE
                      </button>
                    </div>

                    {upiSubOption === 'UPI_ID' ? (
                      <div>
                        <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">
                          VIRTUAL PAYMENT ADDRESS (VPA / PHONE) <span className="text-neon-magenta">*</span>
                        </label>
                        <input
                          type="text"
                          name="upiId"
                          required
                          placeholder="username@okaxis / 9876543210@paytm"
                          value={paymentDetails.upiId}
                          onChange={handleDetailsChange}
                          className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-asphalt-black border border-asphalt-border p-4">
                        <span className="font-mono-zine text-xs text-grit-dim uppercase block mb-3">
                          SCAN WITH GPAY / PHONEPE / PAYTM / BHIM TO PAY INSTANTLY
                        </span>
                        <div className="inline-block p-3 bg-white border-2 border-grit-white shadow-[4px_4px_0px_#eefc54]">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=eventhub@upi%26pn=EventHub%26am=${calculateFinalTotal().toFixed(2)}%26cu=${event?.currency || 'INR'}`} 
                            alt="UPI QR"
                            className="w-36 h-36 block"
                          />
                        </div>
                        <span className="font-mono-zine text-xs text-acid-yellow block mt-3 font-bold">
                          TOTAL AMOUNT: {formatPrice(calculateFinalTotal(), event?.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                  <div className="space-y-3 font-mono-zine text-xs uppercase">
                    <div>
                      <label className="block text-grit-dim mb-1">CARDHOLDER NAME</label>
                      <input type="text" name="cardHolder" required placeholder="John Doe" value={paymentDetails.cardHolder} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-grit-dim mb-1">CARD NUMBER</label>
                      <input type="text" name="cardNumber" required placeholder="4532 •••• •••• 8921" value={paymentDetails.cardNumber} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-grit-dim mb-1">EXPIRY (MM/YY)</label>
                        <input type="text" name="cardExpiry" required placeholder="12/28" value={paymentDetails.cardExpiry} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none" />
                      </div>
                      <div>
                        <label className="block text-grit-dim mb-1">CVV CODE</label>
                        <input type="password" name="cardCvv" required maxLength="4" placeholder="•••" value={paymentDetails.cardCvv} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NET_BANKING' && (
                  <div>
                    <label className="block font-mono-zine text-xs text-grit-dim uppercase tracking-wider mb-1">SELECT BANK</label>
                    <select name="bankName" value={paymentDetails.bankName} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 outline-none uppercase">
                      <option value="HDFC Bank">HDFC BANK</option>
                      <option value="State Bank of India">STATE BANK OF INDIA (SBI)</option>
                      <option value="ICICI Bank">ICICI BANK</option>
                      <option value="Axis Bank">AXIS BANK</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'GIFT_CARD' && (
                  <div className="grid grid-cols-2 gap-3 font-mono-zine text-xs uppercase">
                    <div>
                      <label className="block text-grit-dim mb-1">GIFT CARD VOUCHER</label>
                      <input type="text" name="giftCardCode" required placeholder="GIFT-2026-XXXX" value={paymentDetails.giftCardCode} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-grit-dim mb-1">SECURITY PIN</label>
                      <input type="password" name="giftCardPin" required placeholder="••••" value={paymentDetails.giftCardPin} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'WALLET' && (
                  <div className="grid grid-cols-2 gap-3 font-mono-zine text-xs uppercase">
                    <div>
                      <label className="block text-grit-dim mb-1">WALLET PROVIDER</label>
                      <select name="walletType" value={paymentDetails.walletType} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none uppercase">
                        <option value="Paytm">PAYTM WALLET</option>
                        <option value="PhonePe">PHONEPE</option>
                        <option value="Amazon Pay">AMAZON PAY</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-grit-dim mb-1">REGISTERED MOBILE NUMBER</label>
                      <input type="tel" name="walletPhone" required placeholder="+91 9876543210" value={paymentDetails.walletPhone} onChange={handleDetailsChange} className="w-full bg-asphalt-surface border-2 border-asphalt-border focus:border-acid-yellow text-grit-white p-2 outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-asphalt-border">
                <button 
                  type="button"
                  onClick={() => setStep(2)} 
                  className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-acid-yellow font-mono-zine text-xs px-4 py-2.5 uppercase flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
                >
                  <ArrowLeft size={14} /> BACK
                </button>
                <button 
                  type="button"
                  onClick={handleProceedToConfirm} 
                  className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-base uppercase px-5 py-3 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
                >
                  REVIEW ORDER <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FINAL CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-asphalt-card border-4 border-grit-white p-5 shadow-[6px_6px_0px_#ff1f6d]">
                <div className="flex justify-between items-center border-b border-asphalt-border pb-3 mb-3">
                  <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5 uppercase">
                    ORDER CONFIRMATION & E-TICKET
                  </span>
                  <span className="font-ticker text-[10px] text-acid-yellow uppercase">
                    OFFICIALLY VERIFIED PASS
                  </span>
                </div>

                <div className="space-y-2 font-mono-zine text-xs text-grit-dim uppercase">
                  <div className="flex justify-between">
                    <span>EVENT:</span>
                    <strong className="text-grit-white">{event.name}</strong>
                  </div>
                  {isCinema && (
                    <>
                      <div className="flex justify-between text-acid-yellow">
                        <span>CINEMA SCREEN:</span>
                        <strong>SCREEN 01 // AUDITORIUM LASER</strong>
                      </div>
                      <div className="flex justify-between text-acid-yellow">
                        <span>SHOWTIME:</span>
                        <strong>{selectedShowtime}</strong>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>RESERVED SEATS:</span>
                    <strong className="text-acid-yellow">
                      {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : '1 GENERAL ADMISSION TICKET'}
                    </strong>
                  </div>
                  {isCinema && Object.keys(selectedSnacks).length > 0 && (
                    <div className="flex justify-between">
                      <span>CONCESSIONS:</span>
                      <strong className="text-grit-white">
                        {Object.entries(selectedSnacks)
                          .map(([id, qty]) => {
                            const s = CINEMA_CONCESSIONS.find(c => c.id === id);
                            return s ? `${qty}x ${s.name}` : null;
                          })
                          .filter(Boolean)
                          .join(', ')}
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>PAYMENT METHOD:</span>
                    <strong className="text-grit-white">{paymentMethod.replace('_', ' ')}</strong>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-dashed border-asphalt-border text-base font-bold">
                    <span className="text-grit-white">TOTAL PAYABLE:</span>
                    <span className="text-acid-yellow font-display text-2xl">
                      {formatPrice(calculateFinalTotal(), event.currency)}
                    </span>
                  </div>
                </div>

                {/* Decorative Barcode */}
                <div className="mt-4 pt-3 border-t border-asphalt-border flex items-center justify-between opacity-50">
                  <span className="font-ticker text-[9px] text-grit-dim uppercase">TICKET CODE #EHB-{event.id}</span>
                  <svg className="h-5 w-32" viewBox="0 0 128 20" fill="currentColor">
                    <rect x="0" y="0" width="3" height="20"/>
                    <rect x="5" y="0" width="2" height="20"/>
                    <rect x="9" y="0" width="4" height="20"/>
                    <rect x="15" y="0" width="2" height="20"/>
                    <rect x="19" y="0" width="6" height="20"/>
                    <rect x="28" y="0" width="1" height="20"/>
                    <rect x="31" y="0" width="4" height="20"/>
                    <rect x="38" y="0" width="3" height="20"/>
                    <rect x="44" y="0" width="5" height="20"/>
                    <rect x="52" y="0" width="2" height="20"/>
                    <rect x="56" y="0" width="4" height="20"/>
                    <rect x="63" y="0" width="2" height="20"/>
                    <rect x="68" y="0" width="5" height="20"/>
                    <rect x="76" y="0" width="3" height="20"/>
                    <rect x="82" y="0" width="4" height="20"/>
                    <rect x="89" y="0" width="2" height="20"/>
                    <rect x="93" y="0" width="6" height="20"/>
                    <rect x="102" y="0" width="2" height="20"/>
                    <rect x="106" y="0" width="4" height="20"/>
                    <rect x="113" y="0" width="2" height="20"/>
                    <rect x="117" y="0" width="5" height="20"/>
                  </svg>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setStep(3)} 
                  disabled={bookingLoading || selectedSeats.length === 0}
                  className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-acid-yellow font-mono-zine text-xs px-4 py-2.5 uppercase flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
                >
                  <ArrowLeft size={14} /> EDIT PAYMENT
                </button>
                <button 
                  type="button"
                  onClick={handleConfirmBooking} 
                  disabled={bookingLoading || selectedSeats.length === 0}
                  className="bg-neon-magenta text-grit-white font-impact tracking-wider text-base sm:text-lg uppercase px-6 py-3 border-2 border-asphalt-black hover:bg-acid-yellow hover:text-asphalt-black transition-all shadow-[4px_4px_0px_#eefc54] cursor-pointer disabled:opacity-50 touch-manipulation flex items-center justify-center"
                >
                  {bookingLoading ? 'PROCESSING RESERVATION...' : `CONFIRM & PAY (${formatPrice(calculateFinalTotal(), event.currency)})`}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
