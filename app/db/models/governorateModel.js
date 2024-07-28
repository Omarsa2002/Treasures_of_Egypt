const   mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
const CONFIG = require('../../../config/config.js');
const { string } = require('joi');

const governorateSchema = new mongoose.Schema(
    {
        governorateName: String,
        governorateId: String,
        governorateArName: String,
        en_Description: String,
        ar_Description: String,
        governorateLogo: String,
        HistoricalSites: [
            {
                siteId: String,
                en_Site_Name: String,
                en_adress: String,
                en_Historical_Period: String,
                en_Description: String,
                en_Opening_Hours: String,
                en_Visitor_Statistics: String,
                en_Nearby_Amenities: String,
                en_City: String,
                en_Region: String,
                en_Average_Temperature: String,
                en_Best_Visiting_Season: String,
                en_Transportation_Options: String,
                ar_Site_Name: String,
                ar_adress: String,
                ar_Historical_Period: String,
                ar_Description: String,
                ar_Opening_Hours: String,
                ar_Visitor_Statistics: String,
                ar_Nearby_Amenities: String,
                ar_City: String,
                ar_Region:String,
                ar_Average_Temperature: String,
                ar_Best_Visiting_Season: String,
                ar_Transportation_Options: String,
                Location:{ 
                    Coordinates:[Number]
                },
                Entry_Fee: String,
                Photo_URL: String
            }
        ],
        RecreationalSites: [
            {
                siteId: String,
                en_Site_Name: String,
                en_adress: String,
                en_Type_of_Activity: String,
                en_Description: String,
                en_Opening_Hours: String,
                en_Visitor_Statistics: String,
                en_Nearby_Amenities: String,
                en_General_Information: String,
                en_City: String,
                en_Region: String,
                en_Average_Temperature: String,
                en_Best_Visiting_Season: String,
                en_Transportation_Options: String,
                ar_Site_Name: String,
                ar_adress: String,
                ar_Type_of_Activity: String,
                ar_Description: String,
                ar_Opening_Hours: String,
                ar_Visitor_Statistics: String,
                ar_Nearby_Amenities: String,
                ar_General_Information: String,
                ar_City: String,
                ar_Region: String,
                ar_Average_Temperature: String,
                ar_Best_Visiting_Season: String,
                ar_Transportation_Options: String,
                Location:{ 
                    Coordinates:[Number]
                },
                Entry_Fee: String,
                Photo_URL: String
            }
        ]
    },
    {
        timestamps: true
    }
);



const governorateModel = mongoose.model('Governorate', governorateSchema);

module.exports = governorateModel;
