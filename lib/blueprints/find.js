'use strict';
const merge = require('merge');
var clone = require('util')._extend;

var find = async function (ctx, returnResult) {
    /*
    ctx = {
        modelName:modname,                  //model name for the operation
        req: req,                           // request object
        res: res,                           // response object
        addFilter: addFilter,               // additional filter
        query: {                            // will replace parameters in query (sort, limit, skip, filter)
            where: {field: "value"},        //replace the filter
            sort: sort,                     // Field ASC, reorder
            populate: 'item1, item2',       // populate relations
            limit: limit,                   // limit itens
            skip: skip                      // skip itens
        },
        subItens:{
            modelName : "model_itens", //model name for subitens
            parentField : "model_id",  // parent id field name
            itemName : "itens",            // name for the itens in the data array
            primaryKey: "id"
        }
    }
    It auto check query parameters:
        filter - filter in json format (see waterline doc)
        pupulate - the presence of the parameter will trigger the populate of relations
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
        throw new swagapi.lib.Error("Model not found!",  "err_blueprint_model_nf", ctx );
    }

    //----------------------------------------------------------------------------------------------------------
    //defining criteria
    var query = {};
    
    if (ctx.query) query = JSON.parse(JSON.stringify(ctx.query)); //clone object
    if (ctx.req.query) query = swagapi.lib.blueHelper.mergeQuery (query, ctx.req.query)
    if (ctx.addFilter) query.where  = swagapi.lib.blueHelper.AddAndFilter(query.where, ctx.addFilter);

    //----------------------------------------------------------------------------------------------------------
    //executing    
    var result = await model.find(query, { req: ctx.req, res: ctx.res });
    
    //checking for event cancelation of the operation
    if (result === false) return false;
    

    var resultFinal = [];   
    //----------------------------------------------------------------------------------------------------------
    //suport for sub itens 
    if (ctx.subItens && result[0]) {
        //checking model
        let smodel = app.models[ctx.subItens.modelName];
        if (!smodel) {
            throw new swagapi.lib.Error("Model not found!",  "err_blueprint_model_nf", ctx );
        }
        
        let pprimaryKey = ctx.subItens.primaryKey ? ctx.subItens.primaryKey : model.model.primaryKey;
        
        //getting subitens from each result
        for(var i = 0; i < result.length;i++){
            let squery = {};
            //query customization
            if (ctx.subItens.query) squery =  JSON.parse(JSON.stringify(ctx.subItens.query))  //clone object
            if (!squery.where) squery.where = {};
            squery.where[ctx.subItens.parentField] = result[i][pprimaryKey];
            if (ctx.subItens.addFilter) squery.where  = swagapi.lib.blueHelper.AddAndFilter(squery.where, ctx.subItens.addFilter);

            //execute query
            var sresult = await smodel.find(squery, { req: ctx.req, res: ctx.res });
            let record = result[i].toObject();
            record[ctx.subItens.itemName] = sresult
            //result[i][ctx.subItens.itemName] = sresult;
            resultFinal.push(record);
        }
    } else {
        resultFinal = result;
    }
    

    //----------------------------------------------------------------------------------------------------------
    //return results
    if (returnResult) { 
        return resultFinal
    } else {
        if (resultFinal[0]) {
            return ctx.res.send(resultFinal)
        } else {
            let resp = {error:{ code:"blueprint_reg_not_found", title: "Register not found!", details: {query: query}}}
            return ctx.res.status(404).send(resp) && false;
        }

    }
}


module.exports = find;
