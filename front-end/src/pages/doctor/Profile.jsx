import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/FileUpload';

const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Gynecologist', 'Ophthalmologist', 'ENT Specialist', 'Psychiatrist', 'Dentist', 'Radiologist', 'Oncologist', 'General Physician', 'Other'];

const DoctorProfile = () => {
  const { doctor: authDoctor, updateDoctor } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/doctor/profile')
      .then(res => {
        setProfile(res.data);
        setForm({
          specialization: res.data.specialization || '',
          experience_years: res.data.experience_years || 0,
          base_fee: res.data.base_fee || 0,
          bio: res.data.bio || '',
          is_available: res.data.is_available === 1 || res.data.is_available === true,
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (certFile) fd.append('certificate', certFile);

      const res = await api.put('/doctor/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(res.data);
      updateDoctor(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton skeleton-card" style={{ height: 400 }} />;

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-person-circle me-2 text-primary" />My Profile</h2>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body p-4">
              <div className="doctor-avatar lg mx-auto mb-3">
                {profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h5 className="fw-bold">{profile?.name}</h5>
              <div className="text-primary">{profile?.specialization}</div>
              <div className="text-muted mb-3">{profile?.email}</div>
              <div className="d-flex justify-content-center gap-2">
                <span className={`badge-status ${profile?.is_approved ? 'badge-approved' : 'badge-not-approved'}`}>
                  <i className={`bi ${profile?.is_approved ? 'bi-shield-check' : 'bi-shield-exclamation'}`} />
                  {profile?.is_approved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>

              {profile?.certificate_path && (
                <div className="mt-3">
                  <a
                    href={`${baseUrl}${profile.certificate_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-file-earmark-pdf me-1" />View Certificate
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold">Edit Profile</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Specialization</label>
                    <select
                      className="form-select"
                      value={form.specialization}
                      onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
                    >
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Experience (years)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0" max="60"
                      value={form.experience_years}
                      onChange={e => setForm(p => ({ ...p, experience_years: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Base Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={form.base_fee}
                      onChange={e => setForm(p => ({ ...p, base_fee: e.target.value }))}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Professional bio..."
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="availableToggle"
                        checked={form.is_available}
                        onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="availableToggle">
                        Available for appointments
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Update Certificate <span className="text-muted">(optional)</span></label>
                    <FileUpload
                      onFileSelect={setCertFile}
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5 * 1024 * 1024}
                      label="Upload new certificate"
                      hint="PDF, JPG, PNG · Max 5MB"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-save me-2" />Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
