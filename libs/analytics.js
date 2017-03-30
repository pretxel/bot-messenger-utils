'use strict';

var request = require('request');

var DEFAULT_URL = "https://graph.facebook.com/";
var DEFAULT_SUFFIX = "messenger_bot_";

function Analytics(opts){

  var _this = this;

  if (!(this instanceof Analytics)) {
    return new Analytics(opts);
  }

  var _config = this.config = Object.freeze(validate(opts)),
        accessToken = _config.accessToken,
        appId = _config.appId,
        logRepository = _config.logRepository,
        suffix = _config.suffix,
        withURL = _config.withURL;

  this.logEvent = function(senderId, eventName, eventValue)
  {
    var eventNameFull = suffix + eventName;
    var date = new Date();

    var log_event = {
      event: 'CUSTOM_APP_EVENTS',
      advertiser_tracking_enabled: 1,
      application_tracking_enabled: 1,
      extinfo: JSON.stringify(['mb1']),
      page_id: appId,
      page_scoped_user_id: senderId,
      custom_events: JSON.stringify([{
        _eventName: eventNameFull,
        _value: 1,
        fb_success: 1,
        _logTime: date.getTime(),
        fb_description: eventValue
      }])
    }

    request.post({
      url : withURL+appId+"/activities?access_token="+accessToken,
      form: log_event
    }, function(err,httpResponse,body){
      if (err != null)
      {
        //winston.log('error', err);
      }else {
        //winston.log('debug','Send event: ' + event_name + ' senderID: ' + senderID);
      }

    });

    logRepository.saveActivity(eventName, eventValue, senderId);
  }

}

var validate = function validate(opts) {
  if (!opts.appId || !opts.accessToken) {
    throw new Error('Could not find access token or app ID');
  }

  if (!opts.logRepository){
    throw new Error('Could not find log Repository');
  }

  opts.withURL = opts.withURL || DEFAULT_URL;
  opts.suffix = opts.suffix || DEFAULT_SUFFIX;
  return opts;
};

module.exports = Analytics;
