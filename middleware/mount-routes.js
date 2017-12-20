//mount routes custom place
module.exports = {
  name: "mount-routes",
  run: async function (appExpress) {
	const path = require("path");
    var mount = require('mount-routes');
    mount(appExpress, app.config.locations.routesDir);
    console.log("                (mid) Express path route loaded from " + app.config.locations.routesDir);
  }
}
