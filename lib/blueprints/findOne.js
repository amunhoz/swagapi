'use strict';

var findOne = async function (ctx, returnResult) {

    /*
    ctx = {
        modelName:modname,                  //model name for the operation
        req: req,                           // request object
        res: res,                           // response object
        addFilter: addFilter,               // additional filter
        query: {                            // will replace parameters in query (sort, limit, skip, filter)
            where: {field: "value"},        //replace the filter
        },
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
    let model = app.models[ctx.modelName];
    if (!model) {
        throw new swapi.lib.Error("Model not found!",  "err_blueprint_model_nf", ctx );
    }

    
    //----------------------------------------------------------------------------------------------------------
    //Get filter

    //primaryKey 
    let primaryKey;
    if (ctx.primaryKey) primaryKey = ctx.primaryKey;
    else primaryKey = model.model.primaryKey;

    //id field param
    let idParam
    if (ctx.idParam) idParam = ctx.idParam;
    else idParam = "id";

   //----------------------------------------------------------------------------------------------------------
    //defining where clause
    let query = {}
    if (ctx.query) query = ctx.query;
    //get filter from res
    if (!query.where) query.where = swapi.lib.blueHelper.getIdFilter(ctx.req, ctx.res, primaryKey, idParam);
    if (ctx.query && ctx.query.where) query.where = swapi.lib.blueHelper.mergeQuery(query.where, ctx.query.where);
    if (ctx.addFilter) query.where  = swapi.lib.blueHelper.AddAndFilter(query.where, ctx.addFilter)
    ctx.query = query;

    //----------------------------------------------------------------------------------------------------------
    //use other blueprint to main command
    var result = await swapi.lib.blueprints.find(ctx, true);
    
    //checking for event cancelation of the operation
    if (result === false) return false;
    
    // return results - if false, probaly the res.send was runned
 
    if (returnResult) { 
        if (result[0]) return result[0]
        else return {}
    } else {
        if (result[0]) {
            return ctx.res.send(result[0])
        } else {
            let resp = {error:{ code:"blueprint_reg_not_found", title: "Register not found!", details: {query: query}}}
            return ctx.res.status(404).send(resp) && false;
        }
    }
    

    
    
}


module.exports = findOne;

