// Oanda settings
OANDA = {};
OANDA.baseURL = Meteor.settings.OANDA_BASEURL;
OANDA.token = Meteor.settings.OANDA_TOKEN;
OANDA.account = Meteor.settings.OANDA_ACCOUNT;
OANDA.header = {headers: {'Authorization': "Bearer " + OANDA.token}};

OANDA.buildQueryOptions = function(option, value) {
  return option + "=" + encodeURIComponent(value);
};

OANDA.buildQuery = function(options) {
  return Object.keys(options).map(function(option) {
    return OANDA.buildQueryOptions(option, options[option]);
  }).join("&");
};

OANDA.get = function(route, options) {
  var query = OANDA.buildQuery(options);
  console.log("GET: " + route + "?" + query);
  return HTTP.get(OANDA.baseURL + route + "?" + query, OANDA.header);
};

OANDA.getInstruments = function(options) {
  return OANDA.get("instruments", _.extend({
    accountId: OANDA.account
  }, options));
};

OANDA.getCandles = function(options) {
  return OANDA.get("candles", _.extend({
    dailyAlignment: "0",
    alignmentTimezone: "America/New_York",
    includeFirst: "false"
  }, options));
};
