
// controllers/authRoutes.js
const express=require('express');
const router = express.Router();
const { register, login, logout, validateRegistration, sendResetPasswordEmail, resetPassword, validateLogin, getSingleUser, test } = require('../controllers/authControllers'); // Ensure the path is correct
const {isLoggedIn} = require('../middlewares/authMiddlewares');


// User registration route
router.post('/register',validateRegistration, register);

// User login route
router.post('/login', validateLogin, login);
// router.post('/logout', logout);
router.get('/profile',isLoggedIn,function(req,res){
    res.send('welcome user!');
});
router.get('/logout',logout);
router.get('/user',isLoggedIn, getSingleUser);
router.get('/',test)



module.exports = router; // This is correct