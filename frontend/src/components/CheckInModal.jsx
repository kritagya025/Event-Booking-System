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
      showToast('CAMERA FEED UNAVAILABLE. PLEASE USE MANUAL CODE ENTRY.', 'info');
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

  const handleSimulateScan = (qrCodeString) => {
    setTicketIdInput(qrCodeString);
    validateTicketCode(qrCodeString);
  };

  const validateTicketCode = async (codeStr) => {
    if (!codeStr.trim()) return;

    setLoading(true);
    setCheckInResult(null);
    setErrorResult(null);

    try {
      const res = await apiFetch(`/checkin/validate/${encodeURIComponent(codeStr.trim())}`);
      setCheckInResult(res);
      showToast(`TICKET ${res.qrCode || '#' + res.id} VERIFIED SUCCESSFULLY`, 'success');
    } catch (err) {
      setErrorResult(err.message || 'VALIDATION FAILED: TICKET INVALID OR NOT FOUND');
      showToast(err.message || 'INVALID TICKET CODE', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    validateTicketCode(ticketIdInput);
  };

  const handleConfirmCheckIn = async () => {
    if (!checkInResult && !ticketIdInput.trim()) return;
    const codeToUse = checkInResult?.qrCode || ticketIdInput.trim();
    setLoading(true);

    try {
      const res = await apiFetch(`/checkin/${encodeURIComponent(codeToUse)}`, { method: 'POST' });
      setCheckInResult(res);
      showToast('ATTENDEE CHECKED IN SUCCESSFULLY // ENTRY GRANTED', 'success');
    } catch (err) {
      setErrorResult(err.message || 'CHECK-IN PROCESS FAILED');
      showToast(err.message || 'CHECK-IN FAILED', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto safe-pb touch-scroll select-none" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-asphalt-surface border-2 border-grit-white text-grit-white shadow-[4px_4px_0px_#F43F5E] my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 2D Neo-Brutalist Sticker */}
        <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-3 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-10">
          EVENT GATE CHECK-IN
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5">
                GATE_SCANNER
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-acid-yellow animate-ping"></span>
                ACTIVE SENSOR
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-grit-white mt-1 leading-none">
              TICKET QR SCANNER & ADMISSION
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              OPTICAL BARCODE VERIFICATION & ATTENDEE GATE CHECK-IN
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-2 min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors cursor-pointer touch-manipulation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto touch-scroll">
          
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setActiveTab('scan'); startCamera(); }}
              className={`py-2 px-3 text-xs font-impact tracking-wider uppercase border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'scan'
                  ? 'bg-acid-yellow text-asphalt-black border-grit-white shadow-[3px_3px_0px_#ffffff]'
                  : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
              }`}
            >
              <Camera size={14} /> CAMERA QR SCANNER
            </button>
            <button
              onClick={() => { setActiveTab('manual'); stopCamera(); }}
              className={`py-2 px-3 text-xs font-impact tracking-wider uppercase border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'manual'
                  ? 'bg-acid-yellow text-asphalt-black border-grit-white shadow-[3px_3px_0px_#ffffff]'
                  : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
              }`}
            >
              <Search size={14} /> MANUAL CODE ENTRY
            </button>
          </div>

          {/* SCANNER VIEW */}
          {activeTab === 'scan' && (
            <div className="text-center space-y-3">
              <div className="relative w-full h-48 sm:h-64 bg-asphalt-black border-2 border-dashed border-asphalt-border overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {!isCameraActive && (
                  <div className="flex flex-col items-center gap-2 text-grit-dim">
                    <CameraOff size={32} />
                    <span className="font-mono-zine text-xs uppercase tracking-wider">CAMERA FEED INACTIVE</span>
                    <button 
                      onClick={startCamera} 
                      className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs uppercase px-4 py-1.5 border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white cursor-pointer transition-colors mt-2"
                    >
                      START CAMERA
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <>
                    {/* Viewfinder crosshairs */}
                    <div className="absolute inset-10 border-2 border-acid-yellow pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between text-[10px] font-ticker text-acid-yellow">
                        <span>[+]</span>
                        <span>[+]</span>
                      </div>
                      <div className="hazard-tape h-1 w-full animate-pulse opacity-70"></div>
                      <div className="flex justify-between text-[10px] font-ticker text-acid-yellow">
                        <span>[+]</span>
                        <span>[+]</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button 
                  onClick={toggleCamera} 
                  className="bg-asphalt-card border border-asphalt-border hover:border-grit-white text-grit-white font-mono-zine text-xs px-3 py-2 min-h-[36px] uppercase cursor-pointer flex items-center justify-center touch-manipulation"
                >
                  {isCameraActive ? 'STOP CAMERA' : 'START CAMERA'}
                </button>
                <button 
                  onClick={() => handleSimulateScan('TKT-DEMO123')} 
                  className="bg-asphalt-card border border-acid-yellow text-acid-yellow hover:bg-acid-yellow hover:text-asphalt-black font-mono-zine text-xs px-3 py-2 min-h-[36px] uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors touch-manipulation"
                >
                  <RefreshCw size={12} /> SCAN TEST TICKET
                </button>
              </div>
            </div>
          )}

          {/* MANUAL ENTRY VIEW */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="ENTER TICKET CODE (E.G. TKT-DEMO123)"
                value={ticketIdInput}
                onChange={(e) => setTicketIdInput(e.target.value.toUpperCase())}
                className="flex-1 bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-xs uppercase outline-none"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-acid-yellow text-asphalt-black font-impact tracking-wider px-4 min-h-[38px] text-sm uppercase border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white cursor-pointer disabled:opacity-50 touch-manipulation"
              >
                {loading ? 'VALIDATING...' : 'VALIDATE'}
              </button>
            </form>
          )}

          {/* Verification Result Card */}
          {checkInResult && (
            <div className="bg-asphalt-card border-2 border-acid-yellow p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-asphalt-border pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-acid-yellow" />
                  <span className="font-impact text-base uppercase tracking-wider text-grit-white">
                    TICKET VERIFIED
                  </span>
                </div>
                <span className={`font-ticker text-xs px-2 py-0.5 border ${
                  checkInResult.ticketStatus === 'USED' 
                    ? 'bg-neon-magenta/20 text-neon-magenta border-neon-magenta' 
                    : 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold'
                }`}>
                  STATUS: {checkInResult.ticketStatus || 'ACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-zine text-xs text-grit-dim uppercase">
                <div>TICKET CODE: <span className="text-grit-white">{checkInResult.qrCode || checkInResult.id}</span></div>
                <div>CHECK-IN TIME: <span className="text-grit-white">{checkInResult.checkInTime || 'PENDING ENTRY'}</span></div>
              </div>

              {checkInResult.ticketStatus !== 'USED' && (
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={loading}
                  className="w-full bg-neon-magenta text-grit-white font-impact tracking-wider text-base uppercase py-2.5 min-h-[44px] border-2 border-asphalt-black hover:bg-acid-yellow hover:text-asphalt-black shadow-[4px_4px_0px_#0e0e11] cursor-pointer transition-all touch-manipulation"
                >
                  {loading ? 'CONFIRMING ENTRY...' : 'CONFIRM ENTRY & MARK TICKET USED'}
                </button>
              )}
            </div>
          )}

          {/* Rejected Error Card */}
          {errorResult && (
            <div className="bg-neon-magenta/10 border-2 border-neon-magenta p-4 flex items-center gap-3">
              <AlertTriangle size={24} className="text-neon-magenta shrink-0" />
              <div>
                <h4 className="font-impact text-base uppercase text-neon-magenta tracking-wider">TICKET REJECTED</h4>
                <p className="font-mono-zine text-xs text-grit-dim uppercase">{errorResult}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
