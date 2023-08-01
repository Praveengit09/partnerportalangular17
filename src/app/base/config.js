"use strict";
exports.__esModule = true;
const PortalConfig = require('./portalConfig');
var Config = /** @class */ (function () {
    function Config() { }
    Config.changeTestType = function (type) {
        +Config.TEMP_TEST_TYPE == -2 ? Config.TEMP_TEST_TYPE = +Config.TEST_TYPE : '';
        if (this.TEST_TYPE < this.AWS_DEMO && type < this.AWS_DEMO && this.TEST_TYPE == this.BUG_FIX_MODE) {
            type = type != -2 ? +type : +Config.TEMP_TEST_TYPE;
            this.TEST_TYPE = this.BUG_FIX_MODE = +type;
        }
    };
    Config.TEMP_TEST_TYPE = -2;
    Config.DEV = 0;
    Config.QA = 1;
    Config.UAT = 2;
    Config.LIVE = 3;

    const DEV_URLS = {
        "HSIGNZ_SERVER_URL": "https://api-qa8.healthsignz.net/HSignzAppServices/",
        "POZ_SERVER_URL": "https://api-qa8.healthsignz.net/POZAppServices/",
        "SEARCH_SERVER_URL": "https://api-qa.healthsignz.net/search/",
        "CHAT_SERVER_URL": "https://api-qa.healthsignz.net/"
    }

    Config.BUG_FIX_MODE = Config.QA;
    Config.TEST_TYPE = Config.QA;

    Config.portal = PortalConfig.default.MYMEDIC;

    Config.URLS = Config.TEST_TYPE == Config.LIVE ? Config.portal.LIVE_URLS : (Config.TEST_TYPE == Config.UAT ? Config.portal.UAT_URLS : (Config.TEST_TYPE == Config.QA ? Config.portal.QA_URLS : DEV_URLS));

    Config.VERSION = Config.portal.version;

    return Config;
}());
exports.Config = Config;