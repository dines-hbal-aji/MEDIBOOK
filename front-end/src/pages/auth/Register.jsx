import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import FileUpload from '../../components/FileUpload';

const SPECIALIZATIONS = [
  'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic',
  'Gynecologist', 'Ophthalmologist', 'ENT Specialist', 'Psychiatrist', 'Dentist',
  'Radiologist', 'Oncologist', 'Endocrinologist', 'Nephrologist', 'Pulmonologist',
  'Gastroenterologist', 'Rheumatologist', 'Urologist', 'General Physician', 'Other'
];

const Register = () => {
  const [tab, setTab] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    specialization: '', experience_years: '', base_fee: '', bio: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (form.phone && !/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
    if (!form.password) errs.password = 'Password required';
    else if (form.password.length < 8) errs.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (tab === 'doctor') {
      if (!form.specialization) errs.specialization = 'Specialization required';
      if (!form.base_fee || parseFloat(form.base_fee) <= 0) errs.base_fee = 'Valid fee required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (tab === 'patient') {
        await api.post('/auth/register', {
          name: form.name, email: form.email, phone: form.phone, password: form.password
        });
        toast.success('Account created! Please login.');
        navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
      } else {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('email', form.email);
        fd.append('phone', form.phone);
        fd.append('password', form.password);
        fd.append('specialization', form.specialization);
        fd.append('experience_years', form.experience_years || 0);
        fd.append('base_fee', form.base_fee);
        fd.append('bio', form.bio);
        if (certFile) fd.append('certificate', certFile);

        await api.post('/auth/register-doctor', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Doctor registration submitted! Await admin approval.');
        navigate('/login', { state: { message: 'Registration successful! Awaiting admin approval.' } });
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, icon, ...props }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        {icon && <span className="input-group-text"><i className={`bi ${icon}`} /></span>}
        <input
          type={type}
          className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          value={form[name]}
          onChange={e => { setForm(p => ({ ...p, [name]: e.target.value })); setErrors(p => ({ ...p, [name]: '' })); }}
          {...props}
        />
        {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f4e 50%, #0d6efd22 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div className="text-center mb-4">
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0d6efd, #6610f2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(13,110,253,0.4)' }}>
            <i className="bi bi-heart-pulse-fill text-white fs-2" />
          </div>
          <h2 style={{ color: 'white', fontWeight: 700 }}>Create Account</h2>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          {/* Tabs */}
          <div className="custom-tabs mb-4">
            <ul className="nav border-bottom">
              <li className="nav-item">
                <button className={`nav-link ${tab === 'patient' ? 'active' : ''}`} onClick={() => setTab('patient')}>
                  <i className="bi bi-person-fill me-2" />Patient
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${tab === 'doctor' ? 'active' : ''}`} onClick={() => setTab('doctor')}>
                  <i className="bi bi-person-badge me-2" />Doctor
                </button>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <Field name="name" label="Full Name" icon="bi-person" placeholder="John Doe" />
              </div>
              <div className="col-md-6">
                <Field name="email" label="Email" type="email" icon="bi-envelope" placeholder="you@example.com" />
              </div>
              <div className="col-md-6">
                <Field name="phone" label="Phone" icon="bi-telephone" placeholder="10-digit number" />
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock" /></span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                    />
                    <button type="button" className="input-group-text" onClick={() => setShowPass(!showPass)}>
                      <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>
              </div>
              <div className="col-12">
                <Field name="confirmPassword" label="Confirm Password" type="password" icon="bi-shield-lock" placeholder="Repeat password" />
              </div>
            </div>

            {tab === 'doctor' && (
              <>
                <div className="divider" />
                <h6 className="text-muted mb-3 fw-semibold">Professional Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Specialization</label>
                      <select
                        className={`form-select ${errors.specialization ? 'is-invalid' : ''}`}
                        value={form.specialization}
                        onChange={e => { setForm(p => ({ ...p, specialization: e.target.value })); setErrors(p => ({ ...p, specialization: '' })); }}
                      >
                        <option value="">Select specialization</option>
                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.specialization && <div className="invalid-feedback">{errors.specialization}</div>}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <Field name="experience_years" label="Experience (years)" type="number" icon="bi-award" placeholder="0" min="0" max="50" />
                  </div>
                  <div className="col-md-3">
                    <Field name="base_fee" label="Consultation Fee (₹)" type="number" icon="bi-currency-rupee" placeholder="500" min="1" />
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Brief professional bio..."
                        value={form.bio}
                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Medical Certificate <span className="text-muted">(optional)</span></label>
                    <FileUpload
                      onFileSelect={setCertFile}
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5 * 1024 * 1024}
                      label="Upload certificate"
                      hint="PDF, JPG, PNG · Max 5MB"
                    />
                  </div>
                </div>

                <div className="alert alert-warning mt-3 py-2" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-info-circle me-2" />
                  Your profile will be reviewed by an admin before you can accept appointments.
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary w-100 py-2 mt-3" disabled={loading} style={{ borderRadius: 10, fontSize: '1rem' }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold text-decoration-none">Sign in</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
