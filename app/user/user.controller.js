const { sendResponse, validateExpiry } = require("../utils/util.service");
const constans = require("../utils/constants");
const userModel = require('../db/models/userModel.js');
const governorateModele = require('../db/models/governorateModel');
const { HistoricalSites } = require("../governorate/governorate.controller.js");
const CONFIG = require('../../config/config.js');
const { body } = require("express-validator");


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
        const online = `https://treasures-of-egypt.onrender.com`
        const local = `http://localhost:${CONFIG.port}`;
        const url = `${online}${CONFIG.BASEURL}/user/userfavourite`;
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
            data.data.forEach(site=>{
                console.log(site);
                dataArray.push(site.Site_Name)
            });
        if(!dataArray.length){
            return (lang === 'en')?
            sendResponse(res, constans.RESPONSE_NOT_FOUND, "there is no recommendations for you",{}, []):
            sendResponse(res, constans.RESPONSE_NOT_FOUND, "لا يوجد لا اي ترشيحات",{}, []);
        }
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

const updateUser=async(req,res,next)=>{
    try {
        const {lang} = req.query
        const {userId}=req.user; 
        if(req.body.userName){
            req.body.userName = req.body.userName; 
        }
        const user = await userModel.findOneAndUpdate({userId},{$set:req.body},{runValidators: true})
        if (!user) {
            console.log("User not found");
            return sendResponse(res, constans.RESPONSE_NOT_FOUND, "User not found", "", []);
        }
        (lang === 'en')?
        sendResponse(res,constans.RESPONSE_SUCCESS,"user updated success",userId,[]):
        sendResponse(res,constans.RESPONSE_SUCCESS,"تم التحديث بنجاح",userId,[])
    } catch (error) {
        sendResponse(res,constans.RESPONSE_INT_SERVER_ERROR,error.message,"", constans.UNHANDLED_ERROR);
    }
}

