/**
 * Module dependencies.
 */
var co = require('co')
//start app
co.wrap(function*(){
	var app = yield require("./lib/loader/app-loader")()	
	app.listen(global.appContext.port)
	console.log(global.appContext.port+" is running!")	
})()
