export const formatAmount = (amount: number, currency: string = 'INR') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (e) {
    // Fallback if currency code is invalid
    return `₹${amount.toLocaleString()}`;
  }
};