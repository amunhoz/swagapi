var request = require('request');

//request with support for await
exports.request = async function (options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) reject(error)
            else resolve(body)
        })
    })
}


exports.leftMergeObj = function (main, additional) {
    for (var key in additional){
         if (!main[key]) {
            main[key] = additional[key]
        }
    }
    return main;
};


var clone = require('clone')
//extending objects .cloneMe function
Object.defineProperty(Object.prototype, "cloneMe", {
    enumerable: false,
    value: function() {
        return clone(this);
    }
});


