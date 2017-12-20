var path = require('path');

module.exports = {
  name: "api-init",
  run: async function (appExpress) {

      //create ctx var
    appExpress.use(function ( req, res, next) {
        req.ctx = {};
        next();
    })
    
    var bootFiles = new swapi.lib.bootDir();
    
    console.log("               (mid) Loading app middleware...");
    var midFiles = new swapi.lib.bootDir();
    await midFiles.start(appExpress, path.resolve(app.config.locations.middleware));

   

  }
}

