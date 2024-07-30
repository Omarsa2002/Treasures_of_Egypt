
const { sendResponse, validateExpiry, paginationWrapper } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const governorateModele = require('../db/models/governorateModel');
const { array } = require("joi");

//shuffle algorithm
function randomArray(array){
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const allGovernorate = async(req,res,next)=>{
    try{
        const {lang} = req.query
        const governorates = await governorateModele.find().select("governorateName governorateId governorateArName ar_Description en_Description governorateLogo -_id").sort({"governorateName": 1});
        const data = [];
        governorates.forEach(governorate=>{
            const dataup = (lang === "en") ? {
                governorateId: governorate.governorateId,
                governorateName: governorate.governorateName,
                Description: governorate.en_Description,
                governorateLogo: governorate.governorateLogo
            }:{
                governorateId: governorate.governorateId,
                governorateName: governorate.governorateArName,
                Description: governorate.ar_Description,
                governorateLogo: governorate.governorateLogo
            }
            data.push(dataup);
        })
        console.log(data);
        sendResponse(res,constans.RESPONSE_SUCCESS,"done",data,[]);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}
const allHistoricalSites = async(req,res,next)=>{
    try{
        const {lang} = req.query
        const {governorateId} = req.params
        const HistoricalSites = await governorateModele.findOne({governorateId})
        const data = HistoricalSites.HistoricalSites
        randomArray(data);
        let updateData = data.map(site =>{
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
        sendResponse(res,constans.RESPONSE_SUCCESS,"done",updateData,[]);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}
const allRecreationalSites = async(req,res,next)=>{
    try{
        const {lang} = req.query
        const {governorateId} = req.params
        const RecreationalSites = await governorateModele.findOne({governorateId})
        const data = RecreationalSites.RecreationalSites
        randomArray(data);
        let updateData = data.map(site =>{
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
        sendResponse(res,constans.RESPONSE_SUCCESS,"done",updateData,[]);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}
const HistoricalSites = async(req,res,next)=>{
    try{
        const {lang} = req.query
        const {governorateId, historicalSitesId} = req.params
        const HistoricalSites = await governorateModele.findOne({governorateId})
        const data = HistoricalSites.HistoricalSites
        let singleData = data.filter(site=>{return site.siteId === historicalSitesId})
        let updateData = (data)=>{
            const { _id, ...rest } = data[0].toObject({getters: true});
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
        }
        sendResponse(res,constans.RESPONSE_SUCCESS,"done",updateData(singleData),[]);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}
const RecreationalSites = async(req,res,next)=>{  
    try{
        const {lang} = req.query
        const {governorateId, recreationalSitesId} = req.params
        const RecreationalSites = await governorateModele.findOne({governorateId})
        const data = RecreationalSites.RecreationalSites
        let singleData = data.filter(site=>{return site.siteId === recreationalSitesId})
        let updateData = (data)=>{
            const { _id, ...rest } = data[0].toObject({getters: true});
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
        }
        sendResponse(res,constans.RESPONSE_SUCCESS,"done",updateData(singleData),[]);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}

module.exports={
    allGovernorate,
    allHistoricalSites,
    allRecreationalSites,
    HistoricalSites,
    RecreationalSites
}