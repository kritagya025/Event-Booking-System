import React, { useState, useEffect } from 'react';
import { X, Check, Tag, ArrowRight, Zap, ArrowLeft, CreditCard, Wallet, Smartphone, Landmark, Gift, ShieldCheck } from 'lucide-react';
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
    if (!event.venueId && !event.venue?.id) return;
    const vId = event.venueId || event.venue?.id || 1;
    setLoadingSeats(true);

    try {
      const data = await apiFetch(`/seats/venue/${vId}`);
      if (data && data.length > 0) {
        const formatted = data.map(s => ({
          ...s,
          price: s.seatType === 'VIP' ? (event.ticketPrice * 1.5) : event.ticketPrice
        }));
        setSeatMap(formatted);
      } else {
        generateFallbackSeats();
      }
    } catch (err) {
      generateFallbackSeats();
    } finally {
      setLoadingSeats(false);
    }
  };

  const generateFallbackSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const generated = [];
    let counter = 1;

    rows.forEach((row, rIdx) => {
      for (let num = 1; num <= 8; num++) {
        generated.push({
          id: counter++,
          seatNumber: `${row}${num}`,
          rowNumber: row,
          seatType: rIdx === 0 ? 'VIP' : 'REGULAR',
          status: 'AVAILABLE',
          price: rIdx === 0 ? (event.ticketPrice * 1.5) : event.ticketPrice
        });
      }
    });
    setSeatMap(generated);
  };

  if (!isOpen || !event) return null;

  const toggleSeatSelection = (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'LOCKED') {
      showToast(`Seat ${seat.seatNumber} is unavailable`, 'error');
      return;
    }

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        showToast('Maximum 6 seats per booking', 'info');
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

      showToast(`Coupon applied — saved ${formatPrice(discountAmount, event.currency)}`, 'success');
    } catch (err) {
      showToast(err.message || 'Invalid coupon code', 'error');
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
      showToast('Please sign in to complete your booking', 'info');
      return;
    }

    setBookingLoading(true);

    try {
      const payload = {
        userId: currentUser.id || 1,
        eventId: event.id,
        quantity: selectedSeats.length > 0 ? selectedSeats.length : 1,
        seatIds: selectedSeats.map(s => s.id),
        couponCode: discountInfo ? discountInfo.code : null
      };

      const bookingResult = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({ bookingId: bookingResult.id, paymentMethod })
      });

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      showToast('Payment successful! Your QR ticket is ready.', 'success');
      if (onBookingSuccess) onBookingSuccess(bookingResult);
      onClose();
    } catch (err) {
      showToast(err.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  // Group seats by row for display
  const rowsList = Array.from(new Set(seatMap.map(s => s.rowNumber || 'A'))).sort();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', width: '100%' }}>
        
        {/* Header with Step Progress */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{event.name}</h3>
              <span className="badge badge-purple pulse-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={10} /> Live
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {event.venueName || 'Main Venue'} · {availableCount} seats available
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 24px', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span style={{ color: step >= 1 ? '#FFF' : 'inherit', fontWeight: step === 1 ? '700' : '400' }}>1. Select Seats</span>
          <span>→</span>
          <span style={{ color: step >= 2 ? '#FFF' : 'inherit', fontWeight: step === 2 ? '700' : '400' }}>2. Review</span>
          <span>→</span>
          <span style={{ color: step >= 3 ? '#FFF' : 'inherit', fontWeight: step === 3 ? '700' : '400' }}>3. Checkout</span>
          <span>→</span>
          <span style={{ color: step >= 4 ? '#FFF' : 'inherit', fontWeight: step === 4 ? '700' : '400' }}>4. Confirm</span>
        </div>

        <div className="modal-body">
          
          {/* STEP 1: SELECT SEATS */}
          {step === 1 && (
            <div>
              {loadingSeats ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading live seat availability...</div>
              ) : (
                <div className="seat-map-container">
                  <div className="stage-screen">STAGE</div>

                  <div className="seats-grid">
                    {rowsList.map((row) => (
                      <div key={row} className="seat-row">
                        <span className="row-label">{row}</span>
                        {seatMap.filter(s => s.rowNumber === row).map((seat) => {
                          const isSelected = selectedSeats.some(s => s.id === seat.id);
                          let classNames = 'seat-btn ';
                          if (isSelected) classNames += 'seat-selected';
                          else if (seat.status === 'AVAILABLE') classNames += 'seat-available';
                          else if (seat.status === 'LOCKED') classNames += 'seat-locked';
                          else if (seat.status === 'BOOKED') classNames += 'seat-booked';

                          return (
                            <button
                              key={seat.id}
                              className={classNames}
                              onClick={() => toggleSeatSelection(seat)}
                              title={`${seat.seatNumber} (${seat.seatType}) — ${formatPrice(seat.price, event.currency)}`}
                            >
                              {seat.seatNumber.replace(/^[A-Z]+/, '')}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div className="seat-btn seat-available" style={{ width: '14px', height: '14px' }} /> Available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div className="seat-btn seat-selected" style={{ width: '14px', height: '14px' }} /> Selected
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div className="seat-btn seat-locked" style={{ width: '14px', height: '14px' }} /> Locked
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div className="seat-btn seat-booked" style={{ width: '14px', height: '14px' }} /> Booked
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                    {selectedSeats.length > 0 ? `${selectedSeats.length} seat(s): ${selectedSeats.map(s => s.seatNumber).join(', ')}` : 'General Admission (1)'}
                  </span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFF' }}>
                    {formatPrice(calculateSubtotal(), event.currency)}
                  </span>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  Review Booking <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW BOOKING & PROMO */}
          {step === 2 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Review Booking Details</h4>
              
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Event:</span> <strong>{event.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Date & Time:</span> <span>{event.eventDate} @ {event.startTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Selected Seats:</span> <span>{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : '1 Seat'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>Ticket Subtotal:</span> <strong>{formatPrice(calculateSubtotal(), event.currency)}</strong>
                </div>
              </div>

              {/* Promo Code Input */}
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={13} color="var(--text-secondary)" /> Promo Code
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="form-input"
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button type="button" onClick={handleApplyCoupon} className="btn btn-secondary" disabled={validatingCoupon}>
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {discountInfo && (
                  <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={13} /> {discountInfo.code} applied (-{formatPrice(discountInfo.calculatedDiscount, event.currency)})
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary">
                  <ArrowLeft size={16} /> Back to Seats
                </button>
                <button onClick={() => setStep(3)} className="btn btn-primary">
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHECKOUT & PAYMENT METHOD */}
          {step === 3 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Choose Payment Method & Details</h4>

              {/* Payment Method Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {[
                  { id: 'UPI', label: 'UPI', icon: Smartphone },
                  { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                  { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
                  { id: 'NET_BANKING', label: 'Net Banking', icon: Landmark },
                  { id: 'GIFT_CARD', label: 'Gift Card', icon: Gift },
                  { id: 'WALLET', label: 'Wallet', icon: Wallet }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSel = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`btn ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '10px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                    >
                      <IconComp size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Fields */}
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', marginBottom: '20px' }}>
                {paymentMethod === 'UPI' && (
                  <div className="form-group">
                    <label className="form-label">UPI Virtual Payment Address (VPA)<span style={{ color: '#ef4444' }}> *</span></label>
                    <input
                      type="text"
                      name="upiId"
                      required
                      placeholder="e.g. username@okaxis / 9876543210@paytm"
                      value={paymentDetails.upiId}
                      onChange={handleDetailsChange}
                      className="form-input"
                    />
                  </div>
                )}

                {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Cardholder Name<span style={{ color: '#ef4444' }}> *</span></label>
                      <input type="text" name="cardHolder" required placeholder="John Doe" value={paymentDetails.cardHolder} onChange={handleDetailsChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Card Number<span style={{ color: '#ef4444' }}> *</span></label>
                      <input type="text" name="cardNumber" required placeholder="4532 •••• •••• 8921" value={paymentDetails.cardNumber} onChange={handleDetailsChange} className="form-input" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry (MM/YY)<span style={{ color: '#ef4444' }}> *</span></label>
                        <input type="text" name="cardExpiry" required placeholder="12/28" value={paymentDetails.cardExpiry} onChange={handleDetailsChange} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV<span style={{ color: '#ef4444' }}> *</span></label>
                        <input type="password" name="cardCvv" required maxLength="4" placeholder="123" value={paymentDetails.cardCvv} onChange={handleDetailsChange} className="form-input" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NET_BANKING' && (
                  <div className="form-group">
                    <label className="form-label">Select Bank<span style={{ color: '#ef4444' }}> *</span></label>
                    <select name="bankName" value={paymentDetails.bankName} onChange={handleDetailsChange} className="form-select">
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'GIFT_CARD' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Gift Card Voucher Code<span style={{ color: '#ef4444' }}> *</span></label>
                      <input type="text" name="giftCardCode" required placeholder="GIFT-2026-XXXX" value={paymentDetails.giftCardCode} onChange={handleDetailsChange} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Security PIN<span style={{ color: '#ef4444' }}> *</span></label>
                      <input type="password" name="giftCardPin" required placeholder="••••" value={paymentDetails.giftCardPin} onChange={handleDetailsChange} className="form-input" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'WALLET' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Wallet Service<span style={{ color: '#ef4444' }}> *</span></label>
                      <select name="walletType" value={paymentDetails.walletType} onChange={handleDetailsChange} className="form-select">
                        <option value="Paytm">Paytm</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Amazon Pay">Amazon Pay</option>
                        <option value="MobiKwik">MobiKwik</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Linked Mobile Number<span style={{ color: '#ef4444' }}> *</span></label>
                      <input type="tel" name="walletPhone" required placeholder="+91 9876543210" value={paymentDetails.walletPhone} onChange={handleDetailsChange} className="form-input" />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setStep(2)} className="btn btn-secondary">
                  <ArrowLeft size={16} /> Back to Review
                </button>
                <button onClick={() => setStep(4)} className="btn btn-primary">
                  Review & Confirm <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: FINAL CONFIRMATION */}
          {step === 4 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="var(--accent-purple, #a855f7)" /> Final Booking Confirmation
              </h4>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span>Event:</span> <strong>{event.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span>Seats:</span> <strong>{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : '1 General Ticket'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span>Payment Method:</span> <strong>{paymentMethod.replace('_', ' ')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span>Total Payable:</span> <span style={{ color: '#FFF' }}>{formatPrice(calculateFinalTotal(), event.currency)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setStep(3)} className="btn btn-secondary" disabled={bookingLoading}>
                  <ArrowLeft size={16} /> Edit Payment
                </button>
                <button onClick={handleConfirmBooking} className="btn btn-primary btn-lg" disabled={bookingLoading}>
                  {bookingLoading ? 'Processing...' : `Confirm & Pay ${formatPrice(calculateFinalTotal(), event.currency)}`}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
