/**
 * Check if a slot datetime is more than hours from now
 */
const isMoreThanHoursAway = (date, time, hours) => {
  const slotDateTime = new Date(`${date}T${time}:00`);
  const diffMs = slotDateTime.getTime() - Date.now();
  return diffMs > hours * 60 * 60 * 1000;
};

/**
 * Check if a slot is in future
 */
const isInFuture = (date, time) => {
  const slotDateTime = new Date(`${date}T${time}:00`);
  return slotDateTime.getTime() > Date.now();
};

/**
 * Get slot datetime as Date object
 */
const getSlotDateTime = (date, time) => new Date(`${date}T${time}:00`);

/**
 * Format date to human readable
 */
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

/**
 * Get diff in minutes between two Date objects
 */
const diffInMinutes = (date1, date2) => {
  return Math.floor((date1 - date2) / (1000 * 60));
};

module.exports = { isMoreThanHoursAway, isInFuture, getSlotDateTime, formatDate, diffInMinutes };
