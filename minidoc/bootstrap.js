var miniTool   = require('mini-tool');
//获得配置信息
var appConfig  = function(){
    //优先从进程变量获得配置文件路径
    var configPath = process.env.config;
    if(typeof(configPath)=="undefined"){
        var appArgv    = new miniTool.MiniArgvs();
        configPath = appArgv.get("config");
    }
    var config        = require(configPath);
    config.configPath = configPath;
    //默认子任务数是当前计算器的CPU数目
    var worker        = config.worker;
    if(typeof(worker)=="undefined"){
        worker = require('os').cpus().length;
        config.worker = worker;
    }
    return config;
}();
var logger = function(config){
    //初始化loger对象
    var logsFolderPath = config.logs;
    var fs             = require("fs");
    if(!fs.existsSync(logsFolderPath)){
        var mkdirp = require('mkdirp');
        mkdirp.sync(logsFolderPath);
    }
    //日志目录占用空间最多500M，分为100个文件
    var winston = require('winston');
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                name: 'info-file',
                filename: logsFolderPath+'/'+config.name+'-info.log',
                maxsize:5242880,
                maxFiles:100,
                level: 'info'
            }),
            new (winston.transports.File)({
                name: 'error-file',
                handleExceptions: true,
                filename: logsFolderPath+'/'+config.name+'-error.log',
                maxsize:5242880,
                maxFiles:100,
                level: 'error'
            })
        ]
    });
    return logger;
}(appConfig);

//初始化redis对象
var redisClient = function(){
    var redis   = require("redis");
    var redisClient = redis.createClient();
    return redisClient;
}();

module.exports.logger = logger;
module.exports.config = appConfig;
module.exports.client = redisClient; 
