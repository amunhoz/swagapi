//queue solution for all
const path = require("path");
module.exports = {
    name: "bull",
    run: async function () {
        var queue = require('queue');
        swagapi.queue = queue();
        if (app.config.init.queue && app.config.init.queue.options && app.config.init.queue.options.concurrency)
            swagapi.queue.concurrency = app.config.init.queue.options.concurrency;
        else 
            swagapi.queue.concurrency = 2
            
        swagapi.queue.autostart = true;
    }
}


