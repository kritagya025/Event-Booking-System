import React, { useState, useRef, useEffect } from 'react';
import { X, QrCode, CheckCircle2, AlertTriangle, Search, Camera, CameraOff, RefreshCw } from 'lucide-react';
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
    } catch (_err) {
      showToast('OPTICAL SCANNER FEED OFFLINE. USE CIPHER OVERRIDE.', 'info');
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
      showToast(`WRISTBAND ${res.qrCode || '#' + res.id} VERIFIED`, 'success');
    } catch (err) {
      setErrorResult(err.message || 'CIPHER REJECTED: TICKET INVALID OR EXPIRED');
      showToast(err.message || 'INVALID WRISTBAND CODE', 'error');
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
      showToast('WRISTBAND ADMITTED AT GATE // SCAN SEAL LOCKED', 'success');
    } catch (err) {
      setErrorResult(err.message || 'CHECK-IN FAILED');
      showToast(err.message || 'CHECK-IN FAILED', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-asphalt-surface border-4 border-grit-white text-grit-white shadow-[10px_10px_0px_#ff1f6d] my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Slanted Sticker */}
        <div className="absolute -top-4 -right-3 bg-acid-yellow text-asphalt-black font-impact tracking-wider px-3 py-1 rotate-2 border-2 border-asphalt-black text-xs uppercase shadow-[4px_4px_0px_#0e0e11] z-10">
          WAREHOUSE BOUNCER GATE
        </div>

        {/* Header */}
        <div className="p-5 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-neon-magenta text-grit-white font-impact tracking-wider text-xs px-2 py-0.5">
                BOUNCER_RIG://SCANNER
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-acid-yellow animate-ping"></span>
                GATE 04 // ACTIVE
              </span>
            </div>
            <h3 className="font-display text-3xl uppercase tracking-tight text-grit-white mt-1 leading-none">
              WRISTBAND SCANNER RIG
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              OPTICAL BARCODE VERIFICATION & ADMITTANCE CONFIRMATION
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="bg-asphalt-surface border-2 border-grit-white text-grit-white hover:bg-neon-magenta hover:text-grit-white p-1.5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6 space-y-4">
          
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
              <Camera size={14} /> OPTICAL SCANNER
            </button>
            <button
              onClick={() => { setActiveTab('manual'); stopCamera(); }}
              className={`py-2 px-3 text-xs font-impact tracking-wider uppercase border-2 flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'manual'
                  ? 'bg-acid-yellow text-asphalt-black border-grit-white shadow-[3px_3px_0px_#ffffff]'
                  : 'bg-asphalt-card text-grit-dim border-asphalt-border hover:border-grit-white hover:text-grit-white'
              }`}
            >
              <Search size={14} /> CIPHER OVERRIDE
            </button>
          </div>

          {/* SCANNER VIEW */}
          {activeTab === 'scan' && (
            <div className="text-center space-y-3">
              <div className="relative w-full h-64 bg-asphalt-black border-2 border-dashed border-asphalt-border overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {!isCameraActive && (
                  <div className="flex flex-col items-center gap-2 text-grit-dim">
                    <CameraOff size={32} />
                    <span className="font-mono-zine text-xs uppercase tracking-wider">OPTICAL SENSOR DORMANT</span>
                    <button 
                      onClick={startCamera} 
                      className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs uppercase px-4 py-1.5 border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white cursor-pointer transition-colors mt-2"
                    >
                      ACTIVATE FEED
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
              <div className="flex justify-center gap-3">
                <button 
                  onClick={toggleCamera} 
                  className="bg-asphalt-card border border-asphalt-border hover:border-grit-white text-grit-white font-mono-zine text-xs px-3 py-1.5 uppercase cursor-pointer"
                >
                  {isCameraActive ? 'SUSPEND FEED' : 'ENGAGE SENSOR'}
                </button>
                <button 
                  onClick={() => handleSimulateScan('TKT-VAULT90S-SAMPLE')} 
                  className="bg-asphalt-card border border-acid-yellow text-acid-yellow hover:bg-acid-yellow hover:text-asphalt-black font-mono-zine text-xs px-3 py-1.5 uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw size={12} /> SCAN TEST TAPE CIPHER
                </button>
              </div>
            </div>
          )}

          {/* MANUAL ENTRY VIEW */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="ENTER CIPHER (E.G. TKT-VAULT90S-SAMPLE)"
                value={ticketIdInput}
                onChange={(e) => setTicketIdInput(e.target.value.toUpperCase())}
                className="flex-1 bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-xs uppercase outline-none"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-acid-yellow text-asphalt-black font-impact tracking-wider px-4 text-sm uppercase border border-asphalt-black hover:bg-neon-magenta hover:text-grit-white cursor-pointer disabled:opacity-50"
              >
                {loading ? 'AUDITING...' : 'VERIFY'}
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
                    WRISTBAND RECOGNIZED
                  </span>
                </div>
                <span className={`font-ticker text-xs px-2 py-0.5 border ${
                  checkInResult.ticketStatus === 'USED' 
                    ? 'bg-neon-magenta/20 text-neon-magenta border-neon-magenta' 
                    : 'bg-acid-yellow text-asphalt-black border-asphalt-black font-bold'
                }`}>
                  STATUS: {checkInResult.ticketStatus || 'CONFIRMED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono-zine text-xs text-grit-dim uppercase">
                <div>PASS CIPHER: <span className="text-grit-white">{checkInResult.qrCode || checkInResult.id}</span></div>
                <div>CHECK-IN LOG: <span className="text-grit-white">{checkInResult.checkInTime || 'PENDING DISPATCH'}</span></div>
              </div>

              {checkInResult.ticketStatus !== 'USED' && (
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={loading}
                  className="w-full bg-neon-magenta text-grit-white font-impact tracking-wider text-base uppercase py-2.5 border-2 border-asphalt-black hover:bg-acid-yellow hover:text-asphalt-black shadow-[4px_4px_0px_#0e0e11] cursor-pointer transition-all"
                >
                  {loading ? 'RECORDING SEAL...' : 'ADMIT AT GATE & BREAK TAPE SEAL'}
                </button>
              )}
            </div>
          )}

          {/* Rejected Error Card */}
          {errorResult && (
            <div className="bg-neon-magenta/10 border-2 border-neon-magenta p-4 flex items-center gap-3">
              <AlertTriangle size={24} className="text-neon-magenta shrink-0" />
              <div>
                <h4 className="font-impact text-base uppercase text-neon-magenta tracking-wider">ENTRY REJECTED</h4>
                <p className="font-mono-zine text-xs text-grit-dim uppercase">{errorResult}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
