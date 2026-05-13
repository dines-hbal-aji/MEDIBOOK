import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatDate';

const AddPrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    diagnosis: '',
    instructions: '',
    follow_up_date: '',
  });
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`)
      .then(res => setAppt(res.data))
      .catch(() => { toast.error('Appointment not found'); navigate('/doctor/appointments'); })
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const addMedicine = () => setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '' }]);
  const removeMedicine = (i) => setMedicines(prev => prev.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, val) => {
    setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) { toast.error('Diagnosis is required'); return; }
    setSaving(true);
    try {
      await api.post('/prescriptions', {
        appointment_id: parseInt(appointmentId),
        diagnosis: form.diagnosis,
        medicines: medicines.filter(m => m.name.trim()),
        instructions: form.instructions,
        follow_up_date: form.follow_up_date || null,
      });
      toast.success('Prescription created successfully');
      navigate('/doctor/appointments');
    } catch (err) {
      toast.error(err.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton skeleton-card" style={{ height: 400 }} />;

  return (
    <div>
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-2" />Back
      </button>

      <div className="page-header">
        <h2><i className="bi bi-file-medical me-2 text-primary" />Add Prescription</h2>
        {appt && (
          <p className="text-muted">For {appt.patient_name} · {formatDate(appt.date)}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0 fw-semibold">Diagnosis & Instructions</h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Diagnosis <span className="text-danger">*</span></label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Patient's diagnosis..."
                value={form.diagnosis}
                onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Instructions</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Care instructions, diet, lifestyle changes..."
                value={form.instructions}
                onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Follow-up Date <span className="text-muted">(optional)</span></label>
              <input
                type="date"
                className="form-control"
                style={{ maxWidth: 220 }}
                min={new Date().toISOString().split('T')[0]}
                value={form.follow_up_date}
                onChange={e => setForm(p => ({ ...p, follow_up_date: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h6 className="mb-0 fw-semibold">Medicines</h6>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addMedicine}>
              <i className="bi bi-plus-circle me-1" />Add Medicine
            </button>
          </div>
          <div className="card-body">
            {medicines.map((med, i) => (
              <div key={i} className="medicine-row mb-3">
                <div className="row g-2 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Medicine Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g., Paracetamol"
                      value={med.name}
                      onChange={e => updateMedicine(i, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Dosage</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="500mg"
                      value={med.dosage}
                      onChange={e => updateMedicine(i, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Frequency</label>
                    <select
                      className="form-select form-select-sm"
                      value={med.frequency}
                      onChange={e => updateMedicine(i, 'frequency', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>Four times daily</option>
                      <option>As needed</option>
                      <option>Before meals</option>
                      <option>After meals</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Duration</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="7 days"
                      value={med.duration}
                      onChange={e => updateMedicine(i, 'duration', e.target.value)}
                    />
                  </div>
                  <div className="col-md-1">
                    {medicines.length > 1 && (
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeMedicine(i)}>
                        <i className="bi bi-trash" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary px-4" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-save me-2" />Save Prescription</>}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddPrescription;
