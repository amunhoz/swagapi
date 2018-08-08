const express = require('express');
const path = require('path');
const hjson = require('hjsonfile');
const fs = require('fs');

module.exports = {
    name: "express",
    priority: 500,
    run: async function () {

            if (!app.config.protocol) app.config.protocol = "http"
            var options = {}

            var protocol = require(app.config.protocol)
            var appExpress = express();
            swagapi.express = appExpress;
            if (app.config.protocol == "https" || app.config.protocol == "spdy" ) {
                try {
                    Object.keys(app.config.certificates).forEach(function (key) {
                        app.config.certificates[key] = path.resolve(app.config.baseDir, app.config.certificates[key]);
                    });
                    options = {
                        key: fs.readFileSync(app.config.certificates.keyFile),
                        cert: fs.readFileSync(app.config.certificates.certFile)
                    };
                } catch (e) {
                    console.log("Error getting certificates for https in config, serving http")
                    console.log(e)
                    app.config.protocol = "http"
                }
            } 

            if (app.config.protocol == "http")
                appExpress.server = protocol.createServer(appExpress);
            else {
                appExpress.server = protocol.createServer(options, appExpress);
            }
            

            //load boot services
            var bootFiles = new swagapi.lib.bootDir();
            if (fs.existsSync(app.config.locations.middlewareFile)) 
                app.config.middleware = hjson.readFileSync(app.config.locations.middlewareFile);
            else 
                throw new Error("Config file for Middleware not found!")

            console.log("------------------------------------------------------------------------");
            console.log("(sys) Loading server process");
            console.log("------------------------------------------------------------------------");
            

            //load boot services
            var bootFiles = new swagapi.lib.bootDir();
            await bootFiles.loadDir(path.resolve(__dirname, "../middleware"), app.config.middleware);
            if (fs.existsSync(app.config.locations.middleware))
                await bootFiles.loadDir(path.resolve(app.config.locations.middleware));    
            await bootFiles.exec(appExpress);

            console.log("-> (sys) Loading SWAGAPI middleware done.");
            
            //express error handling
            require('express-async-errors');

            //start express	
            if (app.config.port) {
                swagapi.express.server.listen(app.config.port, function () {
                    console.log('=> (sys) ' + app.config.name + ' listening on port ' + app.config.port + " protocol: " + app.config.protocol + "<=");
                    app.config.host = swagapi.express.server.address().address;
                });
            }
            
    }
};

