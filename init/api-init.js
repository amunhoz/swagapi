var path = require('path');
var requireDir = require('require-dir');

module.exports = {
  name: "api-init",
  run: async function () {

      app.lib = await requireDir(app.config.locations.libs, { recurse: true });
      
      app.security = await requireDir(app.config.locations.security);
      
      var bootFiles = new swagapi.lib.bootDir();
      
      console.log("               (init) Loading app init...");
      await bootFiles.start({}, path.resolve(app.config.locations.init));


	    
      
    
  }
}

