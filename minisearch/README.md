#迷你搜索
-使用spinx把文本内容编制索引
-提供接口供迷你云搜索

**目录**

[TOC] 

# 安装
##node(Centos 6.5 64Bit )

	curl -sL https://rpm.nodesource.com/setup | bash -
	yum install -y nodejs

##nginx(Centos 6.5 64Bit )

	rm -rf /etc/yum.repos.d/nginx.repo
	echo "[nginx]" >> /etc/yum.repos.d/nginx.repo
	echo "name=nginx repo"  >> /etc/yum.repos.d/nginx.repo
	echo "baseurl=http://nginx.org/packages/centos/\$releasever/\$basearch/" >> /etc/yum.repos.d/nginx.repo
	echo "gpgcheck=0" >> /etc/yum.repos.d/nginx.repo
	echo "enabled=1" >> /etc/yum.repos.d/nginx.repo
	yum install -y nginx

##redis(Centos 6.5 64Bit) 

	rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
	rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
	yum install redis -y

##npm

npm install mkdirp
npm install formidable@latest
npm install hiredis redis
npm install winston
npm install xmldom
npm install crc
npm install sphinxapi

#配置文件

	{
		"name":"search-node1",                           #迷你搜索节点名称，在OS下如有多个搜索节点，name要唯一
		"logs":"/Users/jim/code/miniSearch/logs",
		#日志文件存储目录路径
		"safe_code":"uBEEAcKM2D7sxpJD7QQEapsxiCmzPCyS", #迷你搜索节点安全码，用于访问请求签名
		"port":8071,                                    #node开放的端口，该端口只与Nginx关联，无需对其它IP开放此端口
		"path":"/Users/jim/code/miniSearch/cache",                                       #迷你搜索中间介质存储目录 
	}
#启动迷你搜索

## 启动Node

	node /usr/local/miniyun/miniSearch/task.js --config=/usr/local/miniyun/miniSearch/config1.json

##启动Nginx

	service nginx restart

##启动Redis

	service redis restart

#其它说明

##修改防火墙

	iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
	service iptables save
	service iptables restart