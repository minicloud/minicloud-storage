var path       = require("path"); 
var fs         = require("fs");
var logger     = require("./bootstrap").logger;
var config     = require("./bootstrap").config; 
var client     = require("./bootstrap").client; 
var cp         = require('child_process');   
//启动子进程，把要编制索引的内容形成xml文件
process.env.config = config.configPath;
var pids = [process.pid];
//捕获系统异常，防止程序异常关闭
process.on('uncaughtException', function(err){
    logger.error({"uncaughtException":err});
}); 
//每隔3秒自动执行增量索引
var deltaProcess = function(aimDb){
    var sql = "SELECT count(*) as c \
        FROM documents WHERE id>( SELECT max_doc_id FROM sph_counter WHERE counter_id=1 )";
    
    var run = function(){
        aimDb.driver.execQuery(sql,function(err,data){
            var count = data[0].c;  
            if(count>0){
                logger.info({build:count})
                var command = "/usr/local/miniyun/miniSearch/shell/delta.sh";
                cp.exec(command, function (error, stdout, stderr) {
                    
                });
            }
        })
    }
    setInterval(run,3000);     
};
var createServer = function(DocumentDB){
    //连接sphinx服务器
    var SphinxClient = require ("sphinxapi");
    var sphinxClient = new SphinxClient();
    sphinxClient.SetServer('localhost', 9312);

    var miniTool   = require('mini-tool');
    //解析请求
    var requestFunction = function (req, res){
        try{
            var miniHttp = new miniTool.MiniHttp(config,req,res,logger);
            miniHttp.on("request",function(params,files){
                var route = params.route;
                if(typeof route=="undefined"){
                    res.statusCode = 200;
                    res.end("miniSearch 1.1(2015.05.30),it's ok!")
                    return;
                }
                logger.info({"request":params});
                
                if(route=="file/build"){
                    //文件编译索引,接受任务
                    new miniTool.MiniFileBuildTask(miniHttp,client,config,logger,DocumentDB);
                }if(route=="file/search"){
                    //文件搜索
                    new miniTool.MiniFileSearch(config,miniHttp,sphinxClient);
                }else if(route=="search/status"){
                    //服务器状态
                    new miniTool.MiniNodeStatus(miniHttp);
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
        logger.info({"server":config.node_port,"port":config.node_port});
    });
};
//数据库连接成功后，启动sphinx
var orm        = require("orm");
orm.connect("mysql://"+config.mysql_db_user+":"+config.mysql_db_password+"@127.0.0.1/sphinx", function (err, aimDb) {
    if (err) throw err;   
    var DocumentDB = aimDb.define("documents", {
        site_id : Number, 
        signature : String,         
        content: String
    },{}); 
    //启动sphinx服务
    var sphinxCommand = "/usr/local/bin/searchd -c /usr/local/miniyun/miniSearch/sphinx/sphinx.conf";
    var childProcess = cp.exec(sphinxCommand, function (error, stdout, stderr) {
        //每隔3秒自动执行增量索引
        deltaProcess(aimDb);
    	createServer(DocumentDB);
    });
    pids.push(childProcess.pid); 
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
});




