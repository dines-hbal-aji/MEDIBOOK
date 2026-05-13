const db = require('../config/db');
const { calculateFees } = require('../utils/feeCalculator');

const getAllDoctors = (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    let query = `
      SELECT d.*, u.name, u.email, u.avatar, u.phone, u.is_active
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.is_approved = 1 AND d.is_available = 1 AND u.is_active = 1
    `;
    const params = [];

    if (specialization) {
      query += ' AND d.specialization = ?';
      params.push(specialization);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR d.specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.name ASC';

    const doctors = db.prepare(query).all(...params);

    const doctorsWithFees = doctors.map(doc => {
      const fees = calculateFees(doc.base_fee);
      return { ...doc, ...fees };
    });

    res.json({ success: true, data: doctorsWithFees });
  } catch (err) {
    next(err);
  }
};

const getDoctorById = (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = db.prepare(`
      SELECT d.*, u.name, u.email, u.avatar, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ? AND d.is_approved = 1
    `).get(id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const fees = calculateFees(doctor.base_fee);

    // Get upcoming available slots
    const today = new Date().toISOString().split('T')[0];
    const slots = db.prepare(`
      SELECT * FROM slots 
      WHERE doctor_id = ? AND date >= ? AND is_booked = 0
      ORDER BY date ASC, start_time ASC
      LIMIT 50
    `).all(id, today);

    res.json({ success: true, data: { ...doctor, ...fees, slots } });
  } catch (err) {
    next(err);
  }
};

const getDoctorSlots = (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ? AND is_approved = 1').get(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const slots = db.prepare(`
      SELECT * FROM slots WHERE doctor_id = ? AND date = ?
      ORDER BY start_time ASC
    `).all(id, date);

    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDoctors, getDoctorById, getDoctorSlots };
