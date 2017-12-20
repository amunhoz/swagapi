const path = require("path");

module.exports = {
  name: "swagger-ui-express",
  run: async function (appExpress) {
      if (app.config.debug) {
          const swaggerUi = require('swagger-ui-express');
          const swaggerDocument = require(app.config.locations.swaggerFile);
          swaggerDocument.host = app.config.host + ':' + app.config.port;
          appExpress.use('/explorer', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

      }
  }
}
