const path = require('path');
const hjson = require('hjsonfile');
const fs = require('fs');

exports.start = async function (apiFile) {
    //deal with errors globbaly
    try {
       //start system
       await boot(apiFile)
    }
    catch (ex) {
        //error
        console.error(ex);
    }
};

async function boot (apiFile) {
    console.log("(sys) Loading SWAGAPI with " + apiFile); 
    
    //creating global interface
    global.swagapi = {}
    global.app = {}
    swagapi.express = [];

    //deal with errors globbaly
    
    app.config = hjson.readFileSync(apiFile);

    let apiDir = path.dirname(apiFile); 
    app.config.baseDir = path.resolve(apiDir, app.config.baseDir);
    app.config.appDir = require('app-root-dir').get();


    //fill properly locations
    Object.keys(app.config.locations).forEach(function (key) {
        app.config.locations[key] = path.resolve(app.config.baseDir, app.config.locations[key]);
    });

    //load libraries
    var requireDir = require('require-dir');
    swagapi.lib = {};
    swagapi.lib = await requireDir(path.resolve(__dirname, "./lib") , { recurse: true });
    swagapi.classes = await requireDir(path.resolve(__dirname, "./classes"), { recurse: true });
    console.log("(sys) Loading libraries and classes done.");


    console.log("(sys) Loading app libs...");
    if (fs.existsSync(app.config.locations.libs))  app.lib = await requireDir(app.config.locations.libs, { recurse: true });
    else console.log("(sys) No libs folder on app...")

    
    
    if (fs.existsSync(app.config.locations.initFile)) 
        app.config.init = hjson.readFileSync(app.config.locations.initFile);
    else 
        throw new Error("Config file for init not found!")


    console.log("========================================================================");
    console.log("(sys) Loading SWAGAPI init...");
    console.log("========================================================================");
    
    //load boot services
    var bootFiles = new swagapi.lib.bootDir();
    bootFiles.loadDir(path.resolve(__dirname, "./init"), app.config.init);
    if (fs.existsSync(app.config.locations.init))
        bootFiles.loadDir(path.resolve(app.config.locations.init));
    
    await bootFiles.exec(swagapi);

    console.log("-> (sys) Loading SWAGAPI init done.");
   
   
}


