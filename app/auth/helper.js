const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.js");
const jwtGenerator = require("../utils/jwt.generator.js");
const { SEND_EMAIL_BY_NODEMAILER } = require("../utils/email.configuration.js");
const userModel = require ('../db/models/userModel.js');
const { domains } = require("googleapis/build/src/apis/domains/index.js");


//............check from atcivate email.........//
const sendEmail = async function (user, messagHeader, code = "") {
  const message = `${code ? `Recovery Code: ${code}` : ""}`;
  const info = SEND_EMAIL_BY_NODEMAILER(user.email, messagHeader, message);
  return info;
};
//`<a href='${link}'>follow me to ${messageLink}</a> <br></br>
const sendConfirmEmail = async function (req, user, routeLink, messageLink, messagHeader, code = "") {
  let tokenconfirm
  tokenconfirm = await jwtGenerator({ userId: user.userId, TO: "user" }, 1, "h");
  //const link = `${req.protocol}://${req.headers.host}/api/v1/${routeLink}/${tokenconfirm}`;
  const message =  `${code ? ` Code to confirm your account: ${code}` : ""}<br></br>`;
  const info = SEND_EMAIL_BY_NODEMAILER(user.email, messagHeader, message);
  return info;
};

const checktype=(type)=>{
  if(type=="user"){
    return  userModel
  }
}

//--------------------//

module.exports = {
  sendEmail,
  sendConfirmEmail,
  checktype
};
