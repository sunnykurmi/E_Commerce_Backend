const productModel = require("../models/productModel")
const userModel = require("../models/userModel")


const createProduct = async (req, res) => {
  try {
    // Find the user from the database
    const user = await userModel.findById(req.id) // Adjust the user model import to match your app

    // Check if the user exists and if they are a seller
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!user.isSeller) {
      return res
        .status(403)
        .json({ message: "Only sellers are allowed to create products" })
    }
    // Destructure the data from the request body
    const { title, images, description, price, category } = req.body

    // Validate the data (simple validation for demonstration)
    if (!title || !images || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Create a new product
    const newProduct = new productModel({
      title,
      images,
      description,
      price,
      category, // Include the category field in the new product
      user: user._id, // Associate the product with the seller (user)
    })

    // Save the product to the database
    await newProduct.save()

    // Respond with the created product
    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    })
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getAllProducts = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await productModel.find()

    // Return the list of products
    res.status(200).json({
      message: "Products retrieved successfully",
      products: products,
    })
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getSellerProducts = async (req, res) => {
  try {
    // Find the seller in the database
    const seller = await userModel.findById(req.id);
    
    // Check if the seller exists and is indeed a seller
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }


    // Find products associated with the seller
    const products = await productModel.find({ user: req.id });

    // Return the list of products created by the seller
    res.status(200).json({
      products: products,
      message: "Products retrieved successfully",
    });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const userId = req.id

    // Find the product in the database
    const product = await productModel.findById(productId)

    // Check if the product exists and if the seller is the owner
    if (!product || product.user.toString() !== userId) {
      return res
        .status(404)
        .json({ message: "Product not found or you are not the owner" })
    }

    // Update product fields based on the request body
    const { title, images, description, price, category } = req.body
    if (title) product.title = title
    if (images) product.images = images
    if (description) product.description = description
    if (price) product.price = price
    if (category) product.category = category

    // Save the updated product
    await product.save()

    res.status(200).json({
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const userId = req.id

    // Find the product and deletes in the database
    const product = await productModel.findByIdAndDelete(productId)

    // // Check if the product exists and if the seller is the owner
    // if (!product || product.user.toString() !== userId) {
    //   return res
    //     .status(404)
    //     .json({ message: "Product not found or you are not the owner" })
    // }


    res.status(200).json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getSingleProduct = async (req, res) => {

  try {
    const productId = req.params.id // Get product ID from the request parameters

    // Find the product in the database by ID
    const product = await productModel
      .findById(productId)
      // .populate("user", "name email") // Populate seller's name and email if needed

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Return the product details
    res.status(200).json({
      message: "Product retrieved successfully",
      product,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add a product to the wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.id // Assuming you have the user ID from authentication (e.g., JWT)
    const { productId } = req.body // Get the product ID from the request body

    // Find the product by ID to ensure it exists
    const product = await productModel.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Find the user and check their wishlist
    const user = await userModel.findById(userId)

    // Check if the product is already in the wishlist
    if (user.wishlist.includes(productId)) {
      return res
        .status(400)
        .json({ message: "Product is already in the wishlist" })
    }

    // Check if the wishlist has reached the limit of 10 products
    if (user.wishlist.length >= 10) {
      return res
        .status(400)
        .json({
          message: "You can only add up to 10 products to your wishlist",
        })
    }

    // Add the product to the wishlist
    user.wishlist.push(productId)
    await user.save() // Save the updated user document

    res.status(200).json({ message: "Product added to wishlist successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all products in the user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.id // Assuming you have the user ID from authentication (e.g., JWT)

    // Find the user and populate the wishlist with product details
    const user = await userModel.findById(userId).populate("wishlist")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      message: "Wishlist retrieved successfully",
      wishlist: user.wishlist, // Return the wishlist products
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Remove a product from the wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.id // Assuming you have the user ID from authentication (e.g., JWT)
    const { productId } = req.params // Get the product ID from the request parameters

    // Find the user
    const user = await userModel.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the product is in the user's wishlist
    const index = user.wishlist.indexOf(productId)
    if (index === -1) {
      return res.status(400).json({ message: "Product not found in wishlist" })
    }

    // Remove the product from the wishlist
    user.wishlist.splice(index, 1)
    await user.save() // Save the updated user document

    res
      .status(200)
      .json({ message: "Product removed from wishlist successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  getSellerProducts,
}
