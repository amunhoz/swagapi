//'use strict';

const fs = require("fs");
const path = require('path');
var clone = require('clone');
const merge = require('merge');

function util() {
    return true;
};

util.decodeJsonStr = function(str){
	var urlencode = require("urlencode");
	var result = {};
	try {
		let decoded = urlencode.decode(str);
		result = JSON.parse( decoded );
	} catch (err) {
		return {};
	}
	return result;
};


util.CheckFilterJson = function (input) {
    let filter = {};
    if (input) {
        if (typeof input === 'string') {
            filter = util.decodeJsonStr(input);
        }
        if (typeof input === 'object') {
            filter = input;
        }
    }
    return filter;
};

util.AddAndFilter = function (pfilter, criteria) {
    if (typeof(pfilter) == "undefined") pfilter = {};
    if (typeof(criteria) == "undefined") criteria = {};

    var filter = {};
    if (Object.keys(pfilter).length==0)  {
        //one side empty
        return criteria
    } else if (Object.keys(criteria).length==0) {
        return pfilter;
    }

    if (!pfilter) {
        filter = {};
    } else {
        if (pfilter.where) filter = clone(pfilter.where);
        else filter = clone(pfilter);
    }

    if (filter.or) {
        var originalObj = JSON.parse(JSON.stringify(filter.or)); //clone obj
        filter =  merge(filter, criteria) ;
        
    } else if (filter.and) {
        if (Array.isArray(filter.and)) {
            filter.and.push(criteria);
        } else {
            filter.and = merge(filter.and, criteria);
        }
    } else {
        if (Array.isArray(filter)) {
            filter.push(criteria);
        } else {
            filter = merge(filter, criteria);
        }
    }
    //pfilter = filter;
    return filter;
};


util.AddAndFiltero = function (pfilter, criteria) {
    if (typeof(pfilter) == "undefined") pfilter = {};
    if (typeof(criteria) == "undefined") criteria = {};

    var filter = {};
    if (Object.keys(pfilter).length==0)  {
        //one side empty
        return criteria
    } else if (Object.keys(criteria).length==0) {
        return pfilter;
    }

    if (!pfilter) {
        filter = {};
    } else {
        if (pfilter.where) filter = clone(pfilter.where);
        else filter = clone(pfilter);
    }

    if (filter.or) {
        var originalObj = JSON.parse(JSON.stringify(filter.or)); //clone obj
        filter = { "and": [{ "or": originalObj }, criteria] };
    } else if (filter.and) {
        if (Array.isArray(filter.and)) {
            filter.and.push(criteria);
        } else {
            filter.and = merge(filter.and, criteria);
        }
    } else {
        if (Array.isArray(filter)) {
            filter.push(criteria);
        } else {
            filter = merge(filter, criteria);
        }
    }
    //pfilter = filter;
    return filter;
};

util.emitEvent = function (modelName, moment, action, ctx) {
	ctx.action = action;
	ctx.moment = moment;
	ctx.modelName = modelName;
	swagapi.events.emit(`models.${modelName}.${moment}.${action}`, ctx);
}


util.getIdFilter = function (req, res, primaryKey, idParam) {
    if (!req.params[idParam]) {
        res.status(400).end(idParam + ' not defined');
        return;
    }
    let filter = {};
    //filter.where = {};
    filter[primaryKey] = req.params[idParam];
    return filter;
};

util.parseValue = function (value) {
    
    if (typeof value === 'object') {
        return value
    } 
    if (typeof value === 'string') {
        if (value.substring(0, 1)=="[" || value.substring(0, 1)=="{") {
            try {
                return  JSON.parse(value)
            } catch (e) {
                console.log("Invalid Json sent to query. Check it out.")
                return ""
            }
        }
    }
    
    
    return value;
};


util.mergeQuery = function (main, additional) {
    let whiteList = ['where','sort','skip','limit','populate']
    let result = Object.assign({}, main); //clone object
    for (var key in additional){
        //remove itens not related
        if (whiteList.indexOf(key) < 0) continue;
        if (!result[key]) { //do not replace main config
            //check for empty objects
            if ( typeof additional[key] !== "undefined" && additional[key] !== null && additional[key] !== "undefined") {
                if (key == "where") {
                    //merge where
                    result['where'] = util.AddAndFilter(main['where'], util.parseValue(additional['where']))
                } else {
                    result[key] = util.parseValue(additional[key])
                }
            }
        }


    }
    
    return result;
};




module.exports = util;