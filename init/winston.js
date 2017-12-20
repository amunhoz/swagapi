
module.exports = {
    name: "winston",
    run: async function () {


        var winston = require('winston');
        var path = require("path");

        let transports = [
                new (winston.transports.File)({
                    name: 'info-file',
                    filename: path.resolve(app.config.locations.data, './sysInfo.log'),
                    level: 'info',
                    timestamp: true
                }),
                new (winston.transports.File)({
                    name: 'error-file',
                    filename: path.resolve(app.config.locations.data, './sysErr.log'),
                    level: 'error',
                    timestamp: true
                })
            ]
        if (app.config.debug) {
            transports.push(new (winston.transports.Console)({ timestamp: true }));
        }

        global.sysLog = new (winston.Logger)({
            transports: transports
        });
        swapi.sysLog = global.sysLog;

    }
}
