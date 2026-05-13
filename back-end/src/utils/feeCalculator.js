const db = require('../config/db');

const getCommission = () => {
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'commission_percentage'").get();
  return setting ? parseFloat(setting.value) : 10;
};

const calculateFees = (baseFee) => {
  const commissionPct = getCommission();
  const doctorFee = parseFloat(baseFee);
  const commissionAmount = parseFloat(((doctorFee * commissionPct) / 100).toFixed(2));
  const totalFee = parseFloat((doctorFee + commissionAmount).toFixed(2));
  return { doctorFee, commissionAmount, totalFee, commissionPct };
};

module.exports = { calculateFees, getCommission };
