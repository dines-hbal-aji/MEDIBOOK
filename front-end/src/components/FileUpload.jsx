import { useState } from 'react';

const FileUpload = ({ onFileSelect, accept, maxSize, label, hint }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const validateFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    const allowedExts = accept?.replace(/\./g, '').split(',').map(e => e.trim()) || [];

    if (allowedExts.length && !allowedExts.includes(ext)) {
      setError(`Invalid file type. Allowed: ${accept}`);
      return;
    }

    if (maxSize && f.size > maxSize) {
      setError(`File too large. Max size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }

    setError('');
    setFile(f);
    onFileSelect(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    validateFile(f);
  };

  const handleChange = (e) => {
    validateFile(e.target.files[0]);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => document.getElementById('file-upload-input').click()}
      >
        <input
          id="file-upload-input"
          type="file"
          style={{ display: 'none' }}
          accept={accept}
          onChange={handleChange}
        />

        {file ? (
          <div>
            <i className="bi bi-file-earmark-check fs-2 text-success d-block mb-2" />
            <div className="fw-semibold">{file.name}</div>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{formatSize(file.size)}</div>
            <button
              className="btn btn-sm btn-outline-danger mt-2"
              onClick={(e) => { e.stopPropagation(); setFile(null); onFileSelect(null); }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <i className="bi bi-cloud-upload fs-2 text-primary d-block mb-2" />
            <div className="fw-semibold">{label || 'Click or drag file here'}</div>
            <div className="text-muted" style={{ fontSize: '0.82rem' }}>{hint || `Accepted: ${accept}`}</div>
          </div>
        )}
      </div>

      {error && <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}><i className="bi bi-exclamation-circle me-1" />{error}</div>}
    </div>
  );
};

export default FileUpload;
