
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![devDependency Status](https://david-dm.org/atom/electron/dev-status.svg)](https://david-dm.org/minicloud/minicloud-storage#info=devDependencies)
  

  minicloud-storage v1.0 beta1,Lightweight distributed file storage

## Installation
```
$ git clone http://github.com/minicloud/minicloud-storage
$ cd minicloud-storage
$ npm install
$ npm test

minicloud-storage is supported in all versions of [iojs](https://iojs.org) without any flags.To use minicloud-storage with node, you must be running __node 0.12.0__ or higher for generator and promise support, and must run node(1)
  with the `--harmony-generators` or `--harmony` flag.

## API

[minicloud-storage api](https://minicloud.readme.io/docs) has provided 6 API.

- support hard disk usage statistics

- support large file block upload/simple file upload

- support return thumbnail for an image.include ai,bmp,eps,gif,jpg,jpeg,png,psd,tif,tiff

- support [socket.io](https://socket.io),http api can seamless convert to websocket.[demo>>](https://minicloud.readme.io/docs/how-to-use-websocket)

# License

  MIT

  
[travis-image]: https://img.shields.io/travis/minicloud/minicloud-storage/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/minicloud/minicloud-storage 
[coveralls-image]: https://img.shields.io/coveralls/minicloud/minicloud-storage/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/minicloud/minicloud-storage?branch=master