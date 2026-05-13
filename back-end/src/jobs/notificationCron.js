const cron = require('node-cron');
const db = require('../config/db');

const startNotificationCron = () => {
  // Run every minute
  cron.schedule('* * * * *', () => {
    try {
      const now = new Date();
      const nowISO = now.toISOString();

      // 1. Send pending reminders that are due
      const pendingReminders = db.prepare(`
        SELECT n.*, s.date, s.start_time 
        FROM notifications n
        JOIN appointments a ON n.appointment_id = a.id
        JOIN slots s ON a.slot_id = s.id
        WHERE n.sent_at IS NULL 
          AND n.scheduled_at IS NOT NULL
          AND n.scheduled_at <= ?
          AND a.status = 'confirmed'
      `).all(nowISO);

      for (const reminder of pendingReminders) {
        db.prepare("UPDATE notifications SET sent_at = datetime('now') WHERE id = ?").run(reminder.id);
      }

      // 2. Auto-complete appointments that have passed
      const passedAppointments = db.prepare(`
        SELECT a.*, s.date, s.start_time, s.end_time
        FROM appointments a
        JOIN slots s ON a.slot_id = s.id
        WHERE a.status = 'confirmed'
          AND datetime(s.date || ' ' || s.end_time) < datetime('now')
      `).all();

      for (const appt of passedAppointments) {
        db.prepare("UPDATE appointments SET status = 'completed', updated_at = datetime('now') WHERE id = ?").run(appt.id);

        // Check if completion notification already exists
        const existing = db.prepare(`
          SELECT id FROM notifications WHERE appointment_id = ? AND type = 'completion'
        `).get(appt.id);

        if (!existing) {
          db.prepare(`
            INSERT INTO notifications (user_id, title, message, type, is_read, appointment_id, sent_at)
            VALUES (?, ?, ?, 'completion', 0, ?, datetime('now'))
          `).run(
            appt.user_id,
            'Appointment Completed',
            `Your appointment on ${appt.date} at ${appt.start_time} has been completed.`,
            appt.id
          );
        }
      }

    } catch (err) {
      console.error('[Cron] Error:', err.message);
    }
  });

  console.log('[Cron] Notification cron job started');
};

module.exports = { startNotificationCron };
