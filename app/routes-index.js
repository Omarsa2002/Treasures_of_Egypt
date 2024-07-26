const CONFIG = require('../config/config.js');

module.exports = {
    v1routes: function (app) {
        app.use(`${CONFIG.BASEURL}/auth`, require('./auth/auth.route.js'));
        app.use(`${CONFIG.BASEURL}/user`, require('./user/user.router.js'));
        app.use(`${CONFIG.BASEURL}/governorate`, require('./governorate/governorate.router.js'));
        app.use(`${CONFIG.BASEURL}/account`, require('./accounts/account.route.js'));
    }
};
