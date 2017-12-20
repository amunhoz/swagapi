
module.exports = {
  name: "helmet",
  run: async function (appExpress) {

		var helmet = require('helmet');
		appExpress.use(helmet());


  }
}
