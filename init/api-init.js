var path = require('path');
var requireDir = require('require-dir');
var fs = require('fs');

module.exports = {
  name: "api-init",
  run: async function () {

      //console.log("               (init) Loading app init...");
      //if (fs.existsSync(app.config.locations.libs))  app.lib = await requireDir(app.config.locations.libs, { recurse: true });
      //else console.log("               - (init) No libs folder on app...")
  
      if (fs.existsSync(app.config.locations.security)) app.security = await requireDir(app.config.locations.security);
      else console.log("               - (init) No security folder on app...")
      
      
      
    
  }
}

