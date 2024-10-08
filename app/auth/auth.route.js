const express = require('express');
const router = express.Router();
const authController = require('./authController')
const rateLimiter = require("../utils/rate.limit.js");

//------------user--------------//
router.post('/user/signup', authController.signUp);
router.post('/user/login', authController.login);


//------------general--------------//
router.post('/confirmemail', authController.verifyEmail);
router.put("/setPassword", authController.setPassword);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/istokenvalid", authController.checkToken)
router.post("/reSendcode", rateLimiter, authController.reSendcode);
router.post("/logout", authController.signOut)
router.get("/checkToken", authController.checkToken)


module.exports = router;

