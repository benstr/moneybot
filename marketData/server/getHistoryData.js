// How much should I space out the cron job to update the data?
// 70 pairs multiplied by how many candle types divided (2 per counter divided by 60 counters in a minute)=120 * 3 for buffer
// let timerSpace = 70 * Meteor.settings.public.candleFormats.length / 120 * 3

Meteor.startup(() => {
  // Server startup check if we have any historic data at startup
  // 15 second delay because we wait for instruments to possibly be inserted
  Meteor.setTimeout(() => {
    if (InstHistory.find().count() === 0) {
      console.log('~~ START SEED MARKET DATA GET ~~')
      let from = moment().subtract(20, 'days')
      let utc = from.utc().format('YYYY-MM-DDTHH:mm:ss.000000Z')
      storeHistory(utc)
      console.log('~~ FINISHED SEED DATA GET ~~')
    }
  },15000)
})

// Cron job update current candle values every 5 minutes
SyncedCron.add({
  name: 'Check for new history',
  schedule: function (parser) {
    // parser is a later.parse object
    return parser.text('every 12 hours')
  },
  job() {
    console.log('~~ START CURRENT MARKET DATA GET ~~')
    storeHistory()
    console.log('~~ FINISHED MARKET DATA GET ~~')
  }
})

SyncedCron.start()


// ------------------------
// Shared Functions
// ------------------------

// Wrapper function to get and store histories
let storeHistory = start => {
  let candleFormats = Meteor.settings.public.candleFormats
  let instruments = _.map(Instruments.find().fetch(),num => { return num.instrument })
  let timer = 0

  let getHistories = _.throttle((candleFormat, instrument) => {
    start = start || getStartForInstrument(instrument, candleFormat)
    console.log(`Getting ${instrument} ${candleFormat} candles since ${start}...`)
    let httpResult = OANDA.getCandles({
      instrument: instrument,
      granularity: candleFormat,
      start: start,
      end: moment().format('YYYY-MM-DDTHH:mm:ss.000000Z')
    })
    if (httpResult.data) {
      let history = httpResult.data
      insertHistory(history)
    }
  }, 500)

  candleFormats.forEach(candleFormat => {
    instruments.forEach(instrument => {
      getHistories(candleFormat, instrument)
    })
  })
}

let getStartForInstrument = (instrument, candleFormat) => {
  let last = InstHistory.findOne({
    instrumentName: instrument,
    granularity: candleFormat
  }, {
    sort: {
      time:-1
    }
  })
  return last.time
}

// Save History
let insertHistory = history => {
  console.log(`Upserting ${history.candles.length} candle(s) for ${history.instrument} ${history.granularity}`)
  let instrument = Instruments.findOne({instrument: history.instrument})
  let currencies = history.instrument.split('_')
  let baseCurrency = Currencies.findOne({name: currencies[0]})
  let counterCurrency = Currencies.findOne({name: currencies[1]})


  history.candles.forEach(data => {
    let pair = _.extend(data, {
      openMid: data.openBid + (data.openAsk - data.openBid) / 2,
      closeMid: data.closeBid + (data.closeAsk - data.closeBid) / 2,
      instrumentId: instrument._id,
      instrumentName: history.instrument,
      granularity: history.granularity
    })

    InstHistory.update({
      time: pair.time,
      instrumentId: pair.instrumentId,
      granularity: pair.granularity
    }, pair, {upsert:true})

    upsertAvgGrowth(pair, baseCurrency,    (pair.closeMid - pair.openMid) / pair.openMid * 100)
    upsertAvgGrowth(pair, counterCurrency, (pair.closeMid - pair.openMid) / pair.openMid * 100 * -1)
  })
}

let upsertAvgGrowth = (pair, currency, growth) => {
  let avg = AvgGrowths.findOne({
    time: pair.time,
    currencyId: currency._id,
    granularity: pair.granularity
  })

  if (avg) {
    AvgGrowths.update(avg._id, {
      $set: {
        growth: (avg.totalGrowth + growth) / (avg.histories + 1)
      },
      $inc: {
        histories: 1,
        totalGrowth: growth
      }
    })
  } else {
    AvgGrowths.insert({
      time: pair.time,
      granularity: pair.granularity,
      currencyId: currency._id,
      currencyName: currency.name,
      totalGrowth: growth,
      histories: 1,
      growth: growth
    })
  }
}
