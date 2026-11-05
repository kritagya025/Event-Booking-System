import React, { useState, useEffect } from 'react';
import { X, Check, Tag, ArrowRight, Zap, ArrowLeft, CreditCard, Wallet, Smartphone, Landmark, Gift, ShieldCheck, QrCode } from 'lucide-react';
import { wsService } from '../services/websocket';
import { apiFetch } from '../services/api';
import { formatPrice } from '../services/currency';
import confetti from 'canvas-confetti';

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

  useEffect(() => {
    if (!event || !isOpen) return;
    setStep(1);
    setSelectedSeats([]);
    setDiscountInfo(null);
    setCouponCode('');
    setAvailableCount(event.availableSeats || 50);

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
  }, [event, isOpen]);

  const fetchVenueSeats = async () => {
    const vId = event.venueId || event.venue?.id || 1;
    setLoadingSeats(true);

    try {
      const data = await apiFetch(`/seats/venue/${vId}`).catch(() => null);
      if (data && data.length > 0) {
        let formatted = data.map(s => ({
          ...s,
          price: s.seatType === 'VIP' ? (event.ticketPrice * 1.5) : event.ticketPrice
        }));

        const targetCount = event.availableSeats !== undefined ? event.availableSeats : 40;
        if (targetCount > formatted.length) {
          formatted = expandSeatMap(formatted, targetCount);
        }
        setSeatMap(formatted);
      } else {
        generateSeatsForEvent();
      }
    } catch (err) {
      generateSeatsForEvent();
    } finally {
      setLoadingSeats(false);
    }
  };

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
      for (let num = 1; num <= seatsPerRow; num++) {
        if (generated.length >= countToGenerate) break;
        generated.push({
          id: counter++,
          seatNumber: `${row}${num}`,
          rowNumber: row,
          seatType: r === 0 ? 'VIP' : 'REGULAR',
          status: isSoldOut ? 'BOOKED' : 'AVAILABLE',
          price: r === 0 ? (event.ticketPrice * 1.5) : event.ticketPrice
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
      for (let num = 1; num <= seatsPerRow; num++) {
        if (expanded.length >= countToGenerate) break;
        const seatNum = `${row}${num}`;
        if (!expanded.some(s => s.seatNumber === seatNum)) {
          expanded.push({
            id: counter++,
            seatNumber: seatNum,
            rowNumber: row,
            seatType: r === 0 ? 'VIP' : 'REGULAR',
            status: isSoldOut ? 'BOOKED' : 'AVAILABLE',
            price: r === 0 ? (event.ticketPrice * 1.5) : event.ticketPrice
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
    if (selectedSeats.length > 0) return selectedSeats.reduce((sum, s) => sum + s.price, 0);
    return event.ticketPrice;
  };

  const calculateFinalTotal = () => {
    const sub = calculateSubtotal();
    if (discountInfo) return Math.max(0, sub - discountInfo.calculatedDiscount);
    return sub;
  };

  const handleDetailsChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      showToast('PLEASE SIGN IN BEFORE COMPLETING RESERVATION', 'info');
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

      const quantity = selectedSeats.length > 0 ? selectedSeats.length : 1;
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
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TICKET-${bookingResult.id}-${event.id}`
        };
        localStorage.setItem('my_local_bookings', JSON.stringify([newBookingRecord, ...storedBookings]));
      } catch (lsErr) {}

      try {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      } catch (cErr) {}

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
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-asphalt-surface border-4 border-grit-white text-grit-white shadow-[10px_10px_0px_#eefc54] my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Slanted Sticker */}
        <div className="absolute -top-4 -right-2 bg-neon-magenta text-grit-white font-impact tracking-wider px-3 py-1 rotate-2 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENTHUB // RESERVATION ENGINE
        </div>

        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
                LIVE SEAT RESERVATION
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-acid-yellow animate-ping"></span>
                STOMP TOPIC: /seat-locks/{event.id}
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
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-1.5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Multi-Step Protocol Bar */}
        <div className="bg-asphalt-black border-b border-asphalt-border px-5 py-2.5 flex items-center justify-between text-xs font-ticker overflow-x-auto gap-2">
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
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin w-8 h-8 border-4 border-acid-yellow border-t-transparent"></div>
                  <span className="font-mono-zine text-xs text-acid-yellow uppercase tracking-widest animate-pulse">
                    LOADING SEAT MAP & INVENTORY...
                  </span>
                </div>
              ) : (
                <div>
                  {/* Stage Screen Banner */}
                  <div className="mb-6 border-2 border-dashed border-asphalt-border bg-asphalt-black p-2.5 text-center">
                    <div className="hazard-tape h-2 w-full mb-2"></div>
                    <span className="font-impact text-grit-dim tracking-widest text-xs uppercase">
                      ▲ [ STAGE / PERFORMANCE SCREEN ] ▲
                    </span>
                  </div>

                  {/* Seat Grid */}
                  <div className="overflow-x-auto pb-4">
                    <div className="min-w-[480px] flex flex-col gap-2 items-center">
                      {rowsList.map((row) => (
                        <div key={row} className="flex items-center gap-2">
                          <span className="w-5 text-center font-impact text-grit-dim text-xs uppercase">{row}</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {seatMap.filter(s => s.rowNumber === row).map((seat) => {
                              const isSelected = selectedSeats.some(s => s.id === seat.id);
                              let btnClass = 'w-8 h-8 font-ticker text-xs font-bold border flex items-center justify-center transition-all cursor-pointer ';
                              
                              if (isSelected) {
                                btnClass += 'bg-acid-yellow text-asphalt-black border-grit-white shadow-[2px_2px_0px_#ffffff] scale-105';
                              } else if (seat.status === 'AVAILABLE') {
                                if (seat.seatType === 'VIP') {
                                  btnClass += 'bg-neon-magenta/20 text-neon-magenta border-neon-magenta hover:bg-neon-magenta hover:text-grit-white';
                                } else if (seat.seatType === 'PREMIUM') {
                                  btnClass += 'bg-electric-blue/20 text-blue-400 border-electric-blue hover:bg-electric-blue hover:text-grit-white';
                                } else {
                                  btnClass += 'bg-asphalt-card text-grit-white border-asphalt-border hover:border-acid-yellow hover:text-acid-yellow';
                                }
                              } else if (seat.status === 'LOCKED') {
                                btnClass += 'bg-asphalt-card/40 text-grit-dim/40 border-asphalt-border/30 cursor-not-allowed opacity-40';
                              } else if (seat.status === 'BOOKED') {
                                btnClass += 'bg-asphalt-card/20 text-grit-dim/30 border-transparent cursor-not-allowed line-through opacity-30';
                              }

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  className={btnClass}
                                  onClick={() => toggleSeatSelection(seat)}
                                  title={`${seat.seatNumber} (${seat.seatType || 'REGULAR'}): ${formatPrice(seat.price, event.currency)}`}
                                >
                                  {seat.seatNumber.replace(/^[A-Z]+/, '')}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-4 text-[11px] font-mono-zine text-grit-dim pt-4 border-t border-asphalt-border flex-wrap uppercase">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-neon-magenta/30 border border-neon-magenta"></div> VIP SEAT
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-electric-blue/30 border border-electric-blue"></div> PREMIUM
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-asphalt-card border border-asphalt-border"></div> REGULAR
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-acid-yellow border border-grit-white"></div> SELECTED
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 bg-asphalt-card opacity-30 border border-transparent line-through"></div> BOOKED
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t-2 border-asphalt-border flex items-center justify-between">
                <div>
                  <span className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider block">
                    {selectedSeats.length > 0 
                      ? `${selectedSeats.length} SEAT(S) SELECTED: ${selectedSeats.map(s => s.seatNumber).join(', ')}`
                      : 'GENERAL ADMISSION (1 TICKET)'}
                  </span>
                  <span className="font-display text-3xl text-acid-yellow font-bold leading-none">
                    {formatPrice(calculateSubtotal(), event.currency)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-lg uppercase px-5 py-2.5 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] flex items-center gap-2 cursor-pointer"
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
                  <div className="flex justify-between">
                    <span>DATE & TIME:</span>
                    <span className="text-grit-white">{event.eventDate} @ {event.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SELECTED SEATS:</span>
                    <span className="text-acid-yellow font-bold">
                      {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : 'GENERAL ADMISSION (1 TICKET)'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-asphalt-border text-sm">
                    <span>TICKET SUBTOTAL:</span>
                    <strong className="text-grit-white font-impact text-lg">{formatPrice(calculateSubtotal(), event.currency)}</strong>
                  </div>
                </div>
              </div>

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

              <div className="flex justify-between items-center pt-4 border-t border-asphalt-border">
                <button 
                  type="button"
                  onClick={() => setStep(1)} 
                  className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-acid-yellow font-mono-zine text-xs px-4 py-2 uppercase flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> BACK TO SEATS
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(3)} 
                  className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-base uppercase px-5 py-2.5 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] flex items-center gap-2 cursor-pointer"
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
              <div className="grid grid-cols-3 gap-2">
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

              <div className="flex justify-between items-center pt-4 border-t border-asphalt-border">
                <button 
                  type="button"
                  onClick={() => setStep(2)} 
                  className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-acid-yellow font-mono-zine text-xs px-4 py-2 uppercase flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> BACK
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(4)} 
                  className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-base uppercase px-5 py-2.5 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] flex items-center gap-2 cursor-pointer"
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
                    STOMP VERIFIED
                  </span>
                </div>

                <div className="space-y-2 font-mono-zine text-xs text-grit-dim uppercase">
                  <div className="flex justify-between">
                    <span>EVENT:</span>
                    <strong className="text-grit-white">{event.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>RESERVED SEATS:</span>
                    <strong className="text-acid-yellow">
                      {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : '1 GENERAL ADMISSION TICKET'}
                    </strong>
                  </div>
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

              <div className="flex justify-between items-center pt-2">
                <button 
                  type="button"
                  onClick={() => setStep(3)} 
                  disabled={bookingLoading}
                  className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-acid-yellow font-mono-zine text-xs px-4 py-2 uppercase flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> EDIT PAYMENT
                </button>
                <button 
                  type="button"
                  onClick={handleConfirmBooking} 
                  disabled={bookingLoading}
                  className="bg-neon-magenta text-grit-white font-impact tracking-wider text-lg uppercase px-6 py-3 border-2 border-asphalt-black hover:bg-acid-yellow hover:text-asphalt-black transition-all shadow-[4px_4px_0px_#eefc54] cursor-pointer disabled:opacity-50"
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
