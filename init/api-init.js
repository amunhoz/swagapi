var path = require('path');
var requireDir = require('require-dir');
var fs = require('fs');

module.exports = {
  name: "api-init",
  run: async function () {
      if (fs.existsSync(app.config.locations.security)) app.security = await requireDir(app.config.locations.security);
      else console.log("               - (init) No security folder on app...")
  }
}

