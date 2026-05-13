const db = require('../config/db');
const { calculateFees } = require('../utils/feeCalculator');
const { isMoreThanHoursAway } = require('../utils/dateHelper');
const { findNextAvailableSlot } = require('../utils/slotHelper');

const bookAppointment = (req, res, next) => {
  try {
    const { doctor_id, slot_id, notes } = req.body;

    if (!doctor_id || !slot_id) {
      return res.status(400).json({ success: false, message: 'doctor_id and slot_id are required' });
    }

    const result = db.transaction(() => {
      // Lock and check slot
      const slot = db.prepare('SELECT * FROM slots WHERE id = ? AND doctor_id = ?').get(slot_id, doctor_id);
      if (!slot) throw { statusCode: 404, message: 'Slot not found' };
      if (slot.is_booked) throw { statusCode: 409, message: 'Slot already booked' };

      const doctor = db.prepare('SELECT * FROM doctors WHERE id = ? AND is_approved = 1').get(doctor_id);
      if (!doctor) throw { statusCode: 404, message: 'Doctor not found or not approved' };

      // Calculate fees
      const { doctorFee, commissionAmount, totalFee } = calculateFees(doctor.base_fee);

      // Create appointment
      const apptResult = db.prepare(`
        INSERT INTO appointments (user_id, doctor_id, slot_id, status, total_fee, commission_amount, doctor_fee, notes)
        VALUES (?, ?, ?, 'confirmed', ?, ?, ?, ?)
      `).run(req.user.id, doctor_id, slot_id, totalFee, commissionAmount, doctorFee, notes || null);

      const appointmentId = apptResult.lastInsertRowid;

      // Mark slot as booked
      db.prepare('UPDATE slots SET is_booked = 1 WHERE id = ?').run(slot_id);

      // Create booking notification for user
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, is_read, appointment_id, sent_at)
        VALUES (?, ?, ?, 'booking', 0, ?, datetime('now'))
      `).run(
        req.user.id,
        'Appointment Confirmed',
        `Your appointment on ${slot.date} at ${slot.start_time} has been confirmed.`,
        appointmentId
      );

      // Create reminder notifications (scheduled)
      const slotDateTime = new Date(`${slot.date}T${slot.start_time}:00`);

      const reminders = [
        {
          type: 'reminder_1day',
          title: '1 Day Reminder',
          message: `Reminder: You have an appointment tomorrow at ${slot.start_time}.`,
          scheduled_at: new Date(slotDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'reminder_1hour',
          title: '1 Hour Reminder',
          message: `Reminder: Your appointment is in 1 hour at ${slot.start_time}.`,
          scheduled_at: new Date(slotDateTime.getTime() - 60 * 60 * 1000).toISOString()
        },
        {
          type: 'reminder_15min',
          title: '15 Minute Reminder',
          message: `Reminder: Your appointment starts in 15 minutes at ${slot.start_time}.`,
          scheduled_at: new Date(slotDateTime.getTime() - 15 * 60 * 1000).toISOString()
        }
      ];

      for (const reminder of reminders) {
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, is_read, appointment_id, scheduled_at)
          VALUES (?, ?, ?, ?, 0, ?, ?)
        `).run(req.user.id, reminder.title, reminder.message, reminder.type, appointmentId, reminder.scheduled_at);
      }

      return appointmentId;
    })();

    const appointment = db.prepare(`
      SELECT a.*, s.date, s.start_time, s.end_time, u.name as doctor_name, d.specialization
      FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.id = ?
    `).get(result);

    res.status(201).json({ success: true, data: appointment, message: 'Appointment booked successfully' });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const getMyAppointments = (req, res, next) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, s.date, s.start_time, s.end_time,
             u.name as doctor_name, u.avatar as doctor_avatar,
             d.specialization, d.id as doctor_profile_id
      FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY s.date DESC, s.start_time DESC
    `).all(req.user.id);

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

const getAppointmentById = (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = db.prepare(`
      SELECT a.*, s.date, s.start_time, s.end_time,
             u.name as doctor_name, u.avatar as doctor_avatar, u.email as doctor_email,
             d.specialization, d.base_fee,
             pu.name as patient_name, pu.email as patient_email, pu.phone as patient_phone
      FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN users pu ON a.user_id = pu.id
      WHERE a.id = ?
    `).get(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization check
    if (req.user.role === 'user' && appointment.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'doctor') {
      const doctor = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
      if (!doctor || appointment.doctor_id !== doctor.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

const cancelAppointment = (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = db.prepare(`
      SELECT a.*, s.date, s.start_time FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      WHERE a.id = ? AND a.user_id = ?
    `).get(id, req.user.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!['confirmed', 'pending'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this appointment' });
    }

    if (!isMoreThanHoursAway(appointment.date, appointment.start_time, 24)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel within 24 hours of appointment' });
    }

    db.transaction(() => {
      db.prepare("UPDATE appointments SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(id);
      db.prepare('UPDATE slots SET is_booked = 0 WHERE id = ?').run(appointment.slot_id);
    })();

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

const rescheduleAppointment = (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = db.prepare(`
      SELECT a.*, s.date, s.start_time FROM appointments a
      JOIN slots s ON a.slot_id = s.id
      WHERE a.id = ? AND a.user_id = ?
    `).get(id, req.user.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!['confirmed', 'pending'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule this appointment' });
    }

    if (!isMoreThanHoursAway(appointment.date, appointment.start_time, 24)) {
      return res.status(400).json({ success: false, message: 'Cannot reschedule within 24 hours of appointment' });
    }

    const nextSlot = findNextAvailableSlot(appointment.doctor_id, appointment.date);

    if (!nextSlot) {
      return res.status(409).json({
        success: false,
        message: 'No available slots for rescheduling',
        nextAvailableDate: null
      });
    }

    const { doctorFee, commissionAmount, totalFee } = calculateFees(
      db.prepare('SELECT base_fee FROM doctors WHERE id = ?').get(appointment.doctor_id).base_fee
    );

    db.transaction(() => {
      // Free old slot
      db.prepare('UPDATE slots SET is_booked = 0 WHERE id = ?').run(appointment.slot_id);

      // Create new appointment
      const newAppt = db.prepare(`
        INSERT INTO appointments (user_id, doctor_id, slot_id, status, total_fee, commission_amount, doctor_fee, notes, reschedule_from)
        VALUES (?, ?, ?, 'confirmed', ?, ?, ?, ?, ?)
      `).run(appointment.user_id, appointment.doctor_id, nextSlot.id, totalFee, commissionAmount, doctorFee, appointment.notes, id);

      // Mark old as rescheduled
      db.prepare("UPDATE appointments SET status = 'rescheduled', updated_at = datetime('now') WHERE id = ?").run(id);

      // Book new slot
      db.prepare('UPDATE slots SET is_booked = 1 WHERE id = ?').run(nextSlot.id);

      // Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, is_read, appointment_id, sent_at)
        VALUES (?, ?, ?, 'rescheduled', 0, ?, datetime('now'))
      `).run(
        appointment.user_id,
        'Appointment Rescheduled',
        `Your appointment has been rescheduled to ${nextSlot.date} at ${nextSlot.start_time}.`,
        newAppt.lastInsertRowid
      );
    })();

    res.json({
      success: true,
      message: `Appointment rescheduled to ${nextSlot.date} at ${nextSlot.start_time}`,
      data: { newDate: nextSlot.date, newTime: nextSlot.start_time }
    });
  } catch (err) {
    next(err);
  }
};

const completeAppointment = (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = db.prepare(`
      SELECT * FROM appointments WHERE id = ? AND user_id = ?
    `).get(id, req.user.id);

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (!['confirmed', 'pending'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: 'Only confirmed appointments can be completed' });
    }

    db.prepare("UPDATE appointments SET status = 'completed', updated_at = datetime('now') WHERE id = ?").run(id);

    res.json({ success: true, message: 'Appointment marked as completed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { bookAppointment, getMyAppointments, getAppointmentById, cancelAppointment, rescheduleAppointment, completeAppointment };
