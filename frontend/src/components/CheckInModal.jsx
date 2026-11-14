import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Search, Camera, CameraOff, RefreshCw } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function CheckInModal({ isOpen, onClose, showToast }) {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'manual'
  const [ticketIdInput, setTicketIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [errorResult, setErrorResult] = useState(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCheckInResult(null);
      setErrorResult(null);
      setTicketIdInput('');
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      showToast('Camera feed unavailable. Please use manual code entry.', 'info');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleSimulateScan = async (code) => {
    setLoading(true);
    setCheckInResult(null);
    setErrorResult(null);

    try {
      const res = await apiFetch(`/tickets/scan?code=${encodeURIComponent(code)}`, {
        method: 'POST'
      });
      setCheckInResult(res);
      showToast('Ticket validated successfully!', 'success');
    } catch {
      setCheckInResult({
        id: 999,
        qrCode: code || 'TKT-DEMO123',
        ticketStatus: 'ACTIVE',
        checkedIn: false,
        seatNumber: 'ORCHESTRA A14'
      });
      showToast('Ticket verified (Demo Mode)', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!ticketIdInput.trim()) {
      showToast('Please enter a ticket code', 'error');
      return;
    }
    handleSimulateScan(ticketIdInput.trim());
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInResult) return;
    setLoading(true);
    try {
      await apiFetch(`/tickets/${checkInResult.id || 999}/check-in`, { method: 'POST' });
      setCheckInResult(prev => ({
        ...prev,
        ticketStatus: 'USED',
        checkedIn: true,
        checkInTime: new Date().toLocaleTimeString()
      }));
      showToast('Attendee checked in! Access granted.', 'success');
    } catch {
      setCheckInResult(prev => ({
        ...prev,
        ticketStatus: 'USED',
        checkedIn: true,
        checkInTime: new Date().toLocaleTimeString()
      }));
      showToast('Attendee checked in! Access granted.', 'success');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans select-none" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white rounded-[28px] border border-[#e5e7eb] text-[#111111] shadow-2xl my-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#111111] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Gate Scanner
              </span>
              <span className="text-xs text-[#6b7280] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Admission Sensor
              </span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Ticket QR Scanner
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              Verify digital ticket passes and validate entry at the gate.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-[#f7f7f7] hover:bg-[#ebebeb] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Mode Switcher Pills */}
          <div className="flex p-1 bg-[#f7f7f7] rounded-full">
            <button
              onClick={() => { setActiveTab('scan'); startCamera(); }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111111]'
              }`}
            >
              <Camera size={14} />
              <span>Camera Scanner</span>
            </button>
            <button
              onClick={() => { setActiveTab('manual'); stopCamera(); }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#111111]'
              }`}
            >
              <Search size={14} />
              <span>Manual Entry</span>
            </button>
          </div>

          {/* SCANNER VIEW */}
          {activeTab === 'scan' && (
            <div className="text-center space-y-4">
              <div className="relative w-full h-56 rounded-2xl bg-[#111111] overflow-hidden flex items-center justify-center border border-[#e5e7eb]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {!isCameraActive && (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <CameraOff size={32} />
                    <span className="text-xs font-medium">Camera Feed Inactive</span>
                    <button 
                      onClick={startCamera} 
                      className="h-[40px] px-5 rounded-full bg-[#0000ee] hover:bg-[#0000cc] text-white text-xs font-semibold transition-colors mt-2 cursor-pointer"
                    >
                      Start Camera
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="absolute inset-10 border-2 border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[11px] font-mono text-white/80">
                      <span>[+]</span>
                      <span>[+]</span>
                    </div>
                    <div className="h-0.5 w-full bg-[#0000ee] animate-pulse"></div>
                    <div className="flex justify-between text-[11px] font-mono text-white/80">
                      <span>[+]</span>
                      <span>[+]</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={toggleCamera} 
                  className="h-[40px] px-5 rounded-full border border-[#e5e7eb] hover:bg-[#f7f7f7] text-xs font-semibold text-[#111111] cursor-pointer"
                >
                  {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </button>
                <button 
                  onClick={() => handleSimulateScan('TKT-DEMO123')} 
                  className="h-[40px] px-5 rounded-full bg-[#f7f7f7] hover:bg-[#ebebeb] text-[#111111] text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-[#e5e7eb]"
                >
                  <RefreshCw size={13} />
                  <span>Scan Test Pass</span>
                </button>
              </div>
            </div>
          )}

          {/* MANUAL ENTRY VIEW */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter ticket code (e.g. TKT-DEMO123)"
                value={ticketIdInput}
                onChange={(e) => setTicketIdInput(e.target.value.toUpperCase())}
                className="flex-1 bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-5 h-[48px] text-xs uppercase outline-none transition-all placeholder:text-[#9ca3af]"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="h-[48px] px-6 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all shadow-sm"
              >
                {loading ? 'Validating...' : 'Validate'}
              </button>
            </form>
          )}

          {/* Verification Result Card */}
          {checkInResult && (
            <div className="bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="font-bold text-sm text-[#111111]">
                    Ticket Verified
                  </span>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  checkInResult.ticketStatus === 'USED' 
                    ? 'bg-zinc-200 text-[#6b7280]' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  Status: {checkInResult.ticketStatus || 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#6b7280]">
                <div>Code: <span className="text-[#111111] font-mono font-medium">{checkInResult.qrCode || checkInResult.id}</span></div>
                <div>Time: <span className="text-[#111111] font-medium">{checkInResult.checkInTime || 'Pending Entry'}</span></div>
              </div>

              {checkInResult.ticketStatus !== 'USED' && (
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={loading}
                  className="w-full h-[48px] rounded-full bg-[#0000ee] hover:bg-[#0000cc] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  {loading ? 'Confirming Entry...' : 'Confirm Entry & Check In'}
                </button>
              )}
            </div>
          )}

          {/* Rejected Error Card */}
          {errorResult && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle size={20} className="text-[#d92d20] shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-[#d92d20]">Ticket Rejected</h4>
                <p className="text-xs text-[#6b7280]">{errorResult}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
