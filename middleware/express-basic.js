﻿
module.exports = {
  name: "express-basic",
	run: async function (appExpress) {
	  
		var bodyParser = require('body-parser')
		var limit = "50mb"
		if (app.config['body-limit']) limit = app.config['body-limit']
		appExpress.use(bodyParser.urlencoded({limit: limit, extended: true }))
		appExpress.use(bodyParser.json({limit: limit}))
	
		var compression = require('compression');
		appExpress.use(compression())
		
		var cookieParser = require('cookie-parser');
		appExpress.use(cookieParser());
		
		var cookieSession = require('cookie-session');
		appExpress.use(cookieSession({
			name: 'session',
			keys: ['lalala', 'bububububububub']
		}));
		
		var session = require('express-session');
		appExpress.use(session({
			secret: 'keyboard categorie lalala',
			resave: false,
			saveUninitialized: true,
			cookie: { secure: true }
		}))


  }
}
