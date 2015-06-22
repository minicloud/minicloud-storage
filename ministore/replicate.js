var logger         = require("./bootstrap").logger;
var config         = require("./bootstrap").config; 
var client         = require("./bootstrap").client; 
var miniTool       = require('mini-tool'); 
var storeNodeName  = config.name; 
var hKey           = storeNodeName+"_replicateList";  
//捕获系统异常，防止程序异常关闭
process.on('uncaughtException', function(err){
	logger.error({"uncaughtException":err});
});  
//逐一消费redis记录
function worker(err, rep) {   
	if(rep!=null){
		var task = JSON.parse(rep);
	    logger.info({"replicate task":task});
	    var miniReplicate = new miniTool.MiniFileReplicate(client,config,logger,task,worker)
	    miniReplicate.run();
	}
}
//redis逐一弹出列表对象
client.rpop(hKey,  worker);