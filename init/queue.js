//queue solution for all
const path = require("path");
module.exports = {
    name: "bull",
    run: async function () {
        var queue = require('queue');

        swagapi.queue = queue();
        swagapi.queue.concurrency = app.config.modules.queue.config.concurrency;
        swagapi.queue.autostart = true;

    }
}


