Meteor.methods({
  "getSeriesData": function() {
    var series = getCurrenciesGrowthSeries();
    console.log("Series: ", series)
    return series
  }
})

function getCurrenciesGrowthSeries() {
  var series = [];
  var currencyNames = getCurrencyNames();
  console.log(currencyNames)
  currencyNames.forEach(function(currencyName) {
    var accumulativeGrowth = getAccumulativeGrowthForCurrency(currencyName)

    series.push({
      name: currencyName,
      data: accumulativeGrowth
    });
  });

  return series
}

function getCurrencyNames() {
  var names = [];

  var currencies = Currencies.find().fetch();

  console.log("Currencies: ", currencies)

  currencies.forEach(function(currency) {
    names.push(currency.name)
  })

  return names;
}

function getAccumulativeGrowthForCurrency(currencyName) {
  var growth = [];
  var growthByDate = AvgGrowths.find({currencyName: currencyName}, {
    sort: {
      time: 1
    }
  }).fetch()


  growthByDate.forEach(function(currency) {
    growth.push(currency.growth)
  })

  var accumulativeGrowth = 0;
  growth.forEach(function(growthPercentage, index) {
    accumulativeGrowth += growthPercentage
    growth[index] = accumulativeGrowth
  })

  return growth
}