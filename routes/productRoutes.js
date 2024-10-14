const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, updateProduct, deleteProduct, getSingleProduct, addToWishlist, getWishlist, removeFromWishlist, getSellerProducts } = require('../controllers/productControllers');
const { isSeller, isLoggedIn } = require('../middlewares/authMiddlewares');

// Product creation, update, and delete routes (only sellers can access)
router.post('/create', isLoggedIn, isSeller, createProduct);
router.post('/update/:id', isLoggedIn, isSeller, updateProduct);  // Update product route
router.post('/delete/:id', isLoggedIn, isSeller, deleteProduct);  // Delete product route
router.post('/:id', isLoggedIn, getSingleProduct);  // Get single product route

// Other routes
router.get('/', isLoggedIn, getAllProducts);  // Fetch all products

router.get('/seller-products',isLoggedIn, isSeller, getSellerProducts);  // Fetch products for a specific seller

// Wishlist routes (authenticated users only)
router.post('/wishlist/add', isLoggedIn, addToWishlist);  // Add product to wishlist
router.get('/wishlist', isLoggedIn, getWishlist);  // Fetch all products in wishlist
router.delete('/wishlist/remove/:productId', isLoggedIn, removeFromWishlist);  // Remove product from wishlist

module.exports = router;
