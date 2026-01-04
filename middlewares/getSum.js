function getSum(array) {
  let sum = 0;
  let revenue = 0;
  array.map((item) => {
    sum += item.quantity;
    revenue += item.quantity * item.price;
  });

  return { sum, revenue };
}

// utils/sales.js
function total_sales(data = [], paymentMethod, shiftTime) {
  let sum = 0;
  if (!Array.isArray(data)) return sum;

  for (const item of data) {
    if (!item) continue;
    if (item.paymentMethod === paymentMethod && item.shiftTime === shiftTime) {
      const amount = Number(item.amount) || 0;
      sum += amount;
    }
  }
  return sum;
}

module.exports = { getSum, total_sales };
