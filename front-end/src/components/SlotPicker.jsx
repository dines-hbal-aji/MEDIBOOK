import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatTime } from '../utils/formatDate';

const SlotPicker = ({ doctorId, onSelect, selectedSlot }) => {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        fullDate: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return dates;
  };

  useEffect(() => {
    if (!date || !doctorId) return;
    setLoading(true);
    api.get(`/doctors/${doctorId}/slots?date=${date}`)
      .then(res => setSlots(res.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [date, doctorId]);

  const available = slots.filter(s => !s.is_booked);
  const booked = slots.filter(s => s.is_booked);

  return (
    <div className="slot-picker">
      <div className="mb-4">
        <label className="form-label fw-semibold text-dark mb-3">
          <i className="bi bi-calendar3 me-2 text-primary" />
          Select Date
        </label>
        
        <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {generateDates().map((d, i) => {
            const isSelected = date === d.fullDate;
            return (
              <button
                key={i}
                className={`btn ${isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-light-subtle'} d-flex flex-column align-items-center justify-content-center p-2 transition-all`}
                style={{ 
                  minWidth: '70px', 
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-light)',
                  color: isSelected ? 'white' : 'inherit'
                }}
                onClick={() => { setDate(d.fullDate); onSelect(null); }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: isSelected ? 0.9 : 0.6, textTransform: 'uppercase' }}>{d.day}</span>
                <span className="fs-5 fw-bold my-1">{d.dateNum}</span>
                <span style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.6 }}>{d.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {date && (
        <div className="mt-3">
          <label className="form-label fw-semibold">
            <i className="bi bi-clock me-2 text-primary" />
            Available Time Slots
            {available.length > 0 && (
              <span className="badge bg-success ms-2" style={{ fontSize: '0.75rem' }}>{available.length} available</span>
            )}
          </label>

          {loading ? (
            <div className="d-flex gap-2 flex-wrap">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ width: 90, height: 36, borderRadius: 20 }} />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-muted py-3">
              <i className="bi bi-calendar-x me-2" />
              No slots available for this date
            </div>
          ) : (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {slots.map(slot => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    className={`slot-chip ${slot.is_booked ? 'booked' : isSelected ? 'selected' : 'available'}`}
                    onClick={() => !slot.is_booked && onSelect(isSelected ? null : slot)}
                    disabled={slot.is_booked}
                    title={slot.is_booked ? 'Already booked' : `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
                  >
                    {!slot.is_booked && !isSelected && <i className="bi bi-clock" style={{ fontSize: '0.75rem' }} />}
                    {isSelected && <i className="bi bi-check-circle-fill" style={{ fontSize: '0.75rem' }} />}
                    {slot.is_booked && <i className="bi bi-x-circle" style={{ fontSize: '0.75rem' }} />}
                    {formatTime(slot.start_time)}
                  </button>
                );
              })}
            </div>
          )}

          {slots.length > 0 && (
            <div className="d-flex gap-3 mt-3" style={{ fontSize: '0.8rem' }}>
              <span><span className="slot-chip available" style={{ padding: '0.2rem 0.6rem', display: 'inline-flex' }} /> Available</span>
              <span><span className="slot-chip booked" style={{ padding: '0.2rem 0.6rem', display: 'inline-flex' }} /> Booked</span>
              <span><span className="slot-chip selected" style={{ padding: '0.2rem 0.6rem', display: 'inline-flex' }} /> Selected</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
