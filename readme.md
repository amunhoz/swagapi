SWAPI is a boilerplate to reduce programming time for node APIs using some shortcuts to make life easier.
The Swapi is based in some concepts:
	- Use directory structure for routes as possible to make easier to read the code
	- A event structure to customize behaviours without complexity
	- Blueprints with commom functions for apis to speed up
	- Keep some control of the modules with some predefined ones
	- Use a simple ROUTES+LIBRARIES+INITIAL_CODE concept to make everything.

ROUTES
-----------------------------------------------------------------------
Using swagger
	1. Create a swagger file and put in /app/config
	2. Configure api.hjon with the correct name
	3. Put the files for your route in /app/routesApi with a method for each request type

		module.exports = {
			post: async function (req, res) {
				//code for post
			},
			get: async function (req, res) {
				//code for get
			}
		};
	4. Security policy - Just put a file with the same name of policy inside /app/security
	5. Use the example code above:
		
		async function authorize(req, res, next) {
			 if (true) {
					 return next();
			 } else {
				 res.status(403).send({sucess:false, error:"Unauthorized."});
			 }
		}
		module.exports = authorize;
	
	
Using only js files
	1. Just put the file in /app/routesDir and it will create a route automaticaly
	2. Use the follow structure

		var router = require('express').Router();
		router.get('/', swapi.security.apikey, function(req, res, next) {
				//code for get
		});


VIEWS
-----------------------------------------------------------------------
You can acces render views with
	req.render(viewName, data)

Template language
	We use the EJS module for it ( http://ejs.co/ )

View events

	views.viewName.before
	[views]		- event area
	[viewName]	- view name as used in render() funciton
	[moment]	- before or after
	[*] 		- can use wild cards in parameters
	
	eventFunction (ctx) {
		// the ctx parameter will come with details like req, res, viewName, data
	
	}
	

MODELS - Use Waterline documentation
-----------------------------------------------------------------------
You can acces models from 
	swapi.models  	- Waterline models
	swapi.imodels	- custom interface with event trigger
	
Models events

	models.modelName.before.create	- This event will trigger before create a register in modelName
	[models] - event area
	[modelName] - model name
	[before] 	- moment, it can be 'before' or 'after'
	[create]	- operation, can be create, find, findOne, update and delete
	[*] 		- can use wild cards in parameters

	eventFunction (ctx) {
		// the ctx parameter will come with details like req, res, criteria, model, modelName, data...
	
	}
	
	
MODULES
-----------------------------------------------------------------------
The system auto load some modules, wich you can control or configure from
	/app/config/models.hjson  (commented json)
	
	
	
	
INIT - Run every script in /app/init at start
-----------------------------------------------------------------------
Put the file there with the proper config and it will run at app start
Follow the structure:	

	module.exports = {
		priority: 999,	// priority among others
		enabled: true,	// you can enable/disable
		name: "Tests",  // avoid same name of others
		run: async function (app) {
			console.log(" your code here");
		}
	}
	
	
LIB - Auto load libraries from /app/lib
-----------------------------------------------------------------------
All libs will be loaded into swapi.lib.YourLibName.YourFunction();
Follow the structure:	

	function myLib() {
		return true;
	};
	myLib.funcUtil = async function (url, query, headers) {
		console.log(url);
	};
	module.exports = myLib;
	
	
PUBLIC - Serve your static content
-----------------------------------------------------------------------
Just put inside /app/public
	
	
	
	
BLUEPRINTS - Deal with request complexity in a easy way
-----------------------------------------------------------------------
Has the functions: create, update, delete, find, count and findOne

	module.exports = {
		post: async function (req, res) {
			swapi.lib.blueprints.create({ req: req, res: res, modelName: "tag" });
		},
		get: async function (req, res) {
			swapi.lib.blueprints.find({ req: req, res: res, modelName: "tag" });
		}

	};
You can check additional parameters inside the code in \swapi\lib\blueprints\[operation].js
	 
	
	
GLOBAL ERROR HANDLING -
-----------------------------------------------------------------------
 There is a global error threatment with express..
 To get better error messages:
	• you DONT need to use try/cath
	• always use await in front the async functions (blueprints, imodels, etc)

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	