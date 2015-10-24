// Instruments - Available currency pairs to trade
Instruments = new Mongo.Collection('instruments');

// Currencies - Single currencies to associate child docs to
Currencies = new Mongo.Collection('currencies');

// API Data gathered from Oanda servers with minor alterations
InstHistory = new Mongo.Collection('pairHistory');
CurrHistory = new Mongo.Collection('currHistory');

// Collection saves calculated growth docs for currencies
AvgGrowths = new Mongo.Collection('avgGrowths');
/*
{
  _id: "",
  origin: "currency" || "pair" (currency = a cumulative total of pair growths for that moment, pair = just pair growth of a moment)
  growth: -00000 (no float number, this number is multiplied by 10,000 to -00100 = -0.0100 = -1.0% )
  date: new Date() (date of close for that bar)
  marketHistoryId:
  marketHistoryGranularity: (pulled from the related market history id)
  currencyId:
}
 */