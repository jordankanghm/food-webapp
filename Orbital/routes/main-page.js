const path = require('path');
const express = require('express');
const app = express();
const router = express.Router();

const userController = require('../controllers/user');
const product = [];


// router.get('/', (req, res, next) => {
//     res.render('test', {
//         user: userController.userData
//     });
// })


// router.post('/saved', (req, res, next) => {
//     res.render('saved', {
//         user: userController.userData
//     });
// })

// router.post('/recommendations', (req, res, next) => {
//     res.render('recommendations', {
//         user: userController.userData
//     });
// })

// router.post('/trends', (req, res, next) => {
//     res.render('trends', {
//         user: userController.userData
//     });
// })

// router.post('/', (req, res, next) => {
//     console.log(req.body.keyword);
// })

app


exports.routes = router;
exports.product = product;