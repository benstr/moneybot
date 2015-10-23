// Instruments - Available currency pairs to trade
Instruments = new Mongo.Collection('instruments');

// Currencies - Single currencies to associate child docs to
Currencies = new Mongo.Collection('currencies');

// API Data gathered from Oanda servers with minor alterations
MarketHistory = new Mongo.Collection('marketHistory');

// Single calculated growth of a currency compared to it’s counter-part in a pair
PairCompares = new Mongo.Collection('pairCompares');