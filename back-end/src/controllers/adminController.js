const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const getAdminDoctors = (req, res, next) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT d.*, u.name, u.email, u.phone, u.avatar, u.is_active, u.created_at as user_created_at
      FROM doctors d JOIN users u ON d.user_id = u.id
    `;
    const params = [];

    if (status === 'pending') {
      query += ' WHERE d.is_approved = 0';
    } else if (status === 'approved') {
      query += ' WHERE d.is_approved = 1';
    }

    query += ' ORDER BY d.created_at DESC';

    const doctors = db.prepare(query).all(...params);
    res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
};

const approveDoctor = (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = db.prepare('SELECT d.*, u.name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?').get(id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    db.prepare('UPDATE doctors SET is_approved = 1 WHERE id = ?').run(id);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read, sent_at)
      VALUES (?, ?, ?, 'approval', 0, datetime('now'))
    `).run(
      doctor.user_id,
      'Account Approved!',
      'Congratulations! Your doctor account has been approved. You can now create slots and accept appointments.'
    );

    res.json({ success: true, message: 'Doctor approved successfully' });
  } catch (err) {
    next(err);
  }
};

const rejectDoctor = (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    db.prepare('UPDATE doctors SET is_approved = 0 WHERE id = ?').run(id);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read, sent_at)
      VALUES (?, ?, ?, 'approval', 0, datetime('now'))
    `).run(
      doctor.user_id,
      'Account Application Update',
      'Your doctor account application has been reviewed. Please contact support for more information.'
    );

    res.json({ success: true, message: 'Doctor rejected' });
  } catch (err) {
    next(err);
  }
};

const getAdminUsers = (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = 'SELECT id, name, email, phone, role, avatar, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const users = db.prepare(query).all(...params);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const toggleUserActive = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, id);
    res.json({ success: true, message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    next(err);
  }
};

const getAdminAppointments = (req, res, next) => {
  try {
    const { status, doctor_id, from_date, to_date } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, s.date, s.start_time, s.end_time,
             pu.name as patient_name, pu.email as patient_email,
             du.name as doctor_name, d.specialization
      FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      JOIN users pu ON a.user_id = pu.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (doctor_id) { query += ' AND a.doctor_id = ?'; params.push(doctor_id); }
    if (from_date) { query += ' AND s.date >= ?'; params.push(from_date); }
    if (to_date) { query += ' AND s.date <= ?'; params.push(to_date); }

    const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
    const total = db.prepare(countQuery).get(...params).count;

    query += ' ORDER BY s.date DESC, s.start_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const appointments = db.prepare(query).all(...params);
    res.json({ success: true, data: appointments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

const getAdminStats = (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const stats = {
      totalUsers: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get().c,
      totalDoctors: db.prepare("SELECT COUNT(*) as c FROM doctors").get().c,
      approvedDoctors: db.prepare("SELECT COUNT(*) as c FROM doctors WHERE is_approved = 1").get().c,
      pendingDoctors: db.prepare("SELECT COUNT(*) as c FROM doctors WHERE is_approved = 0").get().c,
      totalAppointments: db.prepare("SELECT COUNT(*) as c FROM appointments").get().c,
      todayAppointments: db.prepare("SELECT COUNT(*) as c FROM appointments a JOIN slots s ON a.slot_id = s.id WHERE s.date = ?").get(today).c,
      totalRevenue: db.prepare("SELECT COALESCE(SUM(total_fee), 0) as r FROM appointments WHERE status = 'completed'").get().r,
    };

    // Last 7 days appointments
    const last7Days = db.prepare(`
      SELECT s.date, COUNT(*) as count
      FROM appointments a JOIN slots s ON a.slot_id = s.id
      WHERE s.date >= date('now', '-7 days')
      GROUP BY s.date ORDER BY s.date ASC
    `).all();

    // Status distribution
    const statusDist = db.prepare(`
      SELECT status, COUNT(*) as count FROM appointments GROUP BY status
    `).all();

    res.json({ success: true, data: { ...stats, last7Days, statusDist } });
  } catch (err) {
    next(err);
  }
};

const getSettings = (req, res, next) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const obj = {};
    settings.forEach(s => obj[s.key] = s.value);
    res.json({ success: true, data: obj });
  } catch (err) {
    next(err);
  }
};

const updateSettings = (req, res, next) => {
  try {
    const updates = req.body;
    const update = db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");

    db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        update.run(key, String(value));
      }
    })();

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    next(err);
  }
};

const uploadLogo = (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const logoPath = `/uploads/logos/${req.file.filename}`;
    db.prepare("INSERT INTO settings (key, value, updated_at) VALUES ('app_logo_path', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at").run(logoPath);

    res.json({ success: true, data: { path: logoPath }, message: 'Logo uploaded successfully' });
  } catch (err) {
    next(err);
  }
};

const getStorageInfo = (req, res, next) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const dbPath = path.join(__dirname, '../../medibook.db');

    let uploadsSize = 0;
    const getSize = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        for (const f of files) {
          const fp = path.join(dir, f);
          const stat = fs.statSync(fp);
          if (stat.isDirectory()) getSize(fp);
          else uploadsSize += stat.size;
        }
      } catch (e) {}
    };
    getSize(uploadDir);

    let dbSize = 0;
    try { dbSize = fs.statSync(dbPath).size; } catch (e) {}

    res.json({
      success: true,
      data: {
        uploadsSize: (uploadsSize / 1024).toFixed(2) + ' KB',
        dbSize: (dbSize / 1024).toFixed(2) + ' KB'
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDoctors, approveDoctor, rejectDoctor,
  getAdminUsers, toggleUserActive,
  getAdminAppointments, getAdminStats,
  getSettings, updateSettings, uploadLogo, getStorageInfo
};
