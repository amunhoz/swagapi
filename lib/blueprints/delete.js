'use strict';

var func = async function (ctx, returnResult) {
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
        throw new swagapi.lib.error("Model not found!",  "err_blueprint_model_nf", ctx );
    }

    //----------------------------------------------------------------------------------------------------------
    //defining criteria

    //primaryKey 
    let primaryKey;
    if (ctx.primaryKey) primaryKey = ctx.primaryKey;
    else primaryKey = model.model.primaryKey;
    
    //idParam from params req
    let idParam
    if (ctx.idParam) idParam = ctx.idParam;
    else idParam = "id";
    
  //----------------------------------------------------------------------------------------------------------
    //defining where clause
    let query = {}
    
    //get filter from res
    query.where = swagapi.lib.blueprints.helper.util.getIdFilter(ctx.req, ctx.res, primaryKey, idParam);
    if (ctx.query && ctx.query.where) query.where = swagapi.lib.blueprints.helper.util.mergeQuery(query.where, ctx.query.where);
    if (ctx.addFilter) query.where  = swagapi.lib.blueprints.helper.util.AddAndFilter(query.where, ctx.addFilter)
    

    //----------------------------------------------------------------------------------------------------------
    //execute
    var result = await model.delete(query,  { req: ctx.req, res: ctx.res });
        
    
    //checking for event cancelation of the operation
    if (result === false) return false;
    
    //----------------------------------------------------------------------------------------------------------
    //suport for sub itens 
    if (ctx.subItens && result) {
        //getting model
        let smodel = app.models[ctx.subItens.modelName];
        if (!smodel) {
            throw new swagapi.lib.error("Model not found!",  "err_blueprint_model_nf", ctx );
        }

        let scriteria = {};
        scriteria.where = {};
        let pprimaryKey = ctx.subItens.primaryKey ? ctx.subItens.primaryKey : model.model.primaryKey;
        scriteria.where[ctx.subItens.parentField] = result[pprimaryKey];
        
        // delete at once
        var sresult = await smodel.delete(scriteria, { req: ctx.req, res: ctx.res });
        result[ctx.subItens.itemName] = sresult;
        
    }

    //----------------------------------------------------------------------------------------------------------
    //return results
    
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


module.exports = func;
