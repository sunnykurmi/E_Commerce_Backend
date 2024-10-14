const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentControllers');
const { isLoggedIn } = require('../middlewares/authMiddlewares');

const router = express.Router();

// Route to create an order
router.post('/create/orderId',isLoggedIn, createOrder);

// Route to verify the payment
router.post('/payment/verify',isLoggedIn, verifyPayment);

module.exports = router;
