import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatFee } from '../../utils/feeDisplay';

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  const specializations = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Gynecologist', 'Ophthalmologist', 'ENT Specialist', 'Psychiatrist', 'Dentist', 'General Physician'];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialization) params.append('specialization', specialization);
    api.get(`/doctors?${params}`)
      .then(res => setDoctors(res.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [search, specialization]);

  const BG_COLORS = ['#0d6efd', '#6610f2', '#198754', '#fd7e14', '#dc3545', '#20c997'];
  const getBg = (name) => BG_COLORS[name?.charCodeAt(0) % BG_COLORS.length] || '#0d6efd';

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-people-fill me-2 text-primary" />Find Doctors</h2>
        <p className="text-muted">Book appointments with top specialists</p>
      </div>

      {/* Filters */}
      <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-center">
            <div className="col-lg-5">
              <label className="form-label text-muted fw-semibold small text-uppercase">Search</label>
              <div className="search-box">
                <i className="bi bi-search search-icon" />
                <input
                  type="text"
                  className="form-control form-control-lg bg-light border-0"
                  placeholder="Doctor name or specialty..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ borderRadius: '10px' }}
                />
              </div>
            </div>
            <div className="col-lg-4">
              <label className="form-label text-muted fw-semibold small text-uppercase">Specialization</label>
              <select
                className="form-select form-select-lg bg-light border-0"
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                style={{ borderRadius: '10px' }}
              >
                <option value="">Any Speciality</option>
                {specializations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-lg-3 d-flex align-items-end">
              <button
                className="btn btn-lg btn-outline-secondary w-100"
                onClick={() => { setSearch(''); setSpecialization(''); }}
                style={{ borderRadius: '10px' }}
              >
                <i className="bi bi-arrow-counterclockwise me-2" />Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="row g-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-md-4">
              <div className="skeleton skeleton-card" style={{ height: 220 }} />
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-person-x empty-icon" />
          <h5>No doctors found</h5>
          <p className="text-muted">Try different search terms</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {doctors.map(doc => (
            <div key={doc.id} className="card border-0 shadow-sm hover-shadow transition-all" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="row align-items-center g-4">
                  
                  {/* Left Column: Avatar & Basic Info */}
                  <div className="col-md-5 col-lg-4 d-flex gap-3 align-items-center border-end-md">
                    <div className="doctor-avatar lg" style={{ width: 80, height: 80, fontSize: '1.5rem', background: `linear-gradient(135deg, ${getBg(doc.name)}, ${getBg(doc.name)}dd)` }}>
                      {getInitials(doc.name)}
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold">{doc.name}</h5>
                      <div className="text-primary fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>{doc.specialization}</div>
                      <div className="text-muted small">
                        <i className="bi bi-star-fill text-warning me-1" /> 4.8 | <i className="bi bi-award ms-2 me-1" />{doc.experience_years} yrs exp.
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Details & Hospital */}
                  <div className="col-md-4 col-lg-5">
                    {doc.hospital && (
                      <div className="mb-2 text-dark fw-medium">
                        <i className="bi bi-hospital me-2 text-muted" />{doc.hospital}
                      </div>
                    )}
                    {doc.bio && (
                      <p className="text-muted mb-0" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {doc.bio}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Price & Action */}
                  <div className="col-md-3 col-lg-3 text-md-end border-start-md">
                    <div className="mb-1 text-muted small text-uppercase fw-bold">Consultation Fee</div>
                    <h3 className="fw-bold text-primary mb-3">{formatFee(doc.totalFee)}</h3>
                    <Link
                      to={`/user/doctors/${doc.id}`}
                      className="btn btn-primary rounded-pill px-4 py-2 w-100"
                    >
                      Book Now <i className="bi bi-arrow-right ms-1" />
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
