const express = require("express");
const userController = require("../controllers/userController");
// Add { mergeParams: true } to merge parent route params with child route params
const router = express.Router({ mergeParams: true }); 

router
    .route("/")
    .post(userController.createUser)

module.exports = router;

