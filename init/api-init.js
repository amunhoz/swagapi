var path = require('path');
var requireDir = require('require-dir');

module.exports = {
  name: "api-init",
  run: async function () {
    console.log("               (init) Loading app init...");
    if (fs.existsSync(app.config.locations.libs))  app.lib = await requireDir(app.config.locations.libs, { recurse: true });
    else console.log("               - (init) No libs folder on app...")

    if (fs.existsSync(app.config.locations.security)) app.security = await requireDir(app.config.locations.security);
    else console.log("               - (init) No security folder on app...")

    var bootFiles = new swagapi.lib.bootDir();
    if (fs.existsSync(app.config.locations.init)) await bootFiles.start({}, path.resolve(app.config.locations.init));
    else console.log("               - (init) No init folder on app...")
  
      


	    
      
    
  }
}

