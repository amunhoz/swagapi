'use strict';

var func = async function (ctx, returnResult) {
    /*
    ctx = {
        modelName:modname,                  //model name for the operation
        req: req,                           // request object
        res: res,                           // response object
        subItens:{
            modelName : "model_itens", //model name for subitens
            parentField : "model_id",  // parent id field name
            itemName : "itens",            // name for the itens in the data array
            primaryKey: "id"
        },
        defaults: {
            field1: "value",
            field2: "value"
        }
    }
    */
    
    //check headers_sent 
    if (ctx.res && ctx.res._headerSent && !returnResult) { 
        throw new Error('Headers already sended... cancelling blueprint operation'); //outside callback
        return;//if any other middleware has ended it
    }

    //----------------------------------------------------------------------------------------------------------
    //checking model
    let model = app.models[ctx.modelName.toLowerCase()];
    if (!model) {
        throw new swagapi.lib.Error("Model not found!",  "err_blueprint_model_nf", ctx );
    }
    
    //----------------------------------------------------------------------------------------------------------
    //getting data
    let data = ctx.req.body;

    if (ctx.defaults) {
        for (item in ctx.defaults) {
            data[item] = ctx.defaults[item];
        }
    }
    
    //----------------------------------------------------------------------------------------------------------
    //suport for sub itens 
    var dataItens = [];
    if (ctx.subItens) {
        if (data[ctx.subItens.itemName]) {
            dataItens = data[ctx.subItens.itemName];
            delete data[ctx.subItens.itemName];
        }
    }
    
    //----------------------------------------------------------------------------------------------------------
    //execute main command
    try{
        var result = await model.create(data, { req: ctx.req, res: ctx.res });
    }
    catch (e) {
        throw new swagapi.lib.Error("Erro ao criar o novo registro!",  "err_blueprint_create", ctx );
    }

    //checking for event cancelation of the operation
    if (result === false) return false;
    
    
    //----------------------------------------------------------------------------------------------------------
    //suport for sub itens 
    if (ctx.subItens && result && dataItens[0]) {
        //getting model
        let smodel = app.models[ctx.subItens.modelName];
        if (!smodel) {
            throw new swagapi.lib.Error("Model not found!",  "err_blueprint_model_nf", ctx );
        }

        let defaults = {};
        let pprimaryKey = model.model.primaryKey;
        
        result[ctx.subItens.itemName] = [];

        for(var i = 0; i < dataItens.length;i++){
            //feeding connection
            dataItens[i][ctx.subItens.parentField] = result[pprimaryKey];
            var sresult = await smodel.create(dataItens[i], { req: ctx.req, res: ctx.res });
            result[ctx.subItens.itemName].push(sresult);
        }
        
    }

    //----------------------------------------------------------------------------------------------------------
    //return results
    if (returnResult) return result
    else return ctx.res.send(result)
    
}


module.exports = func;
