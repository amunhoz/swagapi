//queue solution for all
const path = require("path");
module.exports = {
    name: "cache-manager",
    run: async function () {
		var cacheManager = require('cache-manager');
		let options = app.config.init["cache-manager"].options;
        swagapi.cache = cacheManager.caching(options);
    }
}


