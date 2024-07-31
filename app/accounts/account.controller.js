const { sendResponse } = require("../utils/util.service.js");
const userModel = require("../db/models/userModel.js");
const tokenSchema = require("../auth/token.schema.js");
const constants = require("../utils/constants.js");
const bcrypt = require('bcrypt');
const CONFIG = require('../../config/config.js');
const { userFavourite } = require("../user/user.controller.js");






//..............soft Delete User .............//
const deleteAccount = async (req, res, next)=>{
    try{
        const {lang} = req.query
        const {userId}=req.user;
        const token=req.headers.authorization.split("treasures_")[1]
        await userModel.updateOne({userId}, {$set:{isDeleted: true, userFavourite: [], activateEmail: false}})
        await tokenSchema.deleteOne({token});
        (lang === "en")? 
        sendResponse(res, constants.RESPONSE_SUCCESS, "account is  deleted", '', [] ):
        sendResponse(res, constants.RESPONSE_SUCCESS, "تم حذف حسابك", '', [] );
    }catch(error){
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,"", constants.UNHANDLED_ERROR);
    }
}


//............change account password.............//
const changePassword = async (req, res, next) => {
    try {
        const {lang} = req.query
        const {userId}=req.user;
        const user = await userModel.findOne({userId}); 
        const { currentPassword, newPassword } = req.body;
        const isPasswordValid = bcrypt.compareSync(currentPassword,user.encryptedPassword);
        if (!isPasswordValid) {
            (lang === "en")? 
            sendResponse(res,constants.RESPONSE_UNAUTHORIZED,"Current password is invalid",'',[]):
            sendResponse(res,constants.RESPONSE_UNAUTHORIZED,"كلمة المرور الحالية غير صحيحة",'',[]);
        } else {
            if (currentPassword === newPassword) {
                return (lang === "en")? 
                sendResponse(res,constants.RESPONSE_BAD_REQUEST,"New password must be different from the old password.",'', []):
                sendResponse(res,constants.RESPONSE_BAD_REQUEST,"يجب على كلمة المرور الجديدة ان تكون مختلفة عن القديمة",'', []);
            }
            const encryptedPassword = bcrypt.hashSync(newPassword, parseInt(CONFIG.BCRYPT_SALT));
            const updatedPassword = await userModel.updateOne({userId},{ $set: {encryptedPassword} });
            (lang === "en")? 
            sendResponse(res,constants.RESPONSE_SUCCESS,"Password changed successfully",updatedPassword,[]):
            sendResponse(res,constants.RESPONSE_SUCCESS,"تم تغير كلمة المرور بنجاح",updatedPassword,[]);
        }
    } catch (error) {
        sendResponse(res,constants.RESPONSE_INT_SERVER_ERROR,error.message,"", constants.UNHANDLED_ERROR);
    }
};

module.exports={
    deleteAccount,
    changePassword
}