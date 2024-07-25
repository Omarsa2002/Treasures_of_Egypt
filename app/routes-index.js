const CONFIG = require('../config/config.js');

module.exports = {
    v1routes: function (app) {
        app.use(`${CONFIG.BASEURL}/auth`, require('./auth/auth.route.js'));
        app.use(`${CONFIG.BASEURL}/governorate`, require('./governorate/governorate.router.js'));
    }
};
