import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Image as ImageIcon } from 'lucide-react';
import { apiFetch, getStoredToken } from '../services/api';

export default function CreateEventModal({ isOpen, onClose, showToast, onEventCreated }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');

  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);

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
    venueId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchVenues();
    }
  }, [isOpen]);

  const fetchVenues = async () => {
    setLoadingVenues(true);
    try {
      const data = await apiFetch('/venues');
      if (data && data.length > 0) {
        setVenues(data);
        setFormData((prev) => ({ ...prev, venueId: prev.venueId || data[0].id }));
      } else {
        setVenues([{ id: 1, name: 'Default Main Arena', address: '100 Main St' }]);
        setFormData((prev) => ({ ...prev, venueId: 1 }));
      }
    } catch (err) {
      setVenues([
        { id: 1, name: 'Metro Arena Center', address: 'San Francisco' },
        { id: 2, name: 'Silicon Valley Convention Center', address: 'San Jose' }
      ]);
      setFormData((prev) => ({ ...prev, venueId: 1 }));
    } finally {
      setLoadingVenues(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WEBP, GIF)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const token = getStoredToken();
      const res = await fetch('http://localhost:8080/api/images/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: bodyData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to upload banner image');
      }

      const data = await res.json();
      setBannerUrl(data.imageUrl);
      showToast('Banner image uploaded successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.venueId) {
      showToast('Please select a valid venue', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        ticketPrice: parseFloat(formData.ticketPrice),
        availableSeats: parseInt(formData.availableSeats),
        venueId: parseInt(formData.venueId),
        bannerImageUrl: bannerUrl
      };

      const newEvent = await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(`Event '${newEvent.name}' created successfully`, 'success');
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
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)' }}>
              <PlusCircle size={20} color="#FFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create Event</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Publish to the ticketing catalog</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Event Name<span style={{ color: '#ef4444' }}> *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="World Tech Conference 2026"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">
                  Category<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                  <option value="MUSIC">Music</option>
                  <option value="TECH">Tech & AI</option>
                  <option value="THEATER">Theater</option>
                  <option value="SPORTS">Sports</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Venue Selector dropdown instead of raw numeric Venue ID */}
              <div className="form-group">
                <label className="form-label">
                  Venue Location<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <select
                  name="venueId"
                  required
                  value={formData.venueId}
                  onChange={handleChange}
                  className="form-select"
                  disabled={loadingVenues}
                >
                  {loadingVenues ? (
                    <option value="">Loading venues...</option>
                  ) : (
                    venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.address ? `(${v.address})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">
                  Date<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input type="date" name="eventDate" required value={formData.eventDate} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Start<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input type="time" name="startTime" required value={formData.startTime} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">
                  End<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">
                  Base Ticket Price<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input type="number" name="ticketPrice" required step="0.01" value={formData.ticketPrice} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Total Capacity / Seats<span style={{ color: '#ef4444' }}> *</span>
                </label>
                <input type="number" name="availableSeats" required min="1" value={formData.availableSeats} onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="form-textarea" placeholder="Details about the event..." />
            </div>

            <div className="form-group">
              <label className="form-label">Banner Image Upload</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="form-input" />
              {uploadingImage && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Uploading banner...</span>}
              {bannerUrl && <span style={{ fontSize: '0.75rem', color: 'var(--accent-green, #22c55e)', display: 'block', marginTop: '4px' }}>✓ Banner uploaded successfully</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              disabled={loading || uploadingImage}
            >
              {loading ? 'Creating...' : 'Publish Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
