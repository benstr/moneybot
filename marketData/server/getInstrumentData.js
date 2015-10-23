Meteor.startup(function () {
  // Server startup check if we have instruments
  if (Instruments.find().count() === 0) {
    var httpResult = getInstruments();
    if (httpResult.data) {
      var instruments = httpResult.data.instruments;
      insertInstruments(instruments);
    }
  }
});

// Cron job check if we have all the available instruments and perform an upsert if needed.
SyncedCron.add({
  name: 'Check for new instruments',
  schedule: function (parser) {
    // parser is a later.parse object
    return parser.text('every 1 day');
  },
  job: function() {
    var httpResult = getInstruments();
    if (httpResult.data) {
      var instruments = httpResult.data.instruments;
      if (instruments.length != Instruments.find().count()) {
        console.log("There might be new instruments, performing upsert");
        insertInstruments(instruments);
      }
    }
  }
});

SyncedCron.start();


// ------------------------
// Shared Functions
// ------------------------

// Get all the instruments allowed for your account to use
function getInstruments () {
  console.log("Getting instruments...");
  return HTTP.get(OANDA.baseURL + "instruments?accountId=" + OANDA.account, OANDA.header);
}

// Save Instruments
function insertInstruments (instruments) {
  console.log("Inserting " + instruments.length + " instruments...");
  instruments.forEach(function (data) {
    console.log("Inserting pair " + data.instrument + "...");

    var instrument = insertCurrencies(data);

    // OK this instrument should be all set, lets insert it into the DB
    Instruments.update({instrument:instrument.instrument},instrument, {upsert:true});
  });
}

// Save Currencies (split instruments into individual currencies)
function insertCurrencies (inst) {
  // store passed inst object to be modified
  var instrument = inst;
  // split instrument pair into an array of each currency
  var currencies = instrument.instrument.split('_');
  var currNum = 0;

  // upsert each currency and add their _id to the instrument object
  currencies.forEach(function (currency) {
    currNum ++;
    var currObj = Currencies.upsert({name: currency}, {name: currency});
    if (currNum == 1) {
      instrument.firstCurrencyId = currObj.insertedId ? currObj.insertedId : Currencies.findOne({name: currency })._id;
      instrument.firstCurrencyName = currency;
    }
    if (currNum == 2) {
      instrument.secondCurrencyId = currObj.insertedId ? currObj.insertedId : Currencies.findOne({name: currency })._id;
      instrument.secondCurrencyName = currency;
    }
  });

  console.log("Finished currency upserts");
  return instrument;
}