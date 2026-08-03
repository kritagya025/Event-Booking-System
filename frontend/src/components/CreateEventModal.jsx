import React, { useState, useEffect, useRef } from 'react';
import { 
  X, PlusCircle, Image as ImageIcon, Upload, CheckCircle2, 
  AlertCircle, Calendar, Clock, DollarSign, Users, MapPin, Tag, FileText, Trash2, Building
} from 'lucide-react';
import { apiFetch, getStoredToken } from '../services/api';

export default function CreateEventModal({ isOpen, onClose, showToast, onEventCreated }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    startTime: '19:00',
    endTime: '22:00',
    category: 'MUSIC',
    ticketPrice: 50.00,
    availableSeats: 100,
    registrationDeadline: '',
    venueName: '',
    venueAddress: ''
  });

  useEffect(() => {
    if (isOpen) {
      setUploadError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');

    if (file.size > 20 * 1024 * 1024) {
      const msg = 'File size exceeds maximum limit of 20MB';
      setUploadError(msg);
      showToast(msg, 'error');
      return;
    }

    setUploadingImage(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const token = getStoredToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:8080/api/images/upload', {
        method: 'POST',
        headers: headers,
        body: bodyData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Upload failed (Status ${res.status})`);
      }

      const data = await res.json();
      const finalUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:8080${data.imageUrl}`;
      setBannerUrl(finalUrl);
      showToast('Banner image uploaded successfully', 'success');
    } catch (err) {
      const errMsg = err.message || 'Image upload failed. Please try another image.';
      setUploadError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setBannerUrl('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a valid event title', 'error');
      return;
    }
    if (!formData.venueName.trim()) {
      showToast('Please enter a venue name', 'error');
      return;
    }
    if (!formData.venueAddress.trim()) {
      showToast('Please enter the venue address / location', 'error');
      return;
    }

    setLoading(true);

    try {
      // 1. Create venue record first
      const createdVenue = await apiFetch('/venues', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.venueName.trim(),
          address: formData.venueAddress.trim(),
          capacity: parseInt(formData.availableSeats) || 100,
          description: `Venue for ${formData.name}`
        })
      }).catch(() => null);

      const formatTime = (t) => {
        if (!t) return '19:00:00';
        return t.length === 5 ? `${t}:00` : t;
      };

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || `${formData.name.trim()} live event`,
        eventDate: formData.eventDate,
        startTime: formatTime(formData.startTime),
        endTime: formatTime(formData.endTime),
        category: formData.category,
        status: 'PUBLISHED',
        ticketPrice: parseFloat(formData.ticketPrice) || 0,
        availableSeats: parseInt(formData.availableSeats) || 100,
        venueId: createdVenue ? createdVenue.id : null,
        venueName: formData.venueName.trim(),
        venueAddress: formData.venueAddress.trim(),
        bannerImageUrl: bannerUrl || '/images/concert.png'
      };

      const newEvent = await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(`Event '${newEvent.name}' published successfully!`, 'success');
      if (onEventCreated) onEventCreated(newEvent);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '100%' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)' }}>
              <PlusCircle size={22} color="#FFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Create & Publish Event</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter event details and location for small, local, or global events</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            
            {/* SECTION 1: EVENT INFO */}
            <div style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">
                  Event Title<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Local Community Concert 2026 / Tech Meetup"
                  style={{ height: '44px', fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={13} color="var(--text-muted)" /> Category<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-select" style={{ height: '44px' }}>
                  <option value="MUSIC">Music</option>
                  <option value="TECH">Tech & AI</option>
                  <option value="THEATER">Theater</option>
                  <option value="SPORTS">Sports</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* DIRECT VENUE NAME & ADDRESS INPUT FIELDS (NO DROPDOWN) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={13} color="var(--text-muted)" /> Venue / Place Name<span style={{ color: '#ef4444' }}> *</span>
                  </label>
                  <input
                    type="text"
                    name="venueName"
                    required
                    value={formData.venueName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Sunrise Lawn / Community Hall"
                    style={{ height: '44px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--text-muted)" /> Address / City / Country<span style={{ color: '#ef4444' }}> *</span>
                  </label>
                  <input
                    type="text"
                    name="venueAddress"
                    required
                    value={formData.venueAddress}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 123 Main St, New York, NY / Mumbai"
                    style={{ height: '44px' }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: SCHEDULE */}
            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Schedule & Timing
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="var(--text-muted)" /> Date<span style={{ color: '#ef4444' }}> *</span>
                  </label>
                  <input type="date" name="eventDate" required value={formData.eventDate} onChange={handleChange} className="form-input" style={{ height: '42px' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="var(--text-muted)" /> Start<span style={{ color: '#ef4444' }}> *</span>
                  </label>
                  <input type="time" name="startTime" required value={formData.startTime} onChange={handleChange} className="form-input" style={{ height: '42px' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="var(--text-muted)" /> End<span style={{ color: '#ef4444' }}> *</span>
                  </label>
                  <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} className="form-input" style={{ height: '42px' }} />
                </div>
              </div>
            </div>

            {/* SECTION 3: PRICING & SEATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={13} color="var(--text-muted)" /> Base Ticket Price<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input type="number" name="ticketPrice" required step="0.01" value={formData.ticketPrice} onChange={handleChange} className="form-input" style={{ height: '44px' }} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={13} color="var(--text-muted)" /> Total Seats Capacity<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input type="number" name="availableSeats" required min="1" value={formData.availableSeats} onChange={handleChange} className="form-input" style={{ height: '44px' }} />
              </div>
            </div>

            {/* SECTION 4: DESCRIPTION */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={13} color="var(--text-muted)" /> Event Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Provide details about the event, location highlights, or entry instructions..."
              />
            </div>

            {/* SECTION 5: BANNER IMAGE UPLOAD DROPZONE */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={13} color="var(--text-muted)" /> Event Banner Image
              </label>

              {!bannerUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(255,255,255,0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                >
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>
                    {uploadingImage ? 'Uploading banner image...' : 'Click to select banner image'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Supports JPG, PNG, WEBP, GIF, SVG up to 20MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '140px', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={bannerUrl} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Uploaded
                    </span>
                    <button type="button" onClick={handleRemoveImage} className="btn btn-secondary btn-sm" style={{ padding: '6px', background: 'rgba(0,0,0,0.7)' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> {uploadError}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem' }}
                disabled={loading || uploadingImage}
              >
                {loading ? 'Publishing Event...' : 'Publish Event'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
