var path       = require("path");
var fs         = require("fs");
var logger     = require("./bootstrap").logger;
var config     = require("./bootstrap").config; 
var client     = require("./bootstrap").client;
var fork       = require('child_process').fork;

var pids = [process.pid];
//捕获系统异常，防止程序异常关闭
process.on('uncaughtException', function(err){
	logger.error({"uncaughtException":err});
}); 
var readyChildProcess = function(){
    //启动子进程，进行文档转换
    process.env.config = config.configPath;
    for(var i=0; i<parseInt(config.worker); i++) {
        var modulePath = path.join(__dirname, 'convert');
        var childProcess = fork(modulePath);
        pids.push(childProcess.pid);
    }
}();

var readyPids = function(){
	//把子进程id写入pids文件
	var pidsPath   = path.join(config.logs,config.name+"-pids");
	fs.writeFileSync(pidsPath,JSON.stringify(pids));
}();

var readyNginx = function(){
	//把nginx需要的站点配置文件备好
	var params = {
		"nginx_ip":config.nginx_ip,
		"nginx_port":config.nginx_port, 
		"node_port":config.node_port
	};
	var nginxTemplatePath = path.join(__dirname, 'nginx',"nginx-template.conf");
	var nginxPath         = path.join(config.nginx_config_path, config.name+"-nginx.conf");
	var content           = fs.readFileSync(nginxTemplatePath).toString();
	for (var key in params) {
		var value = params[key];
		content = content.replace("@"+key,value);
	}
	fs.writeFileSync(nginxPath,content); 
}();


var createServer = function(){
	var miniTool   = require('mini-tool');
	//解析请求
	var requestFunction = function (req, res){
		try{
			var miniHttp = new miniTool.MiniHttp(config,req,res,logger);
			miniHttp.on("request",function(params,files){
				var route = params.route;
				if(typeof route=="undefined"){
					res.statusCode = 200;
					res.end("miniDoc 1.1(2015.05.30),it's ok!")
					return;
				}
				logger.info({"request":params});
				
				if(route=="file/convert"){
					//文件转换,接受任务
					new miniTool.MiniFileConvertTask(miniHttp,client);
				}else if(route=="doc/status"){
					//服务器状态
					new miniTool.MiniNodeStatus(miniHttp);
				}else if(route=="file/download"){
					//文件下载
					new miniTool.MiniFileSend(miniHttp);
				} 
			});
		}catch(error){
            logger.error({"request":params,"error":error});
        }
	}
	var server  = require('http').createServer();
	server.on('request',requestFunction);
	//启动web服务器
	server.listen(config.node_port, "127.0.0.1",function(){
		logger.info({"server":config.name,"port":config.node_port});
	});
}();

