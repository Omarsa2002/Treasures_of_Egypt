const userModel = require ('../db/models/userModel.js');
const { sendResponse, validateExpiry } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const helper = require("./helper.js");
const { v4: uuidv4 } = require("uuid");
const jwtGenerator = require("../utils/jwt.generator.js");
const tokenSchema = require("./token.schema.js");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CONFIG.GOOGLE_CLIENT_ID);

//-------------------------------------user-------------------------------------//
const signUp = async(req, res, next) => {
    try {
        const {lang} = req.query
        const { email, userName, password, gender } = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            const newUser = await userModel({
                email,
                userId: "User" + uuidv4(),
                userName,
                password,
            });
            //const confirmLink = "confirm your account";
            const confirmMessag ="Confirmation Email Send From Treasures of Egypt Application";
            const code = Math.floor(10000 + Math.random() * 90000);
            const info = await helper.sendConfirmEmail(req,newUser,"","",confirmMessag,code);
            if (info) {
                const savedUser = await newUser.save();
                await userModel.updateOne(
                    { email },
                    { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
                );
                (lang === "en")? 
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Confirm your email ... we've sent a message at your email",{},[]):
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"قم بتفعيل ايميلك....تم ارسال رسالة االيك على الايميل",{},[]);
            } else {
                (lang === "en")?
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"rejected Eamil", [], []):
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"الايمل غير صالح", [], []);
            }
        }else if(user && user.isDeleted){
            await userModel.updateOne({email}, {$set:{isDeleted: false}});
            (lang === "en")? 
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Confirm your email ... we've sent a message at your email",{},[]):
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"قم بتفعيل ايميلك....تم ارسال رسالة االيك على الايميل",{},[]);
        }else{
            (lang === "en")?
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"email already exist", "" , []):
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"هذا الايميل موجود بالفعل", "" , []);
        }
    } catch (error) {
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
};


const login = async (req, res, next) => {
    try {
        const {lang} = req.query
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        //..Check if User Exists..//
        if (!user|| user.isDeleted) {
            return (lang === "en")? 
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Email not found!",{},[]):
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"هذا الايميل غير مسجل",{},[]);
        }
        //..Compare Passwords..//
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return (lang === "en")?
            sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Wrong password!", {}, []):
            sendResponse(res, constans.RESPONSE_BAD_REQUEST, "كلمة المرور خاطئة", {}, [])
        }
        //..Check if Email is Activated..//
        if (!user.activateEmail) {
            const confirmMessag ="Confirmation Email Send From Treasures of Egypt Application";
            const code = Math.floor(10000 + Math.random() * 90000);
            const result = await helper.sendConfirmEmail(req,user,"","",confirmMessag,code);
            if (result) {
                await userModel.updateOne(
                    { email },
                    { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
                );
                return (lang === "en")? 
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"Confirm your email ... we've sent a message at your email",{},[]):
                sendResponse(res,constans.RESPONSE_BAD_REQUEST,"قم بتفعيل ايميلك....تم ارسال رسالة االيك على الايميل",{},[]);
            }
        }
        //..Generate Access Token..//
        const accToken = await jwtGenerator({ userId: user.userId,role:"user" }, 24, "h");
        existingToken = await tokenSchema.findOne({ userId: user.userId });
        if (existingToken) {
            await tokenSchema.updateOne(
                { userId: user.userId },
                { $set: {token: accToken } }
            );
        } else {
            newToken = new tokenSchema({
                userId: user.userId,
                token: accToken,
            });
            await newToken.save();
        }
        const data = {
            userId: user.userId,
            token: accToken,
            userName:user.userName,
            profileImage:user?.profileImage,
        }
        return (lang === "en")?
        sendResponse(res, constans.RESPONSE_SUCCESS, "Login Succeed", data, []):
        sendResponse(res, constans.RESPONSE_SUCCESS, "تم تسجيل الدخول بنجاح", data, []);
    } catch (error) {
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
};

