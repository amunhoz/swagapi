//to serve static files
module.exports = {
  name: "serve-static",
  run: async function (appExpress) {
	  var path=require("path");
    var serveStatic = require('serve-static')
    var dir = app.config.locations.static;
    appExpress.use(serveStatic(dir, { 'index': ['default.html', 'default.htm'] }))

	
  }
}
