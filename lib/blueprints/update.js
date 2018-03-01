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
            sort: sort,                     // Field ASC, reorder
            limit: limit,                   // limit itens
            skip: skip                      // skip itens
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
    let model = app.models[ctx.modelName.toLowerCase()];
    if (!model) {
        throw new swagapi.lib.Error("Model not found!",  "err_blueprint_model_nf", ctx );
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
    query.where = swagapi.lib.blueHelper.getIdFilter(ctx.req, ctx.res, primaryKey, idParam);
    if (ctx.query && ctx.query.where) query.where = swagapi.lib.blueHelper.mergeQuery(query.where, ctx.query.where);
    if (ctx.addFilter) query.where  = swagapi.lib.blueHelper.AddAndFilter(query.where, ctx.addFilter)

    
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
    // loop every item and check for update or create

    try{
        var result = await model.update(query, data, { req: ctx.req, res: ctx.res });
    }
    catch (e) {
        let resp = {error:{ code:"err_blueprint_update", title: "Erro ao atualizar o registro!", details: {query: query, data:data,message:e.message, stack:e.stack}}}
        return ctx.res.status(400).send(resp) && false;
    }

    //checking for event cancelation of the operation
    if (result === false) return false;
    
    //----------------------------------------------------------------------------------------------------------
    //deal with subitens
    if (ctx.subItens && result[0]) {
        //getting model
        let smodel = app.models[ctx.subItens.modelName];
        if (!smodel) {
            throw new swagapi.lib.Error("Model not found!",  "err_blueprint_model_nf", ctx );
        }

        let pprimaryKey = model.model.primaryKey;
        let sprimaryKey = smodel.model.primaryKey;
        result[0][ctx.subItens.itemName] = [];
        var sresult;
        var currentItens = [];
        let scriteria = {};
        scriteria.where = {};

        //==============================================================================================
        // loop every item and check for update or create
        for( var i in dataItens){
            //feeding connection
            dataItens[i][ctx.subItens.parentField] = result[0][pprimaryKey];
            try {
                if (dataItens[i][sprimaryKey] && dataItens[i][sprimaryKey] > 0 ) {
                    //update                   
                    let itemId = dataItens[i][sprimaryKey]; 
                    sresult = await smodel.update(itemId, dataItens[i], { req: ctx.req, res: ctx.res });
                    sresult = sresult[0]
                } else {
                    //create
                    sresult = await smodel.create(dataItens[i], { req: ctx.req, res: ctx.res });
                }
                result[0][ctx.subItens.itemName].push(sresult);
                currentItens.push(sresult[sprimaryKey]);
                
            } catch (e) {
                let resp = {error:{ code:"err_blueprint_sub_update", title: "Erro ao criar o novo registro!", details: {data:dataItens[i],message:e.message, stack:e.stack}}}
                return ctx.res.status(400).send(resp) && false;
            }
           
            
        } // end for

        
        //==============================================================================================
        //delete all except the current itens
        scriteria.where[sprimaryKey] = {'!' : currentItens}
        scriteria.where[ctx.subItens.parentField] = result[0][pprimaryKey]
        let xres = await smodel.delete(scriteria,  { req: ctx.req, res: ctx.res });
        
    }

    //----------------------------------------------------------------------------------------------------------
    //return results
    if (result[0]) {
        if (returnResult) return result[0]
        else return ctx.res.send(result[0])
    }
    else {
        let resp = {error:{ code:"blueprint_reg_not_found", title: "Register not found!", details: {query: query, data:data}}}
        return ctx.res.status(404).send(resp) && false;
    }

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

