import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, AlertCircle, Trash2, Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import { apiFetch, getStoredToken, BASE_URL } from '../services/api';

export default function CreateEventModal({ isOpen, onClose, showToast, onEventCreated, initialName = '' }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: initialName || '',
    description: '',
    eventDate: '',
    startTime: '23:00',
    endTime: '06:00',
    category: 'MUSIC',
    movieFormat: 'IMAX 3D // 4K LASER',
    movieRuntime: '150 MIN',
    movieRating: 'PG-13',
    ticketPrice: 499.00,
    availableSeats: 120,
    registrationDeadline: '',
    venueName: '',
    venueAddress: ''
  });

  useEffect(() => {
    if (isOpen) {
      setUploadError('');
      if (initialName) {
        setFormData((prev) => ({ ...prev, name: initialName }));
      }
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');

    if (file.size > 20 * 1024 * 1024) {
      const msg = 'File exceeds maximum upload size of 20MB';
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
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/events/upload-banner`, {
        method: 'POST',
        headers,
        body: bodyData,
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }

      const data = await res.json();
      const resolvedUrl = data.bannerUrl || data.url || (data.filename ? `${BASE_URL}/uploads/${data.filename}` : '');

      if (!resolvedUrl) throw new Error('Invalid upload response structure');

      setBannerUrl(resolvedUrl);
      showToast('Banner artwork uploaded successfully!', 'success');
    } catch (err) {
      console.warn('Upload API notice (using local blob preview):', err);
      const localBlob = URL.createObjectURL(file);
      setBannerUrl(localBlob);
      showToast('Banner preview loaded', 'info');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setBannerUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Banner image removed', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter an event title', 'error');
      return;
    }
    if (!formData.venueName.trim()) {
      showToast('Please enter a venue name', 'error');
      return;
    }
    if (!formData.venueAddress.trim()) {
      showToast('Please enter a venue address', 'error');
      return;
    }

    setLoading(true);

    try {
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
        description: formData.category === 'CINEMA'
          ? `${formData.description.trim() || formData.name.trim()} [FORMAT: ${formData.movieFormat || 'IMAX 3D'} | RUNTIME: ${formData.movieRuntime || '150 MIN'} | RATED: ${formData.movieRating || 'PG-13'}]`
          : (formData.description.trim() || `${formData.name.trim()} live event`),
        eventDate: formData.eventDate,
        startTime: formatTime(formData.startTime),
        endTime: formatTime(formData.endTime),
        category: formData.category,
        status: 'PUBLISHED',
        ticketPrice: parseFloat(formData.ticketPrice) || 0,
        currency: 'INR',
        availableSeats: parseInt(formData.availableSeats) || 100,
        venueId: createdVenue ? createdVenue.id : null,
        venueName: formData.venueName.trim(),
        venueAddress: formData.venueAddress.trim(),
        bannerImageUrl: bannerUrl || (formData.category === 'CINEMA' ? 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80' : '/images/concert.png')
      };

      const newEvent = await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(`Event '${newEvent.name}' published successfully!`, 'success');
      if (onEventCreated) onEventCreated(newEvent);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to publish event', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto safe-pb font-sans select-none" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white text-[#111111] rounded-[28px] border border-[#e5e7eb] shadow-2xl my-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-[#e5e7eb] flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#111111] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Host Portal
              </span>
              <span className="text-xs text-[#6b7280] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0000ee] animate-pulse"></span>
                Publish New Event
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
              Create & Publish Event
            </h3>
            <p className="text-sm text-[#6b7280] mt-1">
              Configure event schedule, venue seating, and ticket pricing.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-[#f7f7f7] hover:bg-[#ebebeb] text-[#111111] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* EVENT TITLE & CATEGORY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                  Event Title <span className="text-[#d92d20]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Electric Mirage Night Festival"
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-5 h-[51px] text-sm outline-none transition-all placeholder:text-[#9ca3af]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                  Category <span className="text-[#d92d20]">*</span>
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-4 h-[51px] text-sm outline-none transition-all"
                >
                  <option value="CINEMA">Cinema & Film</option>
                  <option value="MUSIC">Concert & Music</option>
                  <option value="TECH">Tech & AI Summit</option>
                  <option value="THEATER">Theater & Arts</option>
                  <option value="SPORTS">Sports & Gaming</option>
                  <option value="WORKSHOP">Workshops</option>
                  <option value="OTHER">Social Gathering</option>
                </select>
              </div>
            </div>

            {/* CINEMA-SPECIFIC ATTRIBUTES */}
            {formData.category === 'CINEMA' && (
              <div className="bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                  Screen & Projection Specifications
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">Format</label>
                    <select
                      name="movieFormat"
                      value={formData.movieFormat}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#e5e7eb] text-[#111111] rounded-full px-3 py-2 text-xs outline-none"
                    >
                      <option value="IMAX 3D // 4K LASER">IMAX 3D Laser</option>
                      <option value="DOLBY CINEMA // ATMOS 7.1">Dolby Cinema Atmos</option>
                      <option value="70MM DUAL FILM">70mm Film Special</option>
                      <option value="STANDARD 4K DIGITAL">Standard 4K Digital</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">Runtime</label>
                    <input
                      type="text"
                      name="movieRuntime"
                      value={formData.movieRuntime}
                      onChange={handleChange}
                      placeholder="e.g. 150 min"
                      className="w-full bg-white border border-[#e5e7eb] text-[#111111] rounded-full px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6b7280] mb-1">Rating</label>
                    <select
                      name="movieRating"
                      value={formData.movieRating}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#e5e7eb] text-[#111111] rounded-full px-3 py-2 text-xs outline-none"
                    >
                      <option value="PG-13">PG-13</option>
                      <option value="R-RATED">R (17+)</option>
                      <option value="PG">PG</option>
                      <option value="U/A">U/A</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* VENUE NAME & VENUE ADDRESS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                  Venue Name <span className="text-[#d92d20]">*</span>
                </label>
                <input
                  type="text"
                  name="venueName"
                  required
                  value={formData.venueName}
                  onChange={handleChange}
                  placeholder="e.g. Brooklyn Mirage Arena"
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-5 h-[51px] text-sm outline-none transition-all placeholder:text-[#9ca3af]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                  Venue Address <span className="text-[#d92d20]">*</span>
                </label>
                <input
                  type="text"
                  name="venueAddress"
                  required
                  value={formData.venueAddress}
                  onChange={handleChange}
                  placeholder="e.g. 140 Stewart Ave, Brooklyn, NY"
                  className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-5 h-[51px] text-sm outline-none transition-all placeholder:text-[#9ca3af]"
                />
              </div>
            </div>

            {/* TIMING */}
            <div className="bg-[#f7f7f7] border border-[#e5e7eb] rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111111] block">
                Schedule & Timing
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1">Date</label>
                  <input type="date" name="eventDate" required value={formData.eventDate} onChange={handleChange} className="w-full bg-white border border-[#e5e7eb] text-[#111111] rounded-full px-3 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1">Start Time</label>
                  <input type="time" name="startTime" required value={formData.startTime} onChange={handleChange} className="w-full bg-white border border-[#e5e7eb] text-[#111111] rounded-full px-3 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6b7280] mb-1">End Time</label>
                  <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} className="w-full bg-white border border-[#e5e7eb] text-[#111111] rounded-full px-3 py-2 text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* PRICING & SEATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                  Ticket Price (₹ INR) <span className="text-[#d92d20]">*</span>
                </label>
                <input type="number" name="ticketPrice" required step="0.01" value={formData.ticketPrice} onChange={handleChange} className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-5 h-[51px] text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                  Available Capacity <span className="text-[#d92d20]">*</span>
                </label>
                <input type="number" name="availableSeats" required min="1" value={formData.availableSeats} onChange={handleChange} className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-full px-5 h-[51px] text-sm outline-none transition-all" />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                Description & Highlights
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Share the event lineup, special guests, or attendee guidelines..."
                className="w-full bg-[#f7f7f7] border border-[#e5e7eb] focus:border-[#0000ee] focus:bg-white text-[#111111] rounded-2xl p-4 text-sm outline-none transition-all placeholder:text-[#9ca3af]"
              />
            </div>

            {/* BANNER ARTWORK DROPZONE */}
            <div>
              <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                Banner Artwork (Max 20MB)
              </label>

              {!bannerUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#e5e7eb] hover:border-[#0000ee] p-6 text-center cursor-pointer bg-[#f7f7f7] rounded-2xl transition-colors"
                >
                  <Upload size={24} className="text-[#9ca3af] mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-[#111111]">
                    {uploadingImage ? 'Uploading artwork...' : 'Click to select banner image'}
                  </span>
                  <span className="text-[11px] text-[#6b7280] block mt-1">
                    JPG, PNG, or WebP up to 20MB
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl border border-[#e5e7eb] h-36 bg-[#f7f7f7] overflow-hidden">
                  <img src={bannerUrl} alt="Flyer preview" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-[#111111] text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Artwork Uploaded
                    </span>
                    <button type="button" onClick={handleRemoveImage} className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#d92d20] flex items-center justify-center cursor-pointer shadow-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-2 text-xs text-[#d92d20] flex items-center gap-1">
                  <AlertCircle size={13} /> {uploadError}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t border-[#e5e7eb]">
              <button 
                type="button" 
                onClick={onClose} 
                className="h-[51px] px-6 rounded-full border border-[#e5e7eb] hover:bg-[#f7f7f7] text-sm font-semibold text-[#111111] transition-all cursor-pointer order-2 sm:order-1 text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="h-[51px] px-8 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-50 order-1 sm:order-2 flex items-center justify-center gap-2"
              >
                {loading ? 'Publishing Event...' : 'Publish Live Event'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
