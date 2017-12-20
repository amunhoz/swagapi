'use strict';

module.exports = function CustomError(message, area, ctx, originalError) {
  if (! originalError)
    Error.captureStackTrace(this, this.constructor);
 else
    this.originalError = originalError
    
  this.name = this.constructor.name;
  this.message = message;
  this.area = area;
  if (ctx.modelName) this.modelName = ctx.modelName;
  if (ctx.data) this.data = ctx.data;
  if (ctx.query) this.query = ctx.query;
  if (ctx.criteria) this.criteria = ctx.criteria;
  if (ctx.req && ctx.req.path) this.reqPath = ctx.req.path;
  if (ctx.req && ctx.req.query) this.reqQuery = ctx.req.query;
  if (ctx.req && ctx.req.params) this.reqParams= ctx.req.params;
  if (ctx.req && ctx.req.body) this.reqBody= ctx.req.body;

};

require('util').inherits(module.exports, Error);