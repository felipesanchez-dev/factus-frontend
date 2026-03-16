"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseUrl = getBaseUrl;
const BASE_URLS = {
    sandbox: "https://api-sandbox.factus.com.co",
    production: "https://api.factus.com.co",
};
function getBaseUrl(environment) {
    return BASE_URLS[environment];
}
//# sourceMappingURL=environment.config.js.map