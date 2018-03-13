'use strict';

var func = async function (query) {
	var prom = new Promise((resolve, reject) => {
        //inside code
        query.exec(function (err, result) {
            if (err) reject(err);
            else {
                resolve(result)
            }
        });
        //------------
    });

    return await prom;
}



module.exports = func;
