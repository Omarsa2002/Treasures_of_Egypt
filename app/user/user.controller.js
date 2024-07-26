const { sendResponse, validateExpiry } = require("../utils/util.service");
const constans = require("../utils/constants");
const userModel = require('../db/models/userModel.js');
const governorateModele = require('../db/models/governorateModel');
const { HistoricalSites } = require("../governorate/governorate.controller.js");
const CONFIG = require('../../config/config.js');


const recommendations = async (req, res, nex)=>{
    try{
        function extractToken() {
            const token = req.headers['Authorization'] ?? req.headers['authorization'];
            if (token) {
                return token.split("treasures_")[1];
            }
        }
        const token = extractToken();
        if (!token) {
            return sendResponse(res, constans.RESPONSE_UNAUTHORIZED, "Unauthorized access", {}, []);
        }
        const { userId } = req.user;
        const {lang} = req.query
        const local = `http://localhost:${CONFIG.port}`;
        const url = `${local}${CONFIG.BASEURL}/user/userfavourite`;
        const fav = await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": `${CONFIG.authKey}${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!fav.ok) {
            throw new Error(`Failed to fetch user favourites: ${fav.statusText}`);
        }
        const data = await fav.json();
        const dataArray = [];
            data.data.Historical.forEach(site=>{
                (lang === "en")? dataArray.push(site.en_Site_Name):dataArray.push(site.ar_Site_Name);
            });
            data.data.Recreational.forEach(site=>{
                (lang === "en")? dataArray.push(site.en_Site_Name):dataArray.push(site.ar_Site_Name);
            });
        const recommendsUrl = `https://egypt-treasure.onrender.com/recommend?lang=${lang}`
        const recommends = await fetch(recommendsUrl, {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                "places": [...dataArray]
            })
        });
        if (!recommends.ok) {
            throw new Error(`Failed to fetch user recommends: ${recommends.statusText}`);
        }
        const userRecommends = await recommends.json();
        sendResponse(res, constans.RESPONSE_SUCCESS, "done",userRecommends, []);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}

const addToFavourite = async (req, res, next)=>{
    try{
        const {userId} = req.user;
        const {siteId} = req.body;
        if(siteId){
            const user = await userModel.findOneAndUpdate({userId},{$addToSet:{userFavourite:siteId}},{new:true});
            sendResponse(res,constans.RESPONSE_SUCCESS,"Added to favourite",{},[])
        }else{
            sendResponse(res,constans.RESPONSE_FORBIDDEN,"No sites to add to favourite",{},[])
        }
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}

const removeFromFavourite = async (req, res, next)=>{
    try{
        const {userId} = req.user;
        const {siteId} = req.body;
        if(siteId){
            const user = await userModel.findOneAndUpdate({userId},{$pull:{userFavourite:siteId}},{new:true});
            sendResponse(res,constans.RESPONSE_SUCCESS,"removed to favourite",{},[])
        }else{
            sendResponse(res,constans.RESPONSE_FORBIDDEN,"No sites to remove from favourite",{},[])
        }
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}


const userFavourite = async (req, res, next)=>{
    try{
        const {userId} = req.user;
        const user = await userModel.findOne({userId}).select('userFavourite -_id')
        if(user){
            const userFavouriteArrayHistorical = [];
            const userFavouriteArrayRecreational = [];
            const siteIds = user.userFavourite;
            const favourites = await governorateModele.find({
                $or: [
                    { 'HistoricalSites.siteId': { $in: siteIds } },
                    { 'RecreationalSites.siteId': { $in: siteIds } }
                ]
            });
            favourites.forEach(fav => {
                const historicalSites = fav.HistoricalSites.filter(site => siteIds.includes(site.siteId));
                const recreationalSites = fav.RecreationalSites.filter(site => siteIds.includes(site.siteId));
                userFavouriteArrayHistorical.push(...historicalSites);
                userFavouriteArrayRecreational.push(...recreationalSites);
            });
            const Historical = userFavouriteArrayHistorical.map(site=>{
                const { _id, ...rest } = site.toObject({getters: true});
                return {
                    siteId: rest.siteId,
                    en_Site_Name: rest.en_Site_Name,
                    en_Opening_Hours: rest.en_Opening_Hours,
                    ar_Site_Name: rest.ar_Site_Name,
                    ar_Opening_Hours: rest.ar_Opening_Hours,
                    Photo_URL: rest.Photo_URL
                };
            })
            const Recreational = userFavouriteArrayRecreational.map(site=>{
                const { _id, ...rest } = site.toObject({getters: true});
                return {
                    siteId: rest.siteId,
                    en_Site_Name: rest.en_Site_Name,
                    en_Opening_Hours: rest.en_Opening_Hours,
                    ar_Site_Name: rest.ar_Site_Name,
                    ar_Opening_Hours: rest.ar_Opening_Hours,
                    Photo_URL: rest.Photo_URL
                };
            })
            sendResponse(res, constans.RESPONSE_SUCCESS, "done",{Historical: Historical, Recreational: Recreational}, []);
        }else{
            sendResponse(res,constans.RESPONSE_NOT_FOUND,"No Favourite for you ",{},[])
        }
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}




const userData = async (req, res, next)=>{
    try{
        const {userId} = req.user;
        const user = await userModel.findOne({userId}).select("-__v -_id -recoveryCode -recoveryCodeDate -encryptedPassword -activateEmail");
        sendResponse(res, constans.RESPONSE_SUCCESS, "Done", user, []);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}

module.exports = {
    userData,
    addToFavourite,
    removeFromFavourite,
    userFavourite,
    recommendations
}