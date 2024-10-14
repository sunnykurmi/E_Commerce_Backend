const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isLoggedIn } = require('../middlewares/authMiddlewares');

// Route to add a product to the cart
router.post('/add',isLoggedIn, cartController.addToCart);

// Route to get the cart details for a specific user
router.get('/user',isLoggedIn, cartController.getCart);

// New route for updating quantity
router.post('/update-quantity',isLoggedIn, cartController.updateQuantity);


// Delete a product from the cart based on productId
router.post('/remove',isLoggedIn, cartController.deleteFromCart);

module.exports = router;
