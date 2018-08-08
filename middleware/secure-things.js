var path = require('path');
var fs = require('fs');

module.exports = {
  name: "secure",
  run: async function (appExpress) {
    appExpress.disable('x-powered-by');

    app.use(function(req, res, next){
      res.header('X-XSS-Protection', '1; mode=block');
      res.header('X-Frame-Options', 'deny');
      res.header('X-Content-Type-Options', 'nosniff');
      next();
    });

  }
}

