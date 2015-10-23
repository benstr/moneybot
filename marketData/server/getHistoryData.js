var timerSpace = Meteor.settings.public.candleFormats.length * 250;

Meteor.startup(function () {
  // Server startup check if we have any historic data at startup
  // 15 second delay because we want to wait for instruments to possibly be inserted
  Meteor.setTimeout(function () {
    if (MarketHistory.find().count() === 0) {
      var candleFormats = Meteor.settings.public.candleFormats;
      var instruments = _.map(Instruments.find().fetch(),function(num, key){ return num.instrument; });
      var timer = 0;

      candleFormats.forEach(function (candleFormat) {
        instruments.forEach(function (instrument) {
          Meteor.setTimeout(function () {
            var httpResult = getHistory(instrument,candleFormat,50);
            console.log(instrument,candleFormat,httpResult);
            if (httpResult.data) {
              var history = httpResult.data;
              insertHistory(history);
            }
          },timer);
          timer = timer + timerSpace;
        });
      });
    }
  },15000);

  // TODO: Server startup check if our data is current and fill in the gaps as needed

});

// Cron job update current candle values every 5 minutes
SyncedCron.add({
  name: 'Check for new history',
  schedule: function (parser) {
    // parser is a later.parse object
    return parser.text('every 5 minutes');
  },
  job: function() {
    console.log("~~ START CURRENT MARKET DATA GET ~~");
    var candleFormats = Meteor.settings.public.candleFormats;
    var instruments = _.map(Instruments.find().fetch(),function(num, key){ return num.instrument; });
    var timer = 0;

    candleFormats.forEach(function (candleFormat) {
      instruments.forEach(function (instrument) {
        Meteor.setTimeout(function () {
          console.log("Getting " + instrument + " " + candleFormat + " candle...");
          var httpResult = getHistory(instrument,candleFormat,1);
          if (httpResult.data) {
            var history = httpResult.data;
            insertHistory(history);
          }
        },timer);
        timer = timer + timerSpace;
      });
    });
    console.log("~~ FINISHED MARKET DATA GET ~~");
  }
});

SyncedCron.start();


// ------------------------
// Shared Functions
// ------------------------

// Get history for a
function getHistory (inst,candleFormat,qty) {
  return HTTP.get(OANDA.baseURL + "candles?instrument=" + inst + "&count=" + qty + "&granularity=" + candleFormat + "&dailyAlignment=0&alignmentTimezone=America%2FNew_York", OANDA.header);
}

// Save Instruments
function insertHistory (history) {
  console.log("Upserting history for " + history.instrument + " " + history.granularity);
  var instrument = Instruments.findOne({instrument: history.instrument});
  var currencies = history.instrument.split('_');
  var firstCurrency = Currencies.findOne({name: currencies[0]});
  var secondCurrency = Currencies.findOne({name: currencies[1]});
  history.candles.forEach(function (data) {
    var candle = data;
    candle.instrumentId = instrument._id;
    candle.instrumentName = history.instrument;
    candle.firstCurrencyId = firstCurrency._id;
    candle.firstCurrencyName = firstCurrency.name;
    candle.secondCurrencyId = secondCurrency._id;
    candle.secondCurrencyName = secondCurrency.name;
    candle.granularity = history.granularity;
    MarketHistory.update({$and:[{time:candle.time},{instrumentId:candle.instrumentId},{granularity:candle.granularity}]},candle, {upsert:true});
  });
}