const addToFavourite = async (req, res, next)=>{
    try{
        const {lang} = req.query
        const {userId} = req.user;
        const {siteId} = req.body;
        if(siteId){
            const user = await userModel.findOneAndUpdate({userId},{$addToSet:{userFavourite:siteId}},{new:true});
            (lang === 'en')?
            sendResponse(res,constans.RESPONSE_SUCCESS,"Added to favourite",{},[]):
            sendResponse(res,constans.RESPONSE_SUCCESS,"تم الاضافة الى المفضلة",{},[])
        }else{
            (lang === 'en')?
            sendResponse(res,constans.RESPONSE_FORBIDDEN,"No sites to add to favourite",{},[]):
            sendResponse(res,constans.RESPONSE_FORBIDDEN,"لا يمكن الاضافة الى المفضلة",{},[])
        }
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}

const removeFromFavourite = async (req, res, next)=>{
    try{
        const {lang} = req.query
        const {userId} = req.user;
        const {siteId} = req.body;
        if(siteId){
            const user = await userModel.findOneAndUpdate({userId},{$pull:{userFavourite:siteId}},{new:true});
            (lang === 'en')?
            sendResponse(res,constans.RESPONSE_SUCCESS,"removed from favourite",{},[]):
            sendResponse(res,constans.RESPONSE_SUCCESS,"تم الازالة من المفضلة",{},[])
        }else{
            (lang === 'en')?
            sendResponse(res,constans.RESPONSE_FORBIDDEN,"No sites to remove from favourite",{},[]):
            sendResponse(res,constans.RESPONSE_FORBIDDEN,"لا يمكن الازالة من المفضلة",{},[])
        }
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}


const userFavourite = async (req, res, next)=>{
    try{
        const {lang} = req.query
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
                return (lang === 'en')? {
                    Location: rest.Location,
                    siteId: rest.siteId,
                    Site_Name: rest.en_Site_Name,
                    adress: rest.en_adress,
                    Historical_Period: rest.en_Historical_Period,
                    Description: rest.en_Description,  
                    Opening_Hours: rest.en_Opening_Hours,
                    Visitor_Statistics: rest.en_Visitor_Statistics,
                    Nearby_Amenities: rest.en_Nearby_Amenities, 
                    City: rest.en_City, 
                    Region: rest.en_Region,
                    Average_Temperature: rest.en_Average_Temperature, 
                    Best_Visiting_Season: rest.en_Best_Visiting_Season,
                    Transportation_Options: rest.en_Transportation_Options, 
                    Entry_Fee: rest.Entry_Fee  ,
                    Photo_URL: rest.Photo_URL, 
                }:{
                    Location: rest.Location,
                    siteId: rest.siteId,
                    Site_Name: rest.ar_Site_Name,  
                    adress: rest.ar_adress,  
                    Historical_Period: rest.ar_Historical_Period,
                    Description: rest.ar_Description,
                    Opening_Hours: rest.ar_Opening_Hours,  
                    Visitor_Statistics: rest.ar_Visitor_Statistics,
                    Nearby_Amenities: rest.ar_Nearby_Amenities,
                    City: rest.ar_City ,
                    Region: rest.ar_Region,
                    Average_Temperature: rest.ar_Average_Temperature,  
                    Best_Visiting_Season: rest.ar_Best_Visiting_Season , 
                    Transportation_Options: rest.ar_Transportation_Options , 
                    Entry_Fee: rest.Entry_Fee  ,
                    Photo_URL: rest.Photo_URL, 
                }
            })
            const Recreational = userFavouriteArrayRecreational.map(site=>{
                const { _id, ...rest } = site.toObject({getters: true});
                return (lang === 'en')? {
                    Location: rest.Location,
                    siteId: rest.siteId,
                    Site_Name: rest.en_Site_Name,
                    adress: rest.en_adress,
                    Type_of_Activity: rest.en_Type_of_Activity,
                    Description: rest.en_Description,
                    Opening_Hours: rest.en_Opening_Hours,
                    Visitor_Statistics: rest.en_Visitor_Statistics,
                    Nearby_Amenities: rest.en_Nearby_Amenities,
                    General_Information: rest.en_General_Information,
                    City: rest.en_City,
                    Region: rest.en_Region,
                    Average_Temperature: rest.en_Average_Temperature,
                    Best_Visiting_Season: rest.en_Best_Visiting_Season,
                    Transportation_Options: rest.en_Transportation_Options,
                    Entry_Fee: rest.Entry_Fee,
                    Photo_URL: rest.Photo_URL
                }:{
                    Location: rest.Location,
                    siteId: rest.siteId,
                    Site_Name: rest.ar_Site_Name,
                    adress: rest.ar_adress,
                    Type_of_Activity: rest.ar_Type_of_Activity,
                    Description: rest.ar_Description,
                    Opening_Hours: rest.ar_Opening_Hours,
                    Visitor_Statistics: rest.ar_Visitor_Statistics,
                    Nearby_Amenities: rest.ar_Nearby_Amenities,
                    General_Information: rest.ar_General_Information,
                    City: rest.ar_City,
                    Region: rest.ar_Region,
                    Average_Temperature: rest.ar_Average_Temperature,
                    Best_Visiting_Season: rest.ar_Best_Visiting_Season,
                    Transportation_Options: rest.ar_Transportation_Options,
                    Entry_Fee: rest.Entry_Fee,
                    Photo_URL: rest.Photo_URL
                }
            })
            sendResponse(res, constans.RESPONSE_SUCCESS, "done",[...Historical, ...Recreational], []);
        }else{
            (lang === 'en')?
            sendResponse(res,constans.RESPONSE_NOT_FOUND,"No Favourite for you ",{},[]):
            sendResponse(res,constans.RESPONSE_NOT_FOUND,"لم تقم بالاضافة الى المفضلة حتى الان ",{},[])
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
    recommendations,
    updateUser
}