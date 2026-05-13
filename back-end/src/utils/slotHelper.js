const db = require('../config/db');

/**
 * Generate time slots between start and end time with given duration in minutes
 */
const generateTimeSlots = (startTime, endTime, durationMinutes) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const slotStart = minutesToTime(currentMinutes);
    const slotEnd = minutesToTime(currentMinutes + durationMinutes);
    slots.push({ start_time: slotStart, end_time: slotEnd });
    currentMinutes += durationMinutes;
  }

  return slots;
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Get all dates between two dates inclusive
 */
const getDateRange = (fromDate, toDate) => {
  const dates = [];
  const current = new Date(fromDate);
  const end = new Date(toDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * Find next available slot for a doctor after a given date
 */
const findNextAvailableSlot = (doctorId, afterDate) => {
  return db.prepare(`
    SELECT * FROM slots 
    WHERE doctor_id = ? AND date > ? AND is_booked = 0
    ORDER BY date ASC, start_time ASC
    LIMIT 1
  `).get(doctorId, afterDate);
};

module.exports = { generateTimeSlots, getDateRange, findNextAvailableSlot };
