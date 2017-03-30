'use strict';
var curl = require('curlrequest');
var Q = require ('q');

var DEFAULT_URL = "https://graph.facebook.com/v2.8/";

function UserProfile(opts)
{

  var _this = this;

  if (!(this instanceof UserProfile)) {
    return new UserProfile(opts);
  }

  var _config = this.config = Object.freeze(validate(opts)),
  pageAccessToken = _config.pageAccessToken,
  withURL = _config.withURL;

  this.getUserProfile = function (senderId){

    let deferred = Q.defer()
    let options = {
      url: withURL+senderId+'?access_token='+pageAccessToken
    };

    curl.request(options, (err, data) => {

      return deferred.resolve(JSON.parse(data));
    });

    return deferred.promise
  };


}


var validate = function validate(opts) {
  if (!opts.pageAccessToken) {
    throw new Error('Could not find access token or app ID');
  }

  opts.withURL = opts.withURL || DEFAULT_URL;
  return opts;
};



module.exports = UserProfile;
