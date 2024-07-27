
const { sendResponse, validateExpiry, paginationWrapper } = require("../utils/util.service");
const CONFIG = require("../../config/config");
const jwt = require("jsonwebtoken");
const constans = require("../utils/constants");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const governorateModele = require('../db/models/governorateModel');
const { array } = require("joi");


const allGovernorate = async(req,res,next)=>{
    try{
        const governorates = await governorateModele.find().select("governorateName governorateId -_id").sort({"governorateName": 1});
        sendResponse(res,constans.RESPONSE_SUCCESS,"done",governorates,[]);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}
const allHistoricalSites = async(req,res,next)=>{
    try{
        const {governorateId} = req.params
        const HistoricalSites = await governorateModele.findOne({governorateId})
        const data = HistoricalSites.HistoricalSites
        data.sort((a,b) => {return (a.en_Site_Name > b.en_en_Site_Name) ? 1 : ((b.en_Site_Name > a.en_Site_Name) ? -1 : 0)})
        //console.log(data);
        let updateData = data.map(site =>{
            const { _id, ...rest } = site.toObject({getters: true});
            return {
                siteId: rest.siteId,
                en_Site_Name: rest.en_Site_Name,
                en_Opening_Hours: rest.en_Opening_Hours,
                ar_Site_Name: rest.ar_Site_Name,  
                ar_Opening_Hours: rest.ar_Opening_Hours,  
                Photo_URL: rest.Photo_URL, 
            };
        })
        sendResponse(res,constans.RESPONSE_SUCCESS,"done",updateData,[]);
    }catch(error){
        sendResponse( res,constans.RESPONSE_INT_SERVER_ERROR,error.message,{},constans.UNHANDLED_ERROR);
    }
}
const allRecreationalSites = async(req,res,next)=>{
    try{
        const {governorateId} = req.params
        const RecreationalSites = await governorateModele.findOne({governorateId})
        const data = RecreationalSites.RecreationalSites
        data.sort((a,b) => {return (a.en_Site_Name > b.en_en_Site_Name) ? 1 : ((b.en_Site_Name > a.en_Site_Name) ? -1 : 0)})
        let updateData = data.map(site =>{
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
                en_Site_Name: rest.en_Site_Name,
                en_adress: rest.en_adress,
                en_Historical_Period: rest.en_Historical_Period,
                en_Description: rest.en_Description,  
                en_Opening_Hours: rest.en_Opening_Hours,
                en_Visitor_Statistics: rest.en_Visitor_Statistics,
                en_Nearby_Amenities: rest.en_Nearby_Amenities, 
                en_City: rest.en_City, 
                en_Region: rest.en_Region,
                en_Average_Temperature: rest.en_Average_Temperature, 
                en_Best_Visiting_Season: rest.en_Best_Visiting_Season,
                en_Transportation_Options: rest.en_Transportation_Options, 
                Entry_Fee: rest.Entry_Fee  ,
                Photo_URL: rest.Photo_URL, 
            }:{
                Location: rest.Location,
                siteId: rest.siteId,
                ar_Site_Name: rest.ar_Site_Name,  
                ar_adress: rest.ar_adress,  
                ar_Historical_Period: rest.ar_Historical_Period,
                ar_Description: rest.ar_Description,
                ar_Opening_Hours: rest.ar_Opening_Hours,  
                ar_Visitor_Statistics: rest.ar_Visitor_Statistics,
                ar_Nearby_Amenities: rest.ar_Nearby_Amenities,
                ar_City: rest.ar_City ,
                ar_Region: rest.ar_Region,
                ar_Average_Temperature: rest.ar_Average_Temperature,  
                ar_Best_Visiting_Season: rest.ar_Best_Visiting_Season , 
                ar_Transportation_Options: rest.ar_Transportation_Options , 
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
                en_Site_Name: rest.en_Site_Name,
                en_adress: rest.en_adress,
                en_Type_of_Activity: rest.en_Type_of_Activity,
                en_Description: rest.en_Description,
                en_Opening_Hours: rest.en_Opening_Hours,
                en_Visitor_Statistics: rest.en_Visitor_Statistics,
                en_Nearby_Amenities: rest.en_Nearby_Amenities,
                en_General_Information: rest.en_General_Information,
                en_City: rest.en_City,
                en_Region: rest.en_Region,
                en_Average_Temperature: rest.en_Average_Temperature,
                en_Best_Visiting_Season: rest.en_Best_Visiting_Season,
                en_Transportation_Options: rest.en_Transportation_Options,
                Entry_Fee: rest.Entry_Fee,
                Photo_URL: rest.Photo_URL
            }:{
                Location: rest.Location,
                siteId: rest.siteId,
                ar_Site_Name: rest.ar_Site_Name,
                ar_adress: rest.ar_adress,
                ar_Type_of_Activity: rest.ar_Type_of_Activity,
                ar_Description: rest.ar_Description,
                ar_Opening_Hours: rest.ar_Opening_Hours,
                ar_Visitor_Statistics: rest.ar_Visitor_Statistics,
                ar_Nearby_Amenities: rest.ar_Nearby_Amenities,
                ar_General_Information: rest.ar_General_Information,
                ar_City: rest.ar_City,
                ar_Region: rest.ar_Region,
                ar_Average_Temperature: rest.ar_Average_Temperature,
                ar_Best_Visiting_Season: rest.ar_Best_Visiting_Season,
                ar_Transportation_Options: rest.ar_Transportation_Options,
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