require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.SERVER_PORT;
const logger = require('morgan')
const userRouter = require('./routes/userRoutes.js')
const cors = require('cors');

app.use(cors(
  {
    origin: true,
    credentials: true,
  }
));

const productRouter= require("./routes/productRoutes.js")
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require("./config/db.js")
const paymentRoutes = require('./routes/paymentRoutes.js');
const cartRoutes = require("./routes/cartRoutes.js")
const orderRoutes = require("./routes/orderRoutes.js")


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(logger("tiny"));
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a strong secret
    resave: false,
    saveUninitialized: true,

}));
connectDB()

app.use('/',userRouter)
app.use('/product',productRouter)

// Use the payment routes
app.use('/payment', paymentRoutes);

// use cart routes
app.use('/cart', cartRoutes);


// use order routes
app.use('/order', orderRoutes);





app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
