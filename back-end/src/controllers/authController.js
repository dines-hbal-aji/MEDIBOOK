const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = bcrypt.hashSync(password, 12);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, password_hash, 'user', phone || null);

    const token = generateToken(result.lastInsertRowid);
    const user = db.prepare('SELECT id, name, email, role, phone, avatar, is_active, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({ success: true, data: { user, token }, message: 'Registration successful' });
  } catch (err) {
    next(err);
  }
};

const registerDoctor = (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, experience_years, base_fee, bio } = req.body;

    if (!name || !email || !password || !specialization || !base_fee) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = bcrypt.hashSync(password, 12);

    const insertUser = db.transaction(() => {
      const userResult = db.prepare(
        'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
      ).run(name, email, password_hash, 'doctor', phone || null);

      const userId = userResult.lastInsertRowid;
      const certificatePath = req.file ? `/uploads/certificates/${req.file.filename}` : null;

      db.prepare(
        'INSERT INTO doctors (user_id, specialization, experience_years, base_fee, bio, certificate_path) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(userId, specialization, parseInt(experience_years) || 0, parseFloat(base_fee), bio || null, certificatePath);

      return userId;
    });

    const userId = insertUser();
    const token = generateToken(userId);
    const user = db.prepare('SELECT id, name, email, role, phone, avatar, is_active, created_at FROM users WHERE id = ?').get(userId);

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Doctor registration successful. Awaiting admin approval.'
    });
  } catch (err) {
    next(err);
  }
};

const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Please contact support.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    const { password_hash, ...safeUser } = user;

    // If doctor, attach doctor info
    let doctorInfo = null;
    if (user.role === 'doctor') {
      doctorInfo = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id);
    }

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.json({
      success: true,
      data: { user: safeUser, token, doctor: doctorInfo },
      message: 'Login successful'
    });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

const me = (req, res) => {
  const user = req.user;
  let doctorInfo = null;
  if (user.role === 'doctor') {
    doctorInfo = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id);
  }
  res.json({ success: true, data: { user, doctor: doctorInfo } });
};

module.exports = { register, registerDoctor, login, logout, me };
