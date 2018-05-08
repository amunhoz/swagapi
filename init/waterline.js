var waterline = require('waterline');
var path = require('path');
var fs = require('fs');
const hjson = require('hjsonfile');

module.exports = {
    name: "waterline",
    run: async function () {
        if (!fs.existsSync(app.config.locations.models)){
            return console.log("       --> Waterline NOT loaded, models folder not found.");
        }

        if (!fs.existsSync(app.config.locations.connections)){
            return console.log("       --> Waterline NOT loaded, connections file not found.");
        }
        

        var orm = new waterline();
        var config 
        if (path.extname(app.config.locations.connections) == ".js") {
            config = require(app.config.locations.connections); //ERROR
        } else {
            //json config
            config = {adapters:{}, connections:{}}
            var configInfo = hjson.readFileSync(app.config.locations.connections);
            for (var i in configInfo) {
                config.connections[i] = configInfo[i]
                config.adapters[configInfo[i].adapter] = require(configInfo[i].adapter)
            }

        }
        
        let fullPath = app.config.locations.models;

        app._models = {};
        var files = fs.readdirSync(fullPath);
        files.forEach(function (f) {
            var extension = path.extname(f);
            if (extension == ".js") {
                let modelInfo = require(path.resolve(fullPath, f));
                let connInfo = config.connections[modelInfo.connection]
                if (process.env.SWAGAPI_ALTER_MODELS || connInfo.alter ) modelInfo.migrate = "alter" 
                let model = waterline.Collection.extend(modelInfo);
                orm.loadCollection(model);
            }
        });

        await waitForOrm(orm, config);

        app._models = orm.collections;

        //creating model interfaces
        app.models = {};
        for (item in app._models) {
            app.models[item] = new swagapi.classes.iModel(item);
        }
        
        swagapi.waterline = orm;

    }
};



async function waitForOrm(orm, config) {

    return new Promise((resolve, reject) => {

        orm.initialize(config, function (err, models) {
            if (err) reject(err);
            else {
                resolve()
                console.log("       Waterline full loaded.");
            }
        });

    });

}