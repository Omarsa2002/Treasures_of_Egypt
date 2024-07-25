const express = require('express');
const router = express.Router();
const governorateCon = require('./governorate.controller.js')
const rateLimiter = require("../utils/rate.limit.js");
const verifyToken = require('../middlewares/verifyToken.js');

router.get('/allgovernorate', verifyToken, governorateCon.allGovernorate)
router.get('/:governorateId/historicalSites', verifyToken, governorateCon.allHistoricalSites)
router.get('/:governorateId/recreationalSites', verifyToken, governorateCon.allRecreationalSites)
router.get('/:governorateId/historicalSites/:historicalSitesId', verifyToken, governorateCon.HistoricalSites)
router.get('/:governorateId/recreationalSites/:recreationalSitesId', verifyToken, governorateCon.RecreationalSites)



module.exports = router;

