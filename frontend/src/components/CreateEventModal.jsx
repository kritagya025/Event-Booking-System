import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, AlertCircle, Trash2 } from 'lucide-react';
import { apiFetch, getStoredToken, BASE_URL } from '../services/api';

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
    startTime: '23:00',
    endTime: '06:00',
    category: 'MUSIC',
    movieFormat: 'IMAX 3D // 4K LASER',
    movieRuntime: '150 MIN',
    movieRating: 'PG-13',
    ticketPrice: 30.00,
    availableSeats: 120,
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
      const msg = 'FILE EXCEEDS MAXIMUM TRANSMISSION THRESHOLD OF 20MB';
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

      const uploadEndpoint = `${BASE_URL}/images/upload`;
      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: headers,
        body: bodyData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Upload failed (Status ${res.status})`);
      }

      const data = await res.json();
      const originBase = BASE_URL.replace(/\/api$/, '');
      const finalUrl = data.imageUrl.startsWith('http') 
        ? data.imageUrl 
        : `${originBase}${data.imageUrl}`;
      setBannerUrl(finalUrl);
      showToast('EVENT BANNER IMAGE UPLOADED', 'success');
    } catch (err) {
      const errMsg = err.message || 'Artwork upload failed. Select another file.';
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
      showToast('PLEASE ENTER AN EVENT TITLE', 'error');
      return;
    }
    if (!formData.venueName.trim()) {
      showToast('PLEASE ENTER A VENUE NAME', 'error');
      return;
    }
    if (!formData.venueAddress.trim()) {
      showToast('PLEASE ENTER A VENUE ADDRESS', 'error');
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

      showToast(`EVENT '${newEvent.name}' PUBLISHED SUCCESSFULLY!`, 'success');
      if (onEventCreated) onEventCreated(newEvent);
      onClose();
    } catch (err) {
      showToast(err.message || 'FAILED TO PUBLISH EVENT', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-asphalt-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto safe-pb touch-scroll select-none" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-asphalt-surface border-2 border-grit-white text-grit-white shadow-[4px_4px_0px_#E2F13C] my-auto relative font-mono-zine"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slanted Tape Badge */}
        <div className="absolute -top-3.5 sm:-top-4 right-2 sm:-right-2 bg-neon-magenta text-grit-white font-impact tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rotate-2 border-2 border-asphalt-black text-[11px] sm:text-xs uppercase shadow-[3px_3px_0px_#0e0e11] sm:shadow-[4px_4px_0px_#0e0e11] z-10">
          ORGANIZER EVENT PORTAL
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b-2 border-asphalt-border flex items-start justify-between bg-asphalt-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-xs px-2 py-0.5">
                EVENTHUB://PUBLISH_EVENT
              </span>
              <span className="font-ticker text-[10px] text-grit-dim uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-neon-magenta animate-pulse"></span>
                LIVE EVENT CREATOR
              </span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-grit-white mt-1 leading-none">
              CREATE & PUBLISH LIVE EVENT
            </h3>
            <p className="font-mono-zine text-xs text-grit-dim uppercase tracking-wider mt-1">
              CONFIGURE EVENT DETAILS, VENUE INFORMATION & TICKET PRICING
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
        <div className="p-4 sm:p-5 md:p-6 max-h-[80vh] overflow-y-auto touch-scroll">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* EVENT TITLE & CATEGORY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                  EVENT TITLE <span className="text-neon-magenta">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="E.G. GLOBAL DEVELOPER SUMMIT 2026"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm uppercase outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                  EVENT CATEGORY <span className="text-neon-magenta">*</span>
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm uppercase outline-none"
                >
                  <option value="CINEMA">CINEMA & MOVIE PREMIERE</option>
                  <option value="MUSIC">MUSIC CONCERT & FESTIVAL</option>
                  <option value="TECH">TECH & AI CONFERENCE</option>
                  <option value="THEATER">THEATER & PERFORMING ARTS</option>
                  <option value="SPORTS">SPORTS & TOURNAMENTS</option>
                  <option value="WORKSHOP">WORKSHOPS & MASTERCLASSES</option>
                  <option value="OTHER">COMMUNITY & NETWORKING</option>
                </select>
              </div>
            </div>

            {/* CINEMA-SPECIFIC ATTRIBUTES */}
            {formData.category === 'CINEMA' && (
              <div className="bg-asphalt-black border-2 border-acid-yellow p-3 space-y-3">
                <span className="font-impact text-xs uppercase tracking-wider text-acid-yellow block">
                  CINEMA SCREEN & PROJECTION SPECIFICATIONS
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono-zine text-grit-dim uppercase mb-1">PROJECTION FORMAT</label>
                    <select
                      name="movieFormat"
                      value={formData.movieFormat}
                      onChange={handleChange}
                      className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-2 py-1.5 text-xs uppercase outline-none"
                    >
                      <option value="IMAX 3D // 4K LASER">IMAX 3D // 4K LASER</option>
                      <option value="DOLBY CINEMA // ATMOS 7.1">DOLBY CINEMA // ATMOS 7.1</option>
                      <option value="70MM DUAL FILM">70MM DUAL FILM SPECIAL</option>
                      <option value="STANDARD 4K DIGITAL">STANDARD 4K DIGITAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-zine text-grit-dim uppercase mb-1">RUNTIME / DURATION</label>
                    <input
                      type="text"
                      name="movieRuntime"
                      value={formData.movieRuntime}
                      onChange={handleChange}
                      placeholder="E.G. 162 MIN"
                      className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-2 py-1.5 text-xs uppercase outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-zine text-grit-dim uppercase mb-1">AGE CERTIFICATE</label>
                    <select
                      name="movieRating"
                      value={formData.movieRating}
                      onChange={handleChange}
                      className="w-full bg-asphalt-card border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-2 py-1.5 text-xs uppercase outline-none"
                    >
                      <option value="PG-13">PG-13 (PARENTS STRONGLY CAUTIONED)</option>
                      <option value="R-RATED">R-RATED (RESTRICTED 17+)</option>
                      <option value="PG">PG (PARENTAL GUIDANCE)</option>
                      <option value="U/A">U/A (ALL AUDIENCES)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* VENUE NAME & VENUE ADDRESS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                  VENUE NAME <span className="text-neon-magenta">*</span>
                </label>
                <input
                  type="text"
                  name="venueName"
                  required
                  value={formData.venueName}
                  onChange={handleChange}
                  placeholder="E.G. METROPOLITAN CONVENTION CENTER"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm uppercase outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                  VENUE ADDRESS / LOCATION <span className="text-neon-magenta">*</span>
                </label>
                <input
                  type="text"
                  name="venueAddress"
                  required
                  value={formData.venueAddress}
                  onChange={handleChange}
                  placeholder="E.G. 4241 INNOVATION BLVD, DOWNTOWN"
                  className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine px-3 py-2 text-sm uppercase outline-none"
                />
              </div>
            </div>

            {/* TIMING */}
            <div className="bg-asphalt-card border-2 border-asphalt-border p-3.5 space-y-2">
              <span className="font-impact text-xs tracking-wider text-grit-dim uppercase block">
                SCHEDULE & TIMING PROTOCOL
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-zine text-grit-dim uppercase mb-1">DATE</label>
                  <input type="date" name="eventDate" required value={formData.eventDate} onChange={handleChange} className="w-full bg-asphalt-surface border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-zine text-grit-dim uppercase mb-1">START TIME</label>
                  <input type="time" name="startTime" required value={formData.startTime} onChange={handleChange} className="w-full bg-asphalt-surface border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-mono-zine text-grit-dim uppercase mb-1">END TIME</label>
                  <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange} className="w-full bg-asphalt-surface border border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-xs outline-none" />
                </div>
              </div>
            </div>

            {/* PRICING & SEATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                  TICKET PRICE ($ USD) <span className="text-neon-magenta">*</span>
                </label>
                <input type="number" name="ticketPrice" required step="0.01" value={formData.ticketPrice} onChange={handleChange} className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                  AVAILABLE SEAT CAPACITY <span className="text-neon-magenta">*</span>
                </label>
                <input type="number" name="availableSeats" required min="1" value={formData.availableSeats} onChange={handleChange} className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-sm outline-none" />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                EVENT DESCRIPTION & DETAILS
              </label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="ENTER COMPLETE EVENT AGENDA, LINEUP, OR SPECIAL ATTENDEE INSTRUCTIONS..."
                className="w-full bg-asphalt-card border-2 border-asphalt-border focus:border-acid-yellow text-grit-white font-mono-zine p-2 text-xs outline-none uppercase"
              />
            </div>

            {/* BANNER ARTWORK DROPZONE */}
            <div>
              <label className="block text-xs font-mono-zine text-grit-dim uppercase tracking-wider mb-1">
                EVENT BANNER IMAGE (MAX 20MB)
              </label>

              {!bannerUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-asphalt-border hover:border-acid-yellow p-6 text-center cursor-pointer bg-asphalt-card transition-colors"
                >
                  <Upload size={24} className="text-grit-dim mx-auto mb-2" />
                  <span className="block text-xs font-impact tracking-wider text-grit-white uppercase">
                    {uploadingImage ? 'UPLOADING BANNER ARTWORK...' : 'CLICK TO SELECT BANNER IMAGE'}
                  </span>
                  <span className="text-[10px] text-grit-dim uppercase block mt-1">
                    JPG, PNG, WEBP UP TO 20MB
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
                <div className="relative border-2 border-grit-white h-32 bg-asphalt-black overflow-hidden">
                  <img src={bannerUrl} alt="Flyer preview" className="w-full h-full object-cover filter grayscale contrast-125" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className="bg-acid-yellow text-asphalt-black font-impact text-[10px] px-2 py-0.5 uppercase">
                      ARTWORK LOADED
                    </span>
                    <button type="button" onClick={handleRemoveImage} className="bg-asphalt-black/80 border border-grit-white p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-neon-magenta hover:text-grit-white cursor-pointer touch-manipulation">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-1 text-xs text-neon-magenta flex items-center gap-1 uppercase">
                  <AlertCircle size={12} /> {uploadError}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-asphalt-border">
              <button 
                type="button" 
                onClick={onClose} 
                className="bg-asphalt-card border border-asphalt-border text-grit-white hover:border-grit-white font-mono-zine text-xs px-4 py-2.5 uppercase cursor-pointer touch-manipulation order-2 sm:order-1 text-center"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="bg-acid-yellow text-asphalt-black font-impact tracking-wider text-base uppercase px-6 py-3 border-2 border-asphalt-black hover:bg-neon-magenta hover:text-grit-white transition-all shadow-[4px_4px_0px_#ffffff] cursor-pointer disabled:opacity-50 touch-manipulation order-1 sm:order-2"
              >
                {loading ? 'PUBLISHING EVENT...' : 'PUBLISH LIVE EVENT'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
