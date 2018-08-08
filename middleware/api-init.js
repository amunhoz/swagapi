var path = require('path');
var fs = require('fs');

module.exports = {
  name: "api-init",
  run: async function (appExpress) {

      //create ctx var
    appExpress.use(function ( req, res, next) {
        req.ctx = {};
        next();
    })

    appExpress.disable('x-powered-by');

    //preload swagger.json to allow customization
    if (!fs.existsSync(app.config.locations.swaggerFile)){
      return console.log("       --> Swaggerize NOT loaded, swagger file not found.");
    }
    
    app.config.swagger = require(app.config.locations.swaggerFile);
    

  }
}

