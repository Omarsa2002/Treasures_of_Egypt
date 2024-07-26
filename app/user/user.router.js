const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken.js');
const userCon = require('./user.controller.js');

router.get('/userdata', verifyToken, userCon.userData);
router.put("/addtofavourite", verifyToken, userCon.addToFavourite);
router.put("/removefromfavourite", verifyToken, userCon.removeFromFavourite);
router.get("/userfavourite", verifyToken, userCon.userFavourite);
router.get("/recommendations", verifyToken, userCon.recommendations);


module.exports = router;
