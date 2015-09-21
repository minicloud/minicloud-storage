
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![devDependency Status](https://david-dm.org/atom/electron/dev-status.svg)](https://david-dm.org/minicloud/minicloud-storage#info=devDependencies)
  

  minicloud-storage v0.5.5,Lightweight distributed file storage.

  It is a minicloud file storage module.it can be deployed separately.

## Installation

```
$ npm install minicloud-storage co

```

## Create file index.js
```
require('co').wrap(function*(){
	var app = yield require('minicloud-storage')()
	app.listen(8031)
})()

```
## Run Server(node>0.12.0)
```
$ node --harmony index.js
or
$ iojs index.js
```
## Test case
```

//get current storage node disk space
//time is current timestamp,can not exceed 24 hours diff with current time.
//signature=md5(session_id+time+safe_code)
curl -X POST http://127.0.0.1:8031/api/v1/status/info \
    --header "Content-Type: application/json" \
    --data "{\"session_id\":\"xxxxx\",\"signature\":\"xxxx\",\"time\":1278927966}" 

//If successful, there will be the following information output
[
  {
    path: '/dev/mapper/VolGroup-lv_home',
    used: 11636604,(unit:kb)
    total: 2060025240(unit:kb) 
	}
]
```
minicloud-storage is supported in all versions of [iojs](https://iojs.org) without any flags.To use minicloud-storage with node, you must be running __node 0.12.0__ or higher for generator and promise support, and must run node(1)
  with the `--harmony-generators` or `--harmony` flag.

## API

[minicloud-storage api](https://minicloud.readme.io/docs) has provided 6 API.

- support hard disk usage statistics

- support large file block upload/simple file upload

- support file content download

- support return thumbnail for an image.include ai,bmp,eps,gif,jpg,jpeg,png,psd,tif,tiff

- support [socket.io](https://socket.io),http api can seamless convert to websocket.[demo>>](https://minicloud.readme.io/docs/how-to-use-websocket)

# License

  MIT

  
[travis-image]: https://img.shields.io/travis/minicloud/minicloud-storage/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/minicloud/minicloud-storage 
[coveralls-image]: https://img.shields.io/coveralls/minicloud/minicloud-storage/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/minicloud/minicloud-storage?branch=master