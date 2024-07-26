const express = require("express");
const router = express.Router();
const passport = require("passport");
const accCon=require("./account.controller.js");
const verifyToken = require("../middlewares/verifyToken.js");



router.delete('/delete', verifyToken, accCon.deleteAccount);
router.put("/changePassword",verifyToken, accCon.changePassword);

module.exports = router;