//-------------------------------------general-------------------------------------//
const verifyEmail = async(req, res, next) => {
    try {
        const {lang} = req.query

        const { code, email } = req.body;
        const  user = await userModel.findOne({ email , activateEmail: false});
        if (!user) {
            (lang === "en")?
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"email already confirmed or in-code",{},[]):
            sendResponse(res,constans.RESPONSE_BAD_REQUEST,"الايميل مفعل بالفعل او الرمز غير صالح",{},[]);
        } else if (user.recoveryCode === code && validateExpiry(user.recoveryCodeDate) && code) {
            await userModel.updateOne(
                { userId: user.userId },
                { $set: { recoveryCode: "", activateEmail: true} }
            );
            (lang === "en")?
            sendResponse(res,constans.RESPONSE_SUCCESS,"Confirmed Succeed",{},[]):
            sendResponse(res,constans.RESPONSE_SUCCESS,"تم التفعيل بنجاح",{},[]);
        } else {
            (lang === "en")?
            sendResponse( res, constans.RESPONSE_BAD_REQUEST, "Invalid or expired code", "", []):
            sendResponse( res, constans.RESPONSE_BAD_REQUEST, "الرمز غير صالح او منتهي الصلاحية", "", []);
        }

        // const { token } = req.params;
        // const decoded = jwt.verify(token, CONFIG.jwt_encryption);
        // if (!decoded?.userId) {
        //     (lang === "en")?
        //     sendResponse(res,constans.RESPONSE_UNAUTHORIZED,"invaild Token",{},[]):
        //     sendResponse(res,constans.RESPONSE_UNAUTHORIZED,"الرمز المميز غير صالح",{},[]);
        // } else {
        //     const type= "user";
        //     user = await userModel.findOneAndUpdate(
        //         { userId: decoded.userId, activateEmail: false },
        //         { activateEmail: true }
        //     );
        //     if (!user) {
        //         (lang === "en")?
        //         sendResponse(res,constans.RESPONSE_BAD_REQUEST,"email already confirmed or in-vaild token",type,[]):
        //         sendResponse(res,constans.RESPONSE_BAD_REQUEST,"الايميل مفعل بالفعل او الرمز المميز غير صالح",type,[]);
        //     } else {
        //         (lang === "en")?
        //         sendResponse(res,constans.RESPONSE_SUCCESS,"Confirmed Succeed",type,[]):
        //         sendResponse(res,constans.RESPONSE_SUCCESS,"تم التفعيل بنجاح",type,[]);
        //     }
        // }
    } catch (error) {
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
};

