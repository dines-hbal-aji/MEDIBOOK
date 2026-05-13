export const formatFee = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const feeBreakdown = (doctorFee, commissionAmount, totalFee) => ({
  display: `${formatFee(doctorFee)} + ${formatFee(commissionAmount)} commission = ${formatFee(totalFee)} total`,
  doctorFee: formatFee(doctorFee),
  commission: formatFee(commissionAmount),
  total: formatFee(totalFee)
});
