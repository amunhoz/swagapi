var Waterline = require('waterline');
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

        var options = app.config.init["waterline"].options;
        if (!options) options = {}

        var waterline = new Waterline();

        var config 
        if (path.extname(app.config.locations.connections) == ".js") {
            config = require(app.config.locations.connections); //ERROR
        } else {
            //json config
            config = {adapters:{}, datastores:{}}
            if (app.config.locations.connections) {
                var configInfo = hjson.readFileSync(app.config.locations.connections);
                for (var i in configInfo) {
                    config.datastores[i] = configInfo[i]
                    config.adapters[configInfo[i].adapter] = require(configInfo[i].adapter)
                    let envkey = "Waterline_" + i.toUpperCase() + "_KEY"
                    if (process.env[envkey]) {
                        config.datastores[i].password = process.env[envkey]
                    }
                }
            }
        }
        
        
        let fullPath = app.config.locations.models;

        app._models = {};
        var files = fs.readdirSync(fullPath);
        if (files.length == 0 ) return console.log("       no Waterline models found... ");
        var modelNames = []
        files.forEach(function (f) {
            var extension = path.extname(f);
            if (extension == ".js") {
                let modelInfo = require(path.resolve(fullPath, f));
                //if (options.unixDateMode) unixDateMode(modelInfo)
                let connInfo = config.datastores[modelInfo.datastore]
                if (!connInfo) throw new Error("Connection '" + modelInfo.datastore + "' not found for model '" + modelInfo.identity + "'")
                if (process.env.SWAGAPI_ALTER_MODELS || connInfo.alter ) modelInfo.migrate = "alter" 
                let model = Waterline.Collection.extend(modelInfo);
                //waterline.loadCollection(model);
                waterline.registerModel(model);
                modelNames.push(modelInfo.identity)
            }
        });

        var orm = await waitForwaterline(waterline, config);

        app._models = orm.collections;

        app.models = {};
        for (item in app._models) {
            app.models[item] = new swagapi.classes.iModel(item);
        }
        
        swagapi.orm = orm;
        swagapi.waterline = waterline;


    }
};



async function waitForwaterline(waterline, config) {

    return new Promise((resolve, reject) => {
        //registerDatastore
        waterline.initialize(config, function (err, orm) {
            if (err) reject(err);
            else {
                resolve(orm)
                console.log("       Waterline full loaded.");
            }
        });

    });

}

function unixDateMode(modelObj) 
{

    
    // auto dates - compatibility with new Waterline
    if (modelObj.beforeCreate) {
        if (!Array.isArray(modelObj.beforeCreate)) {
            modelObj.beforeCreate = [modelObj.beforeCreate]
        }       
    } else {
        modelObj.beforeCreate = []
    }
    modelObj.beforeCreate.push( function (values, cb) {
        if (values.createdAt && ! Number.isInteger(values.createdAt) ) 
            values.createdAt = moment().utc().unix();
        else 
            values.createdAt = moment().utc().unix();

        if (values.updatedAt && ! Number.isInteger(values.updatedAt) ) 
            values.updatedAt = moment().utc().unix();
        else 
            values.updatedAt = moment().utc().unix();
        cb();
    })

    if (modelObj.beforeUpdate) {
        if (!Array.isArray(modelObj.beforeUpdate)) {
            modelObj.beforeUpdate = [modelObj.beforeUpdate]
        }       
    } else {
        modelObj.beforeUpdate = []
    }
    modelObj.beforeUpdate.push( function (values, cb) {
        
        if (values.updatedAt && ! Number.isInteger(values.updatedAt) ) 
            values.updatedAt = moment().utc().unix();
        else 
            values.updatedAt = moment().utc().unix();

        cb();
    })
    modelObj.schema = true
    //modelObj.autoCreatedAt = false
    //modelObj.autoUpdatedAt = false
    modelObj.attributes.createdAt = {"type":  "number", autoCreatedAt: true}
    modelObj.attributes.updatedAt = {"type":  "number", autoUpdatedAt: true}

    return modelObj
}