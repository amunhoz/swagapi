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

        var options = app.config.init["waterline"].options;
        if (!options) options = {}

        var orm = new waterline();
        var config 
        if (path.extname(app.config.locations.connections) == ".js") {
            config = require(app.config.locations.connections); //ERROR
        } else {
            //json config
            config = {adapters:{}, connections:{}}
            if (app.config.locations.connections) {
                var configInfo = hjson.readFileSync(app.config.locations.connections);
                for (var i in configInfo) {
                    config.connections[i] = configInfo[i]
                    config.adapters[configInfo[i].adapter] = require(configInfo[i].adapter)
                    let envkey = "WATERLINE_" + i.toUpperCase() + "_KEY"
                    if (process.env[envkey]) {
                        config.connections[i].password = process.env[envkey]
                    }
                }
            }
        }
        
        
        let fullPath = app.config.locations.models;

        app._models = {};
        var files = fs.readdirSync(fullPath);
        if (files.length == 0 ) return console.log("       no Waterline models found... ");

        files.forEach(function (f) {
            var extension = path.extname(f);
            if (extension == ".js") {
                let modelInfo = require(path.resolve(fullPath, f));
                if (options.unixDateMode) unixDateMode(modelInfo)
                let connInfo = config.connections[modelInfo.connection]
                if (!connInfo) throw new Error("Connection '" + modelInfo.connection + "' not found for model '" + modelInfo.identity + "'")
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

function unixDateMode(modelObj) 
{

    
    // auto dates - compatibility with new waterline
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

    modelObj.autoCreateAt = false
    modelObj.autoUpdateAt = false
    modelObj.attributes.createdAt = {"type":  "integer", index:true}
    modelObj.attributes.updatedAt = {"type":  "integer", index:true}

    return modelObj
}