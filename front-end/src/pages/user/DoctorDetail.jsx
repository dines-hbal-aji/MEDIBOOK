import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import SlotPicker from '../../components/SlotPicker';
import { formatFee } from '../../utils/feeDisplay';
import { formatDate, formatTime } from '../../utils/formatDate';

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(res => setDoctor(res.data))
      .catch(() => { toast.error('Doctor not found'); navigate('/user/doctors'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!selectedSlot) { toast.warning('Please select a time slot'); return; }
    setBooking(true);
    try {
      await api.post('/appointments', { doctor_id: doctor.id, slot_id: selectedSlot.id, notes });
      toast.success('Appointment booked successfully!');
      navigate('/user/appointments');
    } catch (err) {
      if (err.message?.includes('Slot already booked')) {
        toast.error('This slot was just taken. Please select another.');
        // Refresh slots
        setSelectedSlot(null);
      } else {
        toast.error(err.message || 'Booking failed');
      }
    } finally {
      setBooking(false);
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton skeleton-card" style={{ height: 200 }} />
        <div className="skeleton skeleton-card mt-4" style={{ height: 300 }} />
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div>
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2" />Back to Doctors
      </button>

      <div className="row g-4">
        {/* Left Column: Doctor Profile & Info */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
                <div 
                  className="doctor-avatar rounded-circle d-flex align-items-center justify-content-center text-white" 
                  style={{ 
                    width: '100px', height: '100px', fontSize: '2rem', 
                    backgroundColor: 'var(--primary)'
                  }}
                >
                  {getInitials(doctor.name)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h3 className="fw-bold mb-1 text-dark">{doctor.name}</h3>
                      <p className="text-primary fw-medium mb-2" style={{ fontSize: '1.1rem' }}>{doctor.specialization}</p>
                    </div>
                    <span className={`badge ${doctor.is_available ? 'bg-success' : 'bg-danger'} px-3 py-2 rounded-2`}>
                      {doctor.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  <div className="d-flex flex-wrap gap-4 text-muted mt-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-award fs-5 text-secondary" />
                      <span>{doctor.experience_years} Years Experience</span>
                    </div>
                    {doctor.hospital && (
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-hospital fs-5 text-secondary" />
                        <span>{doctor.hospital}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {doctor.bio && (
                <div className="mt-4 pt-4 border-top">
                  <h6 className="fw-bold mb-2 text-dark">About Doctor</h6>
                  <p className="text-secondary" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{doctor.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Slot Picker */}
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-white border-bottom p-4 pb-0 border-0">
              <h5 className="fw-bold text-dark mb-0"><i className="bi bi-calendar-check text-primary me-2" />Book Appointment</h5>
            </div>
            <div className="card-body p-4">
              <SlotPicker doctorId={doctor.id} onSelect={setSelectedSlot} selectedSlot={selectedSlot} />

              {selectedSlot && (
                <div className="mt-4 border-top pt-4">
                  <div className="alert alert-success d-flex align-items-center mb-4">
                    <i className="bi bi-check-circle-fill fs-4 me-3" />
                    <div>
                      <div className="fw-bold">Time Slot Selected</div>
                      <div className="small">{formatDate(selectedSlot.date)} at {formatTime(selectedSlot.start_time)}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">Additional Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Please briefly describe your symptoms or reason for visit..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                    <div className="form-text">This information will be shared securely with the doctor.</div>
                  </div>

                  <button
                    className="btn btn-primary btn-lg w-100 fw-bold"
                    onClick={() => setShowModal(true)}
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Booking & Fee */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-light border-bottom py-3">
              <h6 className="fw-bold mb-0 text-dark">Consultation Fee</h6>
            </div>
            <div className="card-body p-4">
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 pb-3 border-light">
                  <span className="text-secondary">Doctor Fee</span>
                  <span className="fw-medium text-dark">{formatFee(doctor.doctorFee)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 py-3 border-light">
                  <span className="text-secondary">Platform Fee</span>
                  <span className="fw-medium text-dark">{formatFee(doctor.commissionAmount)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 pt-3 border-light">
                  <span className="fw-bold text-dark fs-6">Total Amount</span>
                  <span className="fw-bold text-primary fs-5">{formatFee(doctor.totalFee)}</span>
                </li>
              </ul>
              
              <div className="alert alert-info py-2 px-3 mb-0" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-info-circle me-2" />
                Payment is required to confirm your booking.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold"><i className="bi bi-credit-card me-2 text-primary" />Complete Payment</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-light)' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Doctor</span>
                    <span className="fw-semibold">{doctor.name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Specialization</span>
                    <span>{doctor.specialization}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Date</span>
                    <span>{formatDate(selectedSlot.date)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Time</span>
                    <span>{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2 mt-2">
                    <span className="fw-bold">Total Fee</span>
                    <span className="fw-bold text-primary">{formatFee(doctor.totalFee)}</span>
                  </div>
                </div>

                <div className="alert alert-danger py-2 fw-semibold text-center mt-3 mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-shield-lock-fill me-2" />
                  Strict Policy: No refund, no rescheduling, and no cancellation.
                </div>

                {/* Fake Payment Gateway */}
                <div className="card shadow-sm border-0 bg-light">
                  <div className="card-body p-3">
                    <h6 className="mb-3 text-muted" style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Select Payment Method</h6>
                    
                    <div className="d-flex gap-2 mb-3 overflow-auto pb-1">
                      <button 
                        className={`btn btn-sm flex-fill ${paymentMethod === 'card' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <i className="bi bi-credit-card me-1" /> Card
                      </button>
                      <button 
                        className={`btn btn-sm flex-fill ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                        onClick={() => setPaymentMethod('upi')}
                      >
                        <i className="bi bi-phone me-1" /> UPI
                      </button>
                      <button 
                        className={`btn btn-sm flex-fill ${paymentMethod === 'netbanking' ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                        onClick={() => setPaymentMethod('netbanking')}
                      >
                        <i className="bi bi-bank me-1" /> Net Banking
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-3 border">
                      {paymentMethod === 'card' && (
                        <div className="fade-in">
                          <input type="text" className="form-control form-control-sm mb-2" placeholder="Cardholder Name" defaultValue="John Doe" />
                          <div className="input-group input-group-sm mb-2">
                            <span className="input-group-text bg-light"><i className="bi bi-credit-card-2-front" /></span>
                            <input type="text" className="form-control" placeholder="Card Number" defaultValue="**** **** **** 4242" />
                          </div>
                          <div className="d-flex gap-2">
                            <input type="text" className="form-control form-control-sm" placeholder="MM/YY" defaultValue="12/26" />
                            <input type="text" className="form-control form-control-sm" placeholder="CVV" defaultValue="123" />
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'upi' && (
                        <div className="fade-in text-center py-2">
                          <div className="mb-3">
                            <i className="bi bi-qr-code-scan" style={{ fontSize: '3rem', opacity: 0.5 }} />
                          </div>
                          <div className="input-group input-group-sm mb-2">
                            <span className="input-group-text bg-light"><i className="bi bi-phone" /></span>
                            <input type="text" className="form-control" placeholder="Enter UPI ID (e.g., name@okbank)" defaultValue="user@bankname" />
                          </div>
                          <small className="text-muted text-start d-block mt-1">A payment request will be sent to your UPI app.</small>
                        </div>
                      )}

                      {paymentMethod === 'netbanking' && (
                        <div className="fade-in">
                          <label className="form-label small fw-semibold text-muted">Select Bank</label>
                          <select className="form-select form-select-sm mb-2">
                            <option>HDFC Bank</option>
                            <option>State Bank of India</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                          </select>
                          <small className="text-muted d-block mt-2">You will be redirected to your bank's secure portal.</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              <div className="modal-footer border-0 pt-0 mt-2">
                <button className="btn btn-outline-secondary px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary px-4 fw-bold" onClick={handleBook} disabled={booking}>
                  {booking ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : `Pay ${formatFee(doctor.totalFee)} & Book`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetail;
