const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    username: {
        type: String,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    profilePic: {
        type: String,
        default: null
    },
    isSeller: {
        type: Boolean,
        default: false
    },
    wishlist: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product'  // Referencing the Product model
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
