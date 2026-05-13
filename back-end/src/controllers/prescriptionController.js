const db = require('../config/db');

const createPrescription = (req, res, next) => {
  try {
    const { appointment_id, diagnosis, medicines, instructions, follow_up_date } = req.body;

    if (!appointment_id || !diagnosis) {
      return res.status(400).json({ success: false, message: 'appointment_id and diagnosis are required' });
    }

    const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const appointment = db.prepare(`
      SELECT * FROM appointments WHERE id = ? AND doctor_id = ? AND status = 'completed'
    `).get(appointment_id, doctor.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or not completed' });
    }

    const existing = db.prepare('SELECT id FROM prescriptions WHERE appointment_id = ?').get(appointment_id);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Prescription already exists for this appointment' });
    }

    const medicinesJson = typeof medicines === 'string' ? medicines : JSON.stringify(medicines || []);

    const result = db.prepare(`
      INSERT INTO prescriptions (appointment_id, doctor_id, user_id, diagnosis, medicines, instructions, follow_up_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(appointment_id, doctor.id, appointment.user_id, diagnosis, medicinesJson, instructions || null, follow_up_date || null);

    const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: prescription, message: 'Prescription created successfully' });
  } catch (err) {
    next(err);
  }
};

const getMyPrescriptions = (req, res, next) => {
  try {
    const prescriptions = db.prepare(`
      SELECT p.*, u.name as doctor_name, d.specialization,
             a.id as appt_id, s.date as appointment_date
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN appointments a ON p.appointment_id = a.id
      JOIN slots s ON a.slot_id = s.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.id);

    const parsed = prescriptions.map(p => ({
      ...p,
      medicines: JSON.parse(p.medicines || '[]')
    }));

    res.json({ success: true, data: parsed });
  } catch (err) {
    next(err);
  }
};

const getPrescriptionByAppointment = (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const prescription = db.prepare(`
      SELECT p.*, u.name as doctor_name, d.specialization,
             pu.name as patient_name
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN users pu ON p.user_id = pu.id
      WHERE p.appointment_id = ?
    `).get(appointmentId);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Authorization
    const doctorProfile = req.user.role === 'doctor'
      ? db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id)
      : null;

    if (req.user.role === 'user' && prescription.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && (!doctorProfile || prescription.doctor_id !== doctorProfile.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    prescription.medicines = JSON.parse(prescription.medicines || '[]');
    res.json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPrescription, getMyPrescriptions, getPrescriptionByAppointment };
