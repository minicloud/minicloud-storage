var config     = require("/usr/local/miniyun/miniDoc/bootstrap").config;  
var fs         = require("fs"); 
var pidsPath   = config.logs+"/"+config.name+"-pids";
if(fs.existsSync(pidsPath)){
    var pids = JSON.parse(fs.readFileSync(pidsPath).toString());
    var command = "";
    for(var i=0;i<pids.length;i++){
    	var pid = pids[i];
    	command += "kill -9 "+pid+"& ";
    }
    require('child_process').exec(command,function(){
    	process.exit(0);
    });
}
