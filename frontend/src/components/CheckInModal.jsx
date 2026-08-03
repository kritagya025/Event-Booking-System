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
      showToast('Camera access unavailable. Using manual entry fallback.', 'info');
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
      showToast(`Ticket ${res.qrCode || '#' + res.id} verified`, 'success');
    } catch (err) {
      setErrorResult(err.message || 'Ticket validation failed');
      showToast(err.message || 'Invalid Ticket ID / QR Code', 'error');
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
      showToast(`Ticket checked in successfully for Gate Entry`, 'success');
    } catch (err) {
      setErrorResult(err.message || 'Check-in failed');
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}>
              <QrCode size={20} color="#FFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Organizer Gate Check-In</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scan QR code or use manual ticket validation</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          
          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => { setActiveTab('scan'); startCamera(); }}
              className={`btn ${activeTab === 'scan' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
            >
              <Camera size={14} /> Scan QR Code
            </button>
            <button
              onClick={() => { setActiveTab('manual'); stopCamera(); }}
              className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
            >
              <Search size={14} /> Manual Entry Fallback
            </button>
          </div>

          {/* SCANNER VIEW */}
          {activeTab === 'scan' && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '240px',
                background: '#000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed rgba(255,255,255,0.2)'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: isCameraActive ? 'block' : 'none' }}
                />

                {!isCameraActive && (
                  <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <CameraOff size={32} />
                    <span style={{ fontSize: '0.85rem' }}>Camera Stream Off</span>
                    <button onClick={startCamera} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                      Start Camera
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div style={{
                    position: 'absolute',
                    top: '20%', left: '20%', right: '20%', bottom: '20%',
                    border: '2px solid var(--accent-purple, #a855f7)',
                    borderRadius: '12px',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                    pointerEvents: 'none'
                  }} />
                )}
              </div>

              {/* Camera Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
                <button onClick={toggleCamera} className="btn btn-secondary btn-sm">
                  {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                </button>
                <button onClick={() => handleSimulateScan('TKT-DEMO123')} className="btn btn-secondary btn-sm">
                  <RefreshCw size={12} /> Scan Test Ticket
                </button>
              </div>
            </div>
          )}

          {/* MANUAL ENTRY VIEW */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Enter Ticket Code (e.g. TKT-ABC12345)"
                value={ticketIdInput}
                onChange={(e) => setTicketIdInput(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Search size={14} /> Validate
              </button>
            </form>
          )}

          {/* Verification Result Card */}
          {checkInResult && (
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <CheckCircle2 size={24} color="#FFF" />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Ticket Validated</h4>
                  <span className={`badge ${checkInResult.ticketStatus === 'USED' ? 'badge-red' : 'badge-green'}`}>
                    STATUS: {checkInResult.ticketStatus}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                <div><strong>Code:</strong> {checkInResult.qrCode || checkInResult.id}</div>
                <div><strong>Check-In:</strong> {checkInResult.checkInTime || 'Pending Entry'}</div>
              </div>

              {checkInResult.ticketStatus !== 'USED' && (
                <button
                  onClick={handleConfirmCheckIn}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '14px', padding: '10px' }}
                  disabled={loading}
                >
                  Confirm Gate Entry & Mark Used
                </button>
              )}
            </div>
          )}

          {/* Rejected Error Card */}
          {errorResult && (
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.04)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={24} color="var(--accent-red, #ef4444)" />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Ticket Rejected</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{errorResult}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