const reSendcode = async (req, res, next) => {
    try {
        const {lang} = req.query
        const { email } = req.body;
        const  user = await userModel.findOne({ email: email });
        if (!user|| user.isDeleted) {
            (lang === "en")?
            sendResponse(res, constans.RESPONSE_BAD_REQUEST, "This email does not exist", {}, []):
            sendResponse(res, constans.RESPONSE_BAD_REQUEST, "هذا الايميل غير موجود", {}, []);
        } else {
            const code = Math.floor(10000 + Math.random() * 90000);
            const info = helper.sendEmail( user, "recovery code", code);
            if (info) {
                await userModel.updateOne(
                    { email },
                    { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
                );
                (lang === "en")?
                sendResponse(res, constans.RESPONSE_SUCCESS, `Recovery code resent to ${email}`, {}, [] ):
                sendResponse(res, constans.RESPONSE_SUCCESS, `${email}تم اعادة ارسال الرمز الى `, {}, [] );
            }
        }
    } catch (error) {
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const {lang} = req.query
        const {email} = req.body;
        const  user = await userModel.findOne({ email: email });
        if (!user || user.isDeleted) {
            (lang === "en")?
            sendResponse(res, constans.RESPONSE_BAD_REQUEST, "This email does not exist", {}, []):
            sendResponse(res, constans.RESPONSE_BAD_REQUEST, "هذا الايميل غير موجود", {}, []);
        } else {
            const code = Math.floor(10000 + Math.random() * 90000);
            const setPasswordMessag = "an update password email was sent from restaurant Application";
            const info = helper.sendEmail(user, setPasswordMessag, code); 
            if (info) {
                await userModel.updateOne(
                    { email },
                    { $set: { recoveryCode: code, recoveryCodeDate: Date.now() } }
                );
                (lang === "en")?
                sendResponse(res, constans.RESPONSE_SUCCESS, `we sent you an email at ${email}`, {}, []):
                sendResponse(res, constans.RESPONSE_SUCCESS, `${email} لقد ارسلنا لك رسالة على`, {}, []);
            }
        }
    } catch (error) {
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
};


const setPassword = async (req, res, next) => {
    try {
        const {lang} = req.query
        const { password, code, email } = req.body;
        const  user = await userModel.findOne({ email });
        if (user.recoveryCode === code && validateExpiry(user.recoveryCodeDate) && code) {
            const encryptedPassword = bcrypt.hashSync(password, parseInt(CONFIG.BCRYPT_SALT));
            await userModel.updateOne(
                { userId: user.userId },
                { $set: { recoveryCode: "",encryptedPassword } }
            );
            (lang === "en")?
            sendResponse(res, constans.RESPONSE_SUCCESS, "Set new password successful", {}, []):
            sendResponse(res, constans.RESPONSE_SUCCESS, "تم تغير كلمة المرور بنجاح", {}, []);
        } else {
            (lang === "en")?
            sendResponse( res, constans.RESPONSE_BAD_REQUEST, "Invalid or expired code", "", []):
            sendResponse( res, constans.RESPONSE_BAD_REQUEST, "الرمز غير صالح او منتهي الصلاحية", "", []);
        }
    } catch (error) {
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);;
    }
};

const checkToken = async (req, res, next) => {
    function extractToken() {
        const token = req.headers['Authorization'] ?? req.headers['authorization'];
        if (token) {
            return token.split("treasures_")[1];
        }
    }
    const token = extractToken();
    if (!token) {
        return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Token is required", false, []);
    }
    try {
        jwt.verify(token, CONFIG.jwt_encryption);
    } catch (error) {
        return sendResponse(res, constans.RESPONSE_SUCCESS, "Token is invalid", false, []);
    }
    if (!await tokenSchema.findOne({ token })) {
        return sendResponse(res, constans.RESPONSE_BAD_REQUEST, "Token does not exist or Removed", false, []);
    }
    sendResponse(res, constans.RESPONSE_SUCCESS, "Done", true, []);
}

//..................logout............................//
const signOut=async(req,res,next)=>{ 
    try {
        const {lang} = req.query
        if(req.headers["Authorization"]||req.headers["authorization"]){
            const token =req.headers["Authorization"] || req.headers["authorization"].split("treasures_")[1];
            const deletetoken=await tokenSchema.findOneAndDelete({token:token})
            if(deletetoken){
                delete req.headers['Authorization']||req.headers['authorization']
                (lang === "en")?
                sendResponse(res,constans.RESPONSE_SUCCESS, "Sign-Out successfully", '', []):
                sendResponse(res,constans.RESPONSE_SUCCESS, "تم تسجيل الخروج بنجاح", '', []);
            }
            else{
                (lang === "en")?
                sendResponse(res,constans.RESPONSE_UNAUTHORIZED, "Unauthorized", '', []):
                sendResponse(res,constans.RESPONSE_UNAUTHORIZED, "غير مصرح", '', []);
            }
        }
        else{
            await tokenSchema.findOneAndDelete({token:req.cookies.token})
            res.clearCookie("token");   
            (lang === "en")?
            sendResponse(res,constans.RESPONSE_SUCCESS, "Sign-Out successfully", '', []):
            sendResponse(res,constans.RESPONSE_SUCCESS, "تم تسجيل الخروج بنجاح", '', []);
        }
    } catch (error) {
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
    }
}


module.exports = {
    signUp,
    verifyEmail,
    login,
    reSendcode,
    forgetPassword,
    setPassword,
    checkToken,
    signOut
}