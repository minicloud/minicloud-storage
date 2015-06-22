var logger       = require("./bootstrap").logger;
var config       = require("./bootstrap").config; 
var client       = require("./bootstrap").client; 
var miniTool     = require('mini-tool'); 
var docNodeName  = config.name; 
var hKey         = docNodeName+"_convertList"; 
//捕获系统异常，防止程序异常关闭
process.on('uncaughtException', function(err){
	logger.error({"uncaughtException":err});
});  
//逐一消费redis记录
function worker(err, rep) {
	if(typeof(rep)!="undefined" && rep.length>1){
	    var task = JSON.parse(rep[1]); 
        console.log({"convert task":task});
	    logger.info({"convert task":task});
	    var miniConvert = new miniTool.MiniFileConvert(client,config,logger,task,worker)
	    miniConvert.convert();
	}
}
//redis逐一弹出列表对象
client.brpop(hKey, 0,worker);


