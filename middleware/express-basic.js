
module.exports = {
	name: "express-basic",
	  run: async function (appExpress) {
		  if (app.config.middleware["express-basic"] && app.config.middleware["express-basic"].options)
			  var options = app.config.middleware["express-basic"].options;
		  else	
			  var options = {}
  
		  if (!options) options = {"body-parser": true, compresion:true, "cookies": true, session: true}
  
		  if (options['body-parser']) {
			  var bodyParser = require('body-parser')
			  var limit = "50mb"
			  if (app.config['body-limit']) limit = app.config['body-limit']
			  appExpress.use(bodyParser.urlencoded({limit: limit, extended: true }))
			  appExpress.use(bodyParser.json({limit: limit}))
		  }
		  if (options['compression']) {
			  var compression = require('compression');
			  appExpress.use(compression())
		  }
	  
		  if (options['cookies']) {
			  var cookieParser = require('cookie-parser');
			  appExpress.use(cookieParser());
			  
			  var cookieSession = require('cookie-session');
			  appExpress.use(cookieSession({
				  name: 'session',
				  keys: ['lalala', 'bububububububub']
			  }));
		  }
		  if (options['session']) {
			  var session = require('express-session');
			  appExpress.use(session({
				  secret: 'keyboard categorie lalala',
				  resave: false,
				  saveUninitialized: true,
				  cookie: { secure: true }
			  }))
		  }
  
  
	}
  }
  