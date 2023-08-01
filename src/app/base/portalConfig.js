"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var PortalConfig = /** @class */ (function () {
    function PortalConfig() {
    }
    PortalConfig.BASEDATA = {
        "version": "v3.2.10 (14th Mar 2023)",
        "timezoneDifferential": 19800000
        // "timezoneDifferential": 14400000
    };
    PortalConfig.MYMEDIC = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/mymedic/data/mymedicConfig.json'));
    PortalConfig.TENET = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/tenet/data/tenetConfig.json'));
    PortalConfig.AARTHI = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/aarthi/data/aarthiConfig.json'));
    PortalConfig.RENOVA = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/renova/data/renovaConfig.json'));
    PortalConfig.CARE9 = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/care9/data/care9Config.json'));
    PortalConfig.OLIVA = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/oliva/data/olivaConfig.json'));
    PortalConfig.CFH = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/cfh/data/cfhConfig.json'));
    PortalConfig.VDC = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/vdc/data/vdcConfig.json'));
    PortalConfig.YODA = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/yoda/data/yodaConfig.json'));
    PortalConfig.ISHA = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/isha/data/ishaConfig.json'));
    PortalConfig.JEEONE = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/jeevone/data/jeevoneConfig.json'));
    PortalConfig.CLINUS = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/clinus/data/clinusConfig.json'));
    PortalConfig.CHAVAN = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/chavan/data/chavanConfig.json'));
    PortalConfig.ISHA_REJUVEN = __assign({}, PortalConfig.BASEDATA,
        require('../../assets/isharejuvenation/data/isharejuvenConfig.json'));
    return PortalConfig;
}());
exports["default"] = PortalConfig;
