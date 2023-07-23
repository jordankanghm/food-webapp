const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const appError = require('./views/appError')

const app = express();



const mainPageRoute = require('./routes/main-page');
const errorController= require('./controllers/404');
// const sequelize = require('./util/database');
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'ejs');

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
// app.use(helmet());


// // Limit requests from same API
const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// // Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());


// // Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'maxGroupSize',
//       'difficulty',
//       'price'
//     ]
//   })
// );


app.use(mainPageRoute.routes);

// app.use(errorController.get404);



mongoose.connect('mongodb+srv://ianwonghanli:RKQ2912LqecxBrCA@orbitaldb.gxc40tw.mongodb.net/' , {
    useNewUrlParser : true,
}).then(() => {
    console.log('Successful!')
});

app.listen(4000, () => {
    console.log("LISTENING ON PORT 4000")
});