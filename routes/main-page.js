const path = require('path');
const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const viewController = require('../controllers/view');


// router.get('/', (req, res, next) => {
//     res.render('test');
// })

router.use(userController.isLoggedIn);


router.get('/',userController.isLoggedIn, viewController.getPage);

router.get('/signup', userController.getSignUpForm);
router.post('/signup', userController.signup);
router.get('/login', userController.isLoggedIn, userController.getLoginForm);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

// Protect all routes after this middleware
router.use(userController.protect);


router.route('/saved').get(userController.protect, (req, res, next) => {
        res.render('/saved'); 
    }).post((req, res, next) => {
        res.render('/saved'); 
    });


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



exports.routes = router;
