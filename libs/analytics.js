'use strict';

var request = require('request');
var Q = require ('q');
var FB = require('fb');

var DEFAULT_URL = "https://graph.facebook.com/";
var DEFAULT_SUFFIX = "messenger_bot_";
var DEFAULT_LOG = "";

function Analytics(opts) {

    var _this = this;

    if (!(this instanceof Analytics)) {
        return new Analytics(opts);
    }

    var _config = this.config = Object.freeze(validate(opts)),
        pageAccessToken = _config.pageAccessToken,
        appId = _config.appId,
        pageId = _config.pageId,
        logRepository = _config.logRepository,
        suffix = _config.suffix,
        withURL = _config.withURL;

    this.logEvent = function (senderId, eventName, eventValue) {
        var deferred = Q.defer()
        var eventNameFull = suffix + eventName;
        var date = new Date();

        var log_event = {
            access_token: pageAccessToken,
            event: 'CUSTOM_APP_EVENTS',
            advertiser_tracking_enabled: 0,
            application_tracking_enabled: 0,
            extinfo: JSON.stringify(['mb1']),
            page_id: pageId,
            page_scoped_user_id: pageId,
            custom_events: JSON.stringify([{
                _eventName: eventNameFull,
                _valueToSum: 1,
                _logTime: date.getTime()
      }])
        }

        FB.api(
            '/' + appId + '/activities',
            'POST',
            log_event,
            function (response) {
                var resp = {
                    txt: "Send event: " + eventName + " senderID: " + senderId,
                    obj: response
                };
                deferred.resolve(resp);
            }
        );

        if (logRepository != "") {
            logRepository.saveActivity(eventName, eventValue, senderId);
        }

        return deferred.promise

    }

}

var validate = function validate(opts) {
    if (!opts.appId || !opts.pageAccessToken || !opts.pageId) {
        throw new Error('Could not find access token or app ID');
    }

    opts.logRepository = opts.logRepository || DEFAULT_LOG;
    opts.withURL = opts.withURL || DEFAULT_URL;
    opts.suffix = opts.suffix || DEFAULT_SUFFIX;
    return opts;
};

module.exports = Analytics;