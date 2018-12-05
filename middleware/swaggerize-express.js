const swaggerize = require('swaggerize-express-upd');
const path = require("path");
var fs = require('fs');

module.exports = {
  name: "swaggerize-express",
  run: async function (appExpress) {

        
        if (!fs.existsSync(app.config.locations.routesApi)){
            return console.log("       --> Swaggerize NOT loaded, api routes dir not found.");
        }
		
		// set options
		var opt = {
		  // path of api doc
          api: app.config.swagger,
		  // dir of things
          handlers: app.config.locations.routesApi,
          basedir: app.config.baseDir,
          security: app.config.locations.security,
		  docspath: '/api-docs'
		};
        
        const requireDir = require('require-dir');
        if (fs.existsSync(app.config.locations.security))
            swagapi.security = await requireDir(app.config.locations.security, { recurse: true });
        

        try {
            appExpress.use(swaggerize(opt));
        } catch (err) {
            // Handle the error here.
            console.error("Error on loading swagger routes from file, check your route files or your check your file syntax in " + app.config.locations.swaggerFile);
            console.log(err);
        }
        
        //custom error for validation problems
        appExpress.use(function (err, req, res, next) {
            //deal with swagger validation errors
            if (err.name == "ValidationError") {
                //yeap
                let resp = { error: {code:  "err_input_validation", message: "Erro de validação de dados.", details: `Campo '${err.details[0].context.key}' espera formato '${err._object.short_name}'`, stack: err.stack} }
                res.status(400).send(resp);
            } else {
                next(err); //dont keep going
            }
            
        })


        appExpress.swagger.api.host = app.config.host + ':' + app.config.port;
        
	  
  }
}
