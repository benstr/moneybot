Meteor.startup(() => {
  // Server startup check if we have instruments
  if (Instruments.find().count() === 0) {
    let httpResult = OANDA.getInstruments()
    if (httpResult && httpResult.data) {
      let instruments = httpResult.data.instruments
      insertInstruments(instruments)
    }
  }
})

// Cron job check if we have all the available instruments and perform an upsert if needed.
SyncedCron.add({
  name: 'Check for new instruments',
  schedule(parser) {
    // parser is a later.parse object
    return parser.text('every 1 day')
  },
  job() {
    let httpResult = OANDA.getInstruments()
    if (httpResult.data) {
      let instruments = httpResult.data.instruments
      if (instruments.length != Instruments.find().count()) {
        console.log("There might be new instruments, performing upsert")
        insertInstruments(instruments)
      }
    }
  }
})

//SyncedCron.start()


// ------------------------
// Shared Functions
// ------------------------

// Save Instruments
let insertInstruments = instruments => {
  console.log("Inserting " + instruments.length + " instruments...")
  instruments.forEach(data => {
    console.log("Inserting pair " + data.instrument + "...")

    let instrument = insertCurrencies(data)

    // OK this instrument should be all set, lets insert it into the DB
    Instruments.update({instrument:instrument.instrument},instrument, {upsert:true})
  })
}

// Save Currencies (split instruments into individual currencies)
let insertCurrencies = inst => {
  // store passed inst object to be modified
  let instrument = inst
  // split instrument pair into an array of each currency
  let currencies = instrument.instrument.split('_')
  let currNum = 0

  // upsert each currency and add their _id to the instrument object
  currencies.forEach(currency => {
    currNum ++
    let currObj = Currencies.upsert({name: currency}, {name: currency})
    if (currNum == 1) {
      instrument.baseCurrencyId = currObj.insertedId ? currObj.insertedId : Currencies.findOne({name: currency })._id
      instrument.baseCurrencyName = currency
    }
    if (currNum == 2) {
      instrument.counterCurrencyId = currObj.insertedId ? currObj.insertedId : Currencies.findOne({name: currency })._id
      instrument.counterCurrencyName = currency
    }
  })

  console.log("Finished currency upserts")
  return instrument
}
