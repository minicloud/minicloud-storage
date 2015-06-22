#迷你文档
-使用openOffice把doc/docx转换为PDF
-把PDF提取第一页为图片
-把PDF提取文本内容

**目录**

[TOC]
# 安装openOffice
	yum install -y libreoffice-headless libreoffice-writer libreoffice-impress libreoffice-calc libreoffice-langpack-zh-Hans
	yum install -y poppler-utils ghostscript
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

#配置文件

	{
		"name":"doc-node1",                           #迷你文档节点名称，在OS下如有多个搜索文档，name要唯一
		"logs":"/Users/jim/code/miniDoc/logs",
		#日志文件存储目录路径
		"safe_code":"uBEEAcKM2D7sxpJD7QQEapsxiCmzPCyS", #迷你文档节点安全码，用于访问请求签名
		"port":8061,                                    #node开放的端口，该端口只与Nginx关联，无需对其它IP开放此端口
		"path":"/Users/jim/code/miniDoc/data",                                       #迷你文档成品存储目录 
	}
#启动迷你文档

## 启动Node

	node /usr/local/miniyun/miniDoc/main.js --config=/usr/local/miniyun/miniDoc/config1.json

##启动Nginx

	service nginx restart

##启动Redis

	service redis restart

#其它说明

##修改防火墙

	iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
	service iptables save
	service iptables restart