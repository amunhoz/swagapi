//queue solution for all
const path = require("path");
module.exports = {
    name: "bull",
    run: async function () {
        var queue = require('queue');

        swapi.queue = queue();
        swapi.queue.concurrency = app.config.modules.queue.config.concurrency;
        swapi.queue.autostart = true;

    }
}


