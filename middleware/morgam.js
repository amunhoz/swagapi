//access log

module.exports = {
  name: "morgan",
  run: async function (appExpress) {
	  var fs = require("fs");
    var morgan = require('morgan');
    var options = app.config.init["express-basic"].options;
    if (!options) options = {}
    if (!options.file)  options.file = app.config.locations.data + '/access.log'
    if (!options.config)  options.config = { flags: 'a' }
    
	  const accessLogStream = fs.createWriteStream( options.file ,  options.config)
    appExpress.use(morgan('combined', { stream: accessLogStream }))

	
  }
}
