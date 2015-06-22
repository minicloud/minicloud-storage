var path       = require("path");
var fs         = require("fs");
var miniTool   = require('mini-tool');
var logger     = require("./bootstrap").logger;
var config     = require("./bootstrap").config; 
var client     = require("./bootstrap").client;  
var fork       = require('child_process').fork; 
//捕获系统异常，防止程序异常关闭
process.on('uncaughtException', function(err){
	logger.error({"uncaughtException":err});
});  
//启动子进程，文件冗余备份
process.env.config = config.configPath;
var pids = [process.pid];

var readyChildProcess = function(){
	//启动子进程，进行文档转换
	for(var i=0; i<parseInt(config.worker); i++) {
		var modulePath       = require("path").join(__dirname, 'replicate');
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
	//解析请求
	var requestFunction = function (req, res){ 
		try{
			var miniHttp = new miniTool.MiniHttp(config,req,res,logger); 
			miniHttp.on("request",function(params,files){
				var route = params.route;  
				if(typeof route=="undefined"){
					res.statusCode = 200;
					res.end("miniStore 1.1(2015.05.30),it's ok!")
					return;
				} 
				logger.info({"request":params});
				if(route=="file/sec"){ 
					//文件秒传
					new miniTool.MiniFileSec(miniHttp);
				}else if(route=="file/upload"){ 
					//客户端文件上传
					new miniTool.MiniFileBlockUpload(miniHttp);
				}else if(route=="file/webUpload"){ 
					//网页文件上传
					new miniTool.MiniFileWebUpload(miniHttp);
				}else if(route=="file/download"){ 
					//文件下载
					new miniTool.MiniFileSend(miniHttp);
				}else if(route=="file/replicate"){ 
					//文件冗余备份,接受任务  
					new miniTool.MiniFileReplicateTask(miniHttp,client);
				}else if(route=="store/status"){ 
					//服务器状态
					new miniTool.MiniNodeStatus(miniHttp);
				}else if(route=="store/info"){ 
					//服务器运行情况
					new miniTool.MiniNodeInfo(miniHttp);
				}   
			});
		}catch(error){
            logger.info({"request":params,"error":error});
        }  
	}  
	var server  = require('http').createServer();
	server.on('request',requestFunction);
	//启动web服务器
	server.listen(config.node_port, "127.0.0.1"); 
}();

