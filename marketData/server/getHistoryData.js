// How much should I space out the cron job to update the data?
// 70 pairs multiplied by how many candle types divided (2 per counter divided by 60 counters in a minute)=120 * 3 for buffer
// var timerSpace = 70 * Meteor.settings.public.candleFormats.length / 120 * 3;

Meteor.startup(function () {
  // Server startup check if we have any historic data at startup
  // 15 second delay because we wait for instruments to possibly be inserted
  Meteor.setTimeout(function () {
    if (InstHistory.find().count() === 0) {
      console.log("~~ START SEED MARKET DATA GET ~~");
      var from = moment().subtract(52, "weeks");
      var utc = from.utc().format("YYYY-MM-DDTHH:mm:ss.000000Z");
      storeHistory(utc);
      console.log("~~ FINISHED SEED DATA GET ~~");
    }
  },15000);
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

  var getHistories = function (candleFormat, instrument) {
    start = start || getStartForInstrument(instrument, candleFormat);
    console.log(`Getting ${instrument} ${candleFormat} candles since ${start}...`);
    var httpResult = OANDA.getCandles({
      instrument: instrument,
      granularity: candleFormat,
      start: start,
      end: moment().format("YYYY-MM-DDTHH:mm:ss.000000Z")
    });
    if (httpResult && httpResult.data) {
      var history = httpResult.data;
      insertHistory(history);
    }
  };

  candleFormats.forEach(function (candleFormat) {
    instruments.forEach(function (instrument) {
      getHistories(candleFormat, instrument);
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

// Save History
function insertHistory (history) {
  console.log(`Upserting ${history.candles.length} candle(s) for ${history.instrument} ${history.granularity}`);
  var instrument = Instruments.findOne({instrument: history.instrument});
  var currencies = history.instrument.split('_');
  var baseCurrency = Currencies.findOne({name: currencies[0]});
  var counterCurrency = Currencies.findOne({name: currencies[1]});


  history.candles.forEach(function (data) {
    var pair = _.extend(data, {
      openMid: data.openBid + (data.openAsk - data.openBid) / 2,
      closeMid: data.closeBid + (data.closeAsk - data.closeBid) / 2,
      instrumentId: instrument._id,
      instrumentName: history.instrument,
      granularity: history.granularity
    });

    InstHistory.update({
      time: pair.time,
      instrumentId: pair.instrumentId,
      granularity: pair.granularity
    }, pair, {upsert:true});

    upsertAvgGrowth(pair, baseCurrency,    (pair.closeMid - pair.openMid) / pair.openMid * 100);
    upsertAvgGrowth(pair, counterCurrency, (pair.closeMid - pair.openMid) / pair.openMid * 100 * -1);
  });
}

function upsertAvgGrowth(pair, currency, growth) {
  var avg = AvgGrowths.findOne({
    time: pair.time,
    currencyId: currency._id,
    granularity: pair.granularity
  });

  if (avg) {
    AvgGrowths.update(avg._id, {
      $set: {
        growth: (avg.totalGrowth + growth) / (avg.histories + 1)
      },
      $inc: {
        histories: 1,
        totalGrowth: growth
      }
    });
  }
  else {
    AvgGrowths.insert({
      time: pair.time,
      granularity: pair.granularity,
      currencyId: currency._id,
      currencyName: currency.name,
      totalGrowth: growth,
      histories: 1,
      growth: growth
    });
  }
}
