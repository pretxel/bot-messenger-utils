'use strict';

var AWS = require ('aws-sdk');
var Q = require ('q');
var request = require ('request');
var fs = require ('fs');
var crypto = require ('crypto');
var path = require('path');

var DEFAULT_API = "2006-03-01";

function S3(opts){

  var _this = this;

  if (!(this instanceof S3)) {
    return new S3(opts);
  }

  var _config = this.config = Object.freeze(validate(opts)),
  accessKeyId = _config.accessKeyId,
  secretAccessKey = _config.secretAccessKey,
  region = _config.region,
  apiVersion = _config.apiVersion,
  dirname = _config.dirname;

  var s3AWS = new AWS.S3({
    apiVersion: apiVersion,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
  });

  this.putObject = function(bucket, key , data){
    let deferred = Q.defer()

    let params = {
      Bucket: bucket,
      Key: key,
      Body: data
    }

    s3AWS.putObject(params, function (err, data) {
      if (err)
      {
        console.log(err)
        deferred.reject(err);
      }
      else
      {
        let url = 'https://'+ params.Bucket +'.s3.amazonaws.com/' +  params.Key;
        console.log("Successfully uploaded data to " + params.Bucket + "/" + params.Key);
        deferred.resolve(url);
      }

    });

    return deferred.promise
  }


  this.getBuffer = function(url, fileHash, type)
  {
    let deferred = Q.defer()
    let extension = "";
    if (type === "video"){
      extension = "mp4";
    }else{
      extension = "jpg";
    }

    let filePath = path.join(dirname, "../tmp/", fileHash+'.' + extension);

    request(url).pipe(fs.createWriteStream(filePath)).on('close', function(){

      fs.readFile(filePath, function(err,data){
        if (!err){
          deferred.resolve(data);
        }else{
          deferred.reject(err);
        }

      });

    });
    return deferred.promise
  }

  this.upload = function (url, folder, fileHash , type , bucket) {
    let deferred = Q.defer()
    if (typeof url  == 'string' && typeof type  == 'string' )
    {
      let extension = "";
      if (type === "video"){
        extension = "mp4";
      }else{
        extension = "jpg";
      }
      this.getBuffer(url, fileHash, type).then(data => {
        let fileName = (folder != '') ?  folder + '/' + fileHash+'.' + extension :  fileHash+'.' + extension;
        this.putObject(bucket, fileName, data).then(resp => {
          deferred.resolve(resp);
        });
      });
    }
    return deferred.promise
  }


}



var validate = function validate(opts) {
  if (!opts.accessKeyId || !opts.secretAccessKey) {
    throw new Error('Could not find access key id or secret access key');
  }

  if (!opts.region){
    throw new Error('Could not find Region');
  }

  opts.apiVersion = opts.apiVersion || DEFAULT_API;
  return opts;
};


module.exports = S3;
