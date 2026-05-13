import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import FileUpload from '../../components/FileUpload';
import { formatFee } from '../../utils/feeDisplay';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingCommission, setSavingCommission] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [form, setForm] = useState({ app_name: '', commission_percentage: 10 });

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    Promise.all([
      api.get('/admin/settings'),
      api.get('/admin/storage'),
    ]).then(([sRes, stRes]) => {
      const s = sRes.data || {};
      setSettings(s);
      setForm({ app_name: s.app_name || '', commission_percentage: parseFloat(s.commission_percentage || 10) });
      setStorageInfo(stRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleBrandingSave = async (e) => {
    e.preventDefault();
    setSavingBranding(true);
    try {
      await api.patch('/admin/settings', { app_name: form.app_name });
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        await api.post('/admin/upload/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success('Branding settings saved');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSavingBranding(false);
    }
  };

  const handleCommissionSave = async (e) => {
    e.preventDefault();
    const val = parseFloat(form.commission_percentage);
    if (isNaN(val) || val < 0 || val > 50) {
      toast.error('Commission must be between 0 and 50');
      return;
    }
    setSavingCommission(true);
    try {
      await api.patch('/admin/settings', { commission_percentage: String(val) });
      toast.success('Commission rate updated');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSavingCommission(false);
    }
  };

  const commPct = parseFloat(form.commission_percentage) || 0;
  const sampleFee = 500;
  const sampleComm = ((sampleFee * commPct) / 100).toFixed(2);
  const sampleTotal = (sampleFee + parseFloat(sampleComm)).toFixed(2);

  if (loading) return <div className="skeleton skeleton-card" style={{ height: 400 }} />;

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-gear-fill me-2 text-primary" />Settings</h2>
        <p className="text-muted">Configure system preferences</p>
      </div>

      <div className="row g-4">
        {/* App Branding */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-brush me-2 text-primary" />App Branding</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleBrandingSave}>
                <div className="mb-3">
                  <label className="form-label">App Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.app_name}
                    onChange={e => setForm(p => ({ ...p, app_name: e.target.value }))}
                    placeholder="MediBook"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">App Logo</label>
                  {settings.app_logo_path && (
                    <div className="mb-2">
                      <img
                        src={`${baseUrl}${settings.app_logo_path}`}
                        alt="Current logo"
                        style={{ height: 48, objectFit: 'contain', marginBottom: 8 }}
                      />
                    </div>
                  )}
                  <FileUpload
                    onFileSelect={setLogoFile}
                    accept=".png,.jpg,.jpeg,.svg"
                    maxSize={2 * 1024 * 1024}
                    label="Upload logo"
                    hint="PNG, JPG, SVG · Max 2MB"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingBranding}>
                  {savingBranding ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Branding'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Commission */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-percent me-2 text-primary" />Commission Settings</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleCommissionSave}>
                <div className="mb-3">
                  <label className="form-label">Commission Percentage</label>
                  <div className="input-group" style={{ maxWidth: 200 }}>
                    <input
                      type="number"
                      className="form-control"
                      min="0" max="50" step="0.5"
                      value={form.commission_percentage}
                      onChange={e => setForm(p => ({ ...p, commission_percentage: e.target.value }))}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <div className="form-text">0–50% range</div>
                </div>

                {/* Live Preview */}
                <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-light)', fontSize: '0.875rem' }}>
                  <div className="fw-semibold mb-2 text-muted">Live Preview</div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Doctor fee (example)</span>
                    <span>{formatFee(sampleFee)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Commission ({commPct}%)</span>
                    <span>{formatFee(sampleComm)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2 mt-1">
                    <span className="fw-bold">Patient pays</span>
                    <span className="fw-bold text-primary">{formatFee(sampleTotal)}</span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={savingCommission}>
                  {savingCommission ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Commission'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-info-circle me-2 text-primary" />System Information</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="p-3 rounded-3" style={{ background: 'var(--bg-light)' }}>
                    <div className="text-muted mb-1" style={{ fontSize: '0.82rem' }}>Upload Storage</div>
                    <div className="fw-bold">{storageInfo?.uploadsSize || 'Calculating...'}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 rounded-3" style={{ background: 'var(--bg-light)' }}>
                    <div className="text-muted mb-1" style={{ fontSize: '0.82rem' }}>Database Size</div>
                    <div className="fw-bold">{storageInfo?.dbSize || 'Calculating...'}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 rounded-3" style={{ background: 'var(--bg-light)' }}>
                    <div className="text-muted mb-1" style={{ fontSize: '0.82rem' }}>App Version</div>
                    <div className="fw-bold">MediBook v1.0.0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
