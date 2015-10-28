// Oanda settings
OANDA = {}
OANDA.baseURL = Meteor.settings.OANDA_BASEURL
OANDA.token = Meteor.settings.OANDA_TOKEN
OANDA.account = Meteor.settings.OANDA_ACCOUNT
OANDA.header = {headers: {'Authorization': "Bearer " + OANDA.token}}

OANDA.buildQueryOptions = (option, value) => {
  return option + "=" + encodeURIComponent(value)
}

OANDA.buildQuery = options => {
  return Object.keys(options).map(function(option) {
    return OANDA.buildQueryOptions(option, options[option])
  }).join("&")
}

OANDA.get = (route, options) => {
  let query = OANDA.buildQuery(options)
  console.log("GET: " + route + "?" + query)
  return HTTP.get(OANDA.baseURL + route + "?" + query, OANDA.header)
}

OANDA.getInstruments = options => {
  return OANDA.get("instruments", _.extend({
    accountId: OANDA.account
  }, options))
}

OANDA.getCandles = options => {
  return OANDA.get("candles", _.extend({
    dailyAlignment: "0",
    alignmentTimezone: "America/New_York",
    includeFirst: "false"
  }, options))
}
