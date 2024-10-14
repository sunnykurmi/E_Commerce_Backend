const Razorpay = require('razorpay');
const Payment = require('../models/paymentModel.js');
const Cart = require("../models/cartModel.js")

// Configure Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
const createOrder = async (req, res) => {
  const userId = req.id; 
  try {
    // Find the user's cart by userId
    const cart = await Cart.findOne({ userId }).populate('products.productId'); 
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;

    // Calculate the total price of the products in the cart
    cart.products.forEach(item => {
      totalAmount += item.productId.price * item.quantity; 
    });

    // Convert totalAmount to the smallest currency unit (paise in INR)
    const amountInPaise = totalAmount * 100;

    // Create Razorpay order options
    const options = {
      amount: amountInPaise, // Amount in paise
      currency: "INR",
      payment_capture: 1, 
    };

    // Create the Razorpay order
    const order = await razorpay.orders.create(options);

    // Save the order details in the Payment model
    const newPayment = await Payment.create({
      userId: userId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'pending',
    });

    await newPayment.save();

    // Send the order details to the frontend
    res.json(order);

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).send('Error creating order');
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils.js');

    // Verify the payment using Razorpay's utility function
    const result = validatePaymentVerification(
      { "order_id": razorpayOrderId, "payment_id": razorpayPaymentId },
      signature,
      secret
    );

    if (result) {
      // Update payment status in the database
      const payment = await Payment.findOne({ orderId: razorpayOrderId });
      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = 'completed';
      await payment.save();

      res.json({ status: 'success' , orderId: razorpayOrderId});
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).send('Error verifying payment');
  }
};

module.exports = { createOrder, verifyPayment };
