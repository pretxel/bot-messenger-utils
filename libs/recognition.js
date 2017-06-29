'use strict';

var request = require('request');
var Q = require ('q');

var DEFAULT_URL = "https://2xyfwndkil.execute-api.us-east-1.amazonaws.com/dev/imagerecognation";

function Recognition(opts) {

  var _this = this;

  if (!(this instanceof Recognition)) {
    return new Recognition(opts);
  }

  var _config = this.config = Object.freeze(validate(opts)),
    withURL = _config.withURL;


  this.sendRecognition = function(bucket, url){
    var deferred = Q.defer()


    request.get({
      url:url,
      encoding:'binary'
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        var data = new Buffer(body, 'binary').toString('base64');
        var mybody = {
          bucket: bucket,
          image_base64: data
        };

        request.post({
          url: withURL,
          json: true,
          body: mybody
        }, function (error, response, body) {

          if (error)
          {
            deferred.reject(error);
          }else{
            var myOptions = body.labels;
            var labelArray = [];
            var moderationLabels = body.moderation.ModerationLabels;

            console.log(myOptions);
            deferred.resolve(myOptions);
          }


        });


      }


    });


    return deferred.promise
  }

}

var validate = function validate(opts) {
  opts.withURL = opts.withURL || DEFAULT_URL;
  return opts;
};

module.exports = Recognition;