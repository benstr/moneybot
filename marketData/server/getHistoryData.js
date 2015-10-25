// How much should I space out the cron job to update the data?
// 70 pairs multiplied by how many candle types divided (2 per counter divided by 60 counters in a minute)=120 * 3 for buffer
// var timerSpace = 70 * Meteor.settings.public.candleFormats.length / 120 * 3;

Meteor.startup(function () {
  // Server startup check if we have any historic data at startup
  // 15 second delay because we wait for instruments to possibly be inserted
  Meteor.setTimeout(function () {
    if (InstHistory.find().count() === 0) {
      console.log("~~ START SEED MARKET DATA GET ~~");
      var from = moment().subtract(120, "days");
      var utc = from.utc().format("YYYY-MM-DDTHH:mm:ss.000000Z");
      storeHistory(utc);
      console.log("~~ FINISHED SEED DATA GET ~~");
    }
  },15000);
  Meteor.setTimeout(function () {
    seedGrowths();
  },135000);

  // TODO: Server startup check if our data is current and fill in the gaps as needed

});

// Cron job update current candle values every 5 minutes
SyncedCron.add({
  name: 'Check for new history',
  schedule: function (parser) {
    // parser is a later.parse object
    return parser.text('every 12 hours');
  },
  job: function() {
    console.log("~~ START CURRENT MARKET DATA GET ~~");
    storeHistory();
    console.log("~~ FINISHED MARKET DATA GET ~~");
  }
});

SyncedCron.start();


// ------------------------
// Shared Functions
// ------------------------

// Wrapper function to get and store histories
function storeHistory(start) {
  var candleFormats = Meteor.settings.public.candleFormats;
  var instruments = _.map(Instruments.find().fetch(),function(num, key){ return num.instrument; });
  var timer = 0;

  candleFormats.forEach(function (candleFormat) {
    instruments.forEach(function (instrument) {
      start = start || getStartForInstrument(instrument, candleFormat);
      Meteor.setTimeout(function () {
        console.log(`Getting ${instrument} ${candleFormat} candles since ${start}...`);
        var httpResult = getHistory(instrument,candleFormat,start);
        if (httpResult.data) {
          var history = httpResult.data;
          insertHistory(history);
        }
      },timer);
      timer = timer + 500;
    });
  });
}

function getStartForInstrument(instrument, candleFormat) {
  var last = InstHistory.findOne({
    instrumentName: instrument,
    granularity: candleFormat
  }, {
    sort: {
      time:-1
    }
  });
  return last.time;
}

// Get History for a pair and granularity
function getHistory (inst,candleFormat,start) {
  return HTTP.get(OANDA.baseURL + "candles?instrument=" + inst + "&start=" + encodeURIComponent(start) + "&granularity=" + candleFormat + "&dailyAlignment=0&alignmentTimezone=America%2FNew_York", OANDA.header);
}

// Save History
function insertHistory (history) {
  console.log(`Upserting ${history.candles.length} candle(s) for ${history.instrument} ${history.granularity}`);
  var instrument = Instruments.findOne({instrument: history.instrument});
  var currencies = history.instrument.split('_');
  var baseCurrency = Currencies.findOne({name: currencies[0]});
  var counterCurrency = Currencies.findOne({name: currencies[1]});


  history.candles.forEach(function (data) {
    var pair = data;

    pair.openMid = data.openBid + (data.openAsk - data.openBid) / 2;
    pair.closeMid = data.closeBid + (data.closeAsk - data.closeBid) / 2;
    pair.instrumentId = instrument._id;
    pair.instrumentName = history.instrument;
    pair.granularity = history.granularity;

    InstHistory.update({$and:[{time:pair.time},{instrumentId:pair.instrumentId},{granularity:pair.granularity}]},pair, {upsert:true});

    var baseCurr = {
      currencyId: baseCurrency._id,
      currencyName: baseCurrency.name,
      time: data.time,
      granularity: history.granularity,
      instrumentId: instrument._id,
      instrumentName: history.instrument,
      growth: (pair.closeMid - pair.openMid) / pair.openMid * 100
    };

    CurrHistory.update({$and:[{time:baseCurr.time},{instrumentId:baseCurr.instrumentId},{granularity:baseCurr.granularity},{currencyId:baseCurr.currencyId}]},baseCurr, {upsert:true});

    var counterCurr = {
      currencyId: counterCurrency._id,
      currencyName: counterCurrency.name,
      time: data.time,
      granularity: history.granularity,
      instrumentId: instrument._id,
      instrumentName: history.instrument,
      growth: (pair.closeMid - pair.openMid) / pair.openMid * 100 * -1
    };

    CurrHistory.update({$and:[{time:counterCurr.time},{instrumentId:counterCurr.instrumentId},{granularity:counterCurr.granularity},{currencyId:counterCurr.currencyId}]},counterCurr, {upsert:true});
  });
}

// Calc and insert currency growth averages
function seedGrowths () {
  console.log("Seeding Currency Growths");
  if (AvgGrowths.find().count() === 0) {
    var candleFormats = Meteor.settings.public.candleFormats;
    // get an array of currencies
    var currencies = Currencies.find().fetch();

    // calculate the average curr growth on histories
    currencies.forEach(function (currency) {
      candleFormats.forEach(function (candleFormat) {
        // find all histories older than the oldest growth and group them by date
        var currHistories = CurrHistory.find({$and:[{currencyId:currency._id},{granularity:candleFormat}]}).fetch();
        var times = _.uniq(_.pluck(currHistories, 'time'));

        times.forEach(function (time) {
          var currTimeHistories = CurrHistory.find({$and:[{currencyId:currency._id},{granularity:candleFormat},{time:time}]}).fetch();
          var totalGrowth = 0;
          var growths = _.pluck(currTimeHistories,'growth');
          growths.forEach(function (growth) {
            totalGrowth += growth;
          });
          var avgGrowth = {
            currencyId: currency._id,
            currencyName: currency.name,
            time: time,
            granularity: candleFormat,
            growth: totalGrowth/growths.length
          };


          // insert growth records (one per curr)
          AvgGrowths.insert(avgGrowth)
          console.log("Inserted growth for " + currency.name + " for time " + time)
        });
      });
    });
  }
}
