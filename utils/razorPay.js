const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils.js');
const Payment = require('../models/paymentModel');

// Function to verify Razorpay payment
const verifyPayment = async (razorpayOrderId, razorpayPaymentId, signature, secret) => {
  const isValid = validatePaymentVerification(
    { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
    signature,
    secret
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  const payment = await Payment.findOne({ orderId: razorpayOrderId });
  if (!payment) {
    throw new Error('Payment not found');
  }

  return payment;
};

module.exports = {
  verifyPayment,
};
