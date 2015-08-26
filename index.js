/**
 * Module dependencies.
 */
var co = require('co')
var appConfig = require("./config.json") 
//start app
var config = appConfig['production'] 
co.wrap(function*(){
	var app = yield require("./lib/loader/app-loader")(config)	
	app.listen(config.port)
	console.log(config.port+" is running!")	
})()
