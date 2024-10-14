const Cart = require('../models/cartModel');
// const Product = require('../models/productModel');
const Order = require("../models/orderModel");
const Product = require('../models/productModel');

// Add product to cart
exports.addToCart = async (req, res) => {
    const userId = req.id;
  const {productId } = req.body;

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (cart) {
      // Check if product already exists in cart
      const productExists = cart.products.find(
        (item) => item.productId.toString() === productId
      );

      if (productExists) {
        return res.status(400).json({
          message: 'Product already in cart',
          cart, // Send the existing cart details back
        });
      }

      // Add new product to cart
      cart.products.push({ productId });
      cart.totalAmount += product.price;
      await cart.save();

      // Redirect to cart with updated cart details
      return res.status(200).json({
        message: 'Product added to cart successfully',
        cart,
      });
    } else {
      // If no cart exists, create a new one
      cart = await Cart.create({
        userId,
        products: [{ productId }],
        totalAmount: product.price,
      });

      // Cart was created, redirect to cart
      return res.status(201).json({
        message: 'Cart created and product added successfully',
        cart,
      });
    }
  } catch (error) {
    res.status(500).send('Error adding product to cart');
  }
};

// Get cart details (including products and total amount)
exports.getCart = async (req, res) => {
  const  userId = req.id;

  try {
    // Find the user's cart and populate product details
    const cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart) {
      return res.status(404).send('Cart not found');
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Error fetching cart');
  }
};


// Update product quantity in the cart
exports.updateQuantity = async (req, res) => {
    const userId = req.id;
    const { productId, quantity } = req.body;

    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        // Find the product in the cart
        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send('Product not found in cart');
        }

        // Update the product quantity
        cart.products[productIndex].quantity = quantity;

        // Recalculate total amount
        const populatedCart = await cart.populate('products.productId');
        cart.totalAmount = populatedCart.products.reduce((total, item) => {
            return total + (item.productId.price * item.quantity);
        }, 0);

        await cart.save();

        res.status(200).json({
            message: 'Cart updated successfully',
            cart,
        });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send('Error updating cart');
    }
};
  


// Delete product from cart based on productId
exports.deleteFromCart = async (req, res) => {
  const { productId } = req.body; // Get the product ID from the request body

  try {
    // Find the cart containing the product
    const cart = await Cart.findOne({ "products.productId": productId });

    if (!cart) {
      return res.status(404).json({ message: 'Product not found in any cart' });
    }

    // Find the index of the product in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Recalculate total amount
    const populatedCart = await cart.populate('products.productId');
    cart.totalAmount = populatedCart.products.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);

    // If the cart is empty, you can delete the cart (optional)
    if (cart.products.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(200).json({ message: 'Cart is now empty and deleted' });
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      message: 'Product removed from cart successfully',
      cart,
    });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).send('Error removing product from cart');
  }
};
