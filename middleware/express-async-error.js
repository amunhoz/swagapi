
module.exports = {
    name: "express-async-error",
    run: async function (appExpress) {
        //from require('express-async-errors');
        
        //wraper to show async functions errors
        const Layer = require('express/lib/router/layer');

        Object.defineProperty(Layer.prototype, "handle", {
            enumerable: true,
            get: function () { return this.__handle; },
            set: function (fn) {
                if (isAsync(fn)) {
                    fn = wrap(fn);
                }

                this.__handle = fn;
            }
        });
        function isAsync(fn) {
            const type = Object.toString.call(fn.constructor);
            return type.indexOf('AsyncFunction') !== -1;
        };
        function wrap(fn) {
            return (req, res, next) => {
                const routePromise = fn(req, res, next);
                if (routePromise.catch) {
                    routePromise.catch(err => {
                        sysLog.error({message: err.message, stack: err.stack});
                        let resp = {error: {code:  "err_async_express_general", title: "Erro geral express async", details:{message: err.message, stack: err.stack} }}
                        res.status(500).send(resp);
                    });
                    //routePromise.catch(err => next(err));
                }
            }
        };


    }
}
