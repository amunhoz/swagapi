var path = require('path');

module.exports = {
  name: "api-init",
  run: async function (appExpress) {

      //create ctx var
    appExpress.use(function ( req, res, next) {
        req.ctx = {};
        next();
    })
    
    
  }
}

