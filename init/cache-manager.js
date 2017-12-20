//queue solution for all
const path = require("path");
module.exports = {
    name: "cache-manager",
    run: async function () {
		var cacheManager = require('cache-manager');
		let options = app.config.modules["cache-manager"].options;
        swapi.cache = cacheManager.caching(options);
    }
}


