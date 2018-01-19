
module.exports = {
    name: "express-error",
    run: async function (appExpress) {
              //commom express errors
        appExpress.use(function (err, req, res, next) {
            if (err) {
                sysLog.error({message: err.message, stack: err.stack});
                if (!res.headersSent) {
                    let resp = { error: {code: "err_express_general", title:"Erro geral express",details:{message: err.message, stack: err.stack}} }
                    res.status(err.status ? err.status : 500).send(resp);
                }
            }
            next(err);
        })

    }
}
