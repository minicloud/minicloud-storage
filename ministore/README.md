'Centos 6.5 64Bit 安装node

curl -sL https://rpm.nodesource.com/setup | bash -
yum install -y nodejs

'Centos 6.5 64Bit 安装nginx

rm -rf /etc/yum.repos.d/nginx.repo
echo "[nginx]" >> /etc/yum.repos.d/nginx.repo
echo "name=nginx repo"  >> /etc/yum.repos.d/nginx.repo
echo "baseurl=http://nginx.org/packages/centos/\$releasever/\$basearch/" >> /etc/yum.repos.d/nginx.repo
echo "gpgcheck=0" >> /etc/yum.repos.d/nginx.repo
echo "enabled=1" >> /etc/yum.repos.d/nginx.repo
yum install -y nginx

'Centos 6.5 64Bit 安装redis

rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
yum install redis -y

'node包依赖

npm install mkdirp
npm install formidable@latest
npm install hiredis redis
npm install winston

'配置文件说明config.json
{
	"name":"store-node1",                           #迷你存储节点名称，在OS下如有多个存储节点，name要唯一
	"logs":"/Users/jim/code/miniStore/logs",
	#日志文件存储目录路径
	"safe_code":"uBEEAcKM2D7sxpJD7QQEapsxiCmzPCyS", #迷你存储节点安全码，用于访问请求签名
	"port":8081,                                    #node开放的端口，该端口只与Nginx关联，无需对其它IP开放此端口
	"path":[                                        #可用存储路径，迷你存储随机选择一个目录存放文件
		"/Users/jim/code/miniStore/s1/a",
		"/Users/jim/code/miniStore/s1/b",
		"/Users/jim/code/miniStore/s1/c"
	]
}
'启动迷你存储(安装位置：/usr/local/miniyun/miniStore)，其它位置修改相关内容即可

node /usr/local/miniyun/miniStore/main.js --config=/usr/local/miniyun/miniStore/config1.json

'启动Nginx

service nginx restart

'启动Redis

service redis restart

'修改防火墙

iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
service iptables save
service iptables restart