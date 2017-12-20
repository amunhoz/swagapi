const http = require('http');
const express = require('express');
const path = require('path');
const hjson = require('hjsonfile');
const fs = require('fs');
const sync = require('promise-synchronizer')

exports.start = function (apiFile) {
    //deal with errors globbaly
    try {
       //start system
       sync(init(apiFile))
       sync(startExpress());
    }
    catch (ex) {
        //error
        console.error(JSON.stringify(ex));
    }
};

async function init (apiFile) {
    console.log("(sys) Loading SWAGAPI with " + apiFile); 
    
    //creating global interface
    global.swagapi = {}
    global.app = {}
    swagapi.express = [];

    //deal with errors globbaly
    
    app.config = hjson.readFileSync(apiFile);

    let apiDir = path.dirname(apiFile); 
    app.config.baseDir = path.resolve(apiDir, app.config.baseDir);

    //fill properly locations
    Object.keys(app.config.locations).forEach(function (key) {
        app.config.locations[key] = path.resolve(app.config.baseDir, app.config.locations[key]);
        if (!fs.existsSync(app.config.locations[key])) {
            if (!path.extname(app.config.locations[key]))
                fs.mkdirSync(app.config.locations[key], 0744);
        }
    });

    //load libraries
    var requireDir = require('require-dir');
    swagapi.lib = {};
    swagapi.lib = await requireDir(path.resolve(__dirname, "./lib") , { recurse: true });
    swagapi.classes = await requireDir(path.resolve(__dirname, "./classes"), { recurse: true });
    console.log("(sys) Loading libraries and classes done.");


    //load boot services
    var bootFiles = new swagapi.lib.bootDir();
    app.config.modules = hjson.readFileSync(app.config.locations.initFile);

    console.log("========================================================================");
    console.log("(sys) Loading SWAGAPI init...");
    console.log("========================================================================");
    await bootFiles.start(app, 
                        path.resolve(__dirname, "./init"), 
                        app.config.modules );
    
    console.log("-> (sys) Loading SWAGAPI init done.");
   
   
}



async function startExpress() {
	const appExpress = express();
	var server = http.createServer(appExpress);
    
    swagapi.express = appExpress;

	//load boot services
    var bootFiles = new swagapi.lib.bootDir();
    app.config.modules = hjson.readFileSync(app.config.locations.middlewareFile);

    console.log("------------------------------------------------------------------------");
    console.log("(sys) Loading server process");
    console.log("------------------------------------------------------------------------");
    
    await bootFiles.start(  appExpress, 
                            path.resolve(__dirname, "./middleware"), 
                            app.config.modules );
    console.log("-> (sys) Loading SWAGAPI middleware done.");
    
    
	//start express	
    server.listen(app.config.port, function () {

        console.log('=> (sys) ' + app.config.name + ' listening on port ' + app.config.port + " <=");
		app.config.host = server.address().address;
    });
    return appExpress
    
}
