const Razorpay = require('razorpay');

const isRazorpayConfigured = !!(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
);

let razorpayInstance = null;

if (isRazorpayConfigured) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const createRazorpayOrder = async (amount, receipt) => {
  if (isRazorpayConfigured && razorpayInstance) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Razorpay accepts in paise
        currency: 'INR',
        receipt: receipt,
      };
      const order = await razorpayInstance.orders.create(options);
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        mock: false
      };
    } catch (error) {
      console.error('Razorpay order creation failed, falling back to mock:', error);
    }
  }

  // Fallback: Mock order
  return {
    id: `mock_order_${Math.random().toString(36).substring(2, 11)}`,
    amount: Math.round(amount * 100),
    currency: 'INR',
    mock: true
  };
};

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  if (isRazorpayConfigured) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === signature;
  }

  // In mock mode, we approve payments that start with mock_pay
  return !!(paymentId && paymentId.startsWith('mock_pay_'));
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  isRazorpayConfigured
};
