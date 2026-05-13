const db = require('../config/db');
const { generateTimeSlots, getDateRange } = require('../utils/slotHelper');

const createSlots = (req, res, next) => {
  try {
    const doctorId = db.prepare('SELECT id, is_approved FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctorId) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    if (!doctorId.is_approved) {
      return res.status(403).json({ success: false, message: 'Your account is pending approval. Cannot create slots.' });
    }

    const { mode, date, from_date, to_date, start_time, end_time, duration } = req.body;

    if (!start_time || !end_time || !duration) {
      return res.status(400).json({ success: false, message: 'start_time, end_time, and duration are required' });
    }

    const timeSlots = generateTimeSlots(start_time, end_time, parseInt(duration));
    if (timeSlots.length === 0) {
      return res.status(400).json({ success: false, message: 'No slots could be generated with the given time range and duration' });
    }

    let dates = [];
    if (mode === 'range') {
      if (!from_date || !to_date) {
        return res.status(400).json({ success: false, message: 'from_date and to_date required for range mode' });
      }
      dates = getDateRange(from_date, to_date);
    } else {
      if (!date) {
        return res.status(400).json({ success: false, message: 'date is required for single mode' });
      }
      dates = [date];
    }

    const today = new Date().toISOString().split('T')[0];
    dates = dates.filter(d => d >= today);

    if (dates.length === 0) {
      return res.status(400).json({ success: false, message: 'All dates are in the past' });
    }

    const insert = db.prepare('INSERT OR IGNORE INTO slots (doctor_id, date, start_time, end_time) VALUES (?, ?, ?, ?)');
    const insertMany = db.transaction(() => {
      let count = 0;
      for (const d of dates) {
        for (const slot of timeSlots) {
          const info = insert.run(doctorId.id, d, slot.start_time, slot.end_time);
          count += info.changes;
        }
      }
      return count;
    });

    const count = insertMany();
    res.status(201).json({ success: true, data: { created: count }, message: `${count} slots created successfully` });
  } catch (err) {
    next(err);
  }
};

const deleteSlot = (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const slot = db.prepare('SELECT * FROM slots WHERE id = ? AND doctor_id = ?').get(id, doctor.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.is_booked) return res.status(400).json({ success: false, message: 'Cannot delete a booked slot' });

    db.prepare('DELETE FROM slots WHERE id = ?').run(id);
    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getMySlots = (req, res, next) => {
  try {
    const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const { date } = req.query;
    let query = `
      SELECT s.*, 
        CASE WHEN s.is_booked = 1 THEN u.name ELSE NULL END as patient_name,
        a.id as appointment_id, a.status as appointment_status
      FROM slots s
      LEFT JOIN appointments a ON s.id = a.slot_id AND a.status NOT IN ('cancelled')
      LEFT JOIN users u ON a.user_id = u.id
      WHERE s.doctor_id = ?
    `;
    const params = [doctor.id];

    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    }

    query += ' ORDER BY s.date ASC, s.start_time ASC';

    const slots = db.prepare(query).all(...params);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};

const getDoctorProfile = (req, res, next) => {
  try {
    const doctor = db.prepare(`
      SELECT d.*, u.name, u.email, u.phone, u.avatar
      FROM doctors d JOIN users u ON d.user_id = u.id
      WHERE d.user_id = ?
    `).get(req.user.id);

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

const updateDoctorProfile = (req, res, next) => {
  try {
    const { specialization, experience_years, base_fee, bio, is_available } = req.body;
    const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const updates = {};
    if (specialization !== undefined) updates.specialization = specialization;
    if (experience_years !== undefined) updates.experience_years = parseInt(experience_years);
    if (base_fee !== undefined) updates.base_fee = parseFloat(base_fee);
    if (bio !== undefined) updates.bio = bio;
    if (is_available !== undefined) updates.is_available = is_available ? 1 : 0;

    if (req.file) {
      updates.certificate_path = `/uploads/certificates/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE doctors SET ${setClause} WHERE id = ?`).run(...Object.values(updates), doctor.id);

    const updated = db.prepare(`
      SELECT d.*, u.name, u.email, u.phone, u.avatar
      FROM doctors d JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `).get(doctor.id);

    res.json({ success: true, data: updated, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

const getDoctorAppointments = (req, res, next) => {
  try {
    const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointments = db.prepare(`
      SELECT a.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone,
             s.date, s.start_time, s.end_time
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN slots s ON a.slot_id = s.id
      WHERE a.doctor_id = ?
      ORDER BY s.date DESC, s.start_time DESC
    `).all(doctor.id);

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

const completeAppointment = (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointment = db.prepare(`
      SELECT a.*, s.date, s.start_time FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      WHERE a.id = ? AND a.doctor_id = ?
    `).get(id, doctor.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Only confirmed appointments can be completed' });
    }

    db.prepare("UPDATE appointments SET status = 'completed', updated_at = datetime('now') WHERE id = ?").run(id);

    // Create completion notification for patient
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read, appointment_id, sent_at)
      VALUES (?, ?, ?, 'completion', 0, ?, datetime('now'))
    `).run(
      appointment.user_id,
      'Appointment Completed',
      `Your appointment has been marked as completed. Please add a review or view your prescription.`,
      id
    );

    res.json({ success: true, message: 'Appointment marked as completed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSlots, deleteSlot, getMySlots, getDoctorProfile, updateDoctorProfile, getDoctorAppointments, completeAppointment };
