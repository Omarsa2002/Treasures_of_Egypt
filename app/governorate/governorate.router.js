const express = require('express');
const router = express.Router();
const governorateCon = require('./governorate.controller.js')
const rateLimiter = require("../utils/rate.limit.js");

router.get('/allgovernorate',governorateCon.allGovernorate)
router.get('/:governorateId/historicalSites',governorateCon.allHistoricalSites)
router.get('/:governorateId/recreationalSites',governorateCon.allRecreationalSites)
router.get('/:governorateId/historicalSites/:historicalSitesId',governorateCon.HistoricalSites)
router.get('/:governorateId/recreationalSites/:recreationalSitesId',governorateCon.RecreationalSites)



module.exports = router;

