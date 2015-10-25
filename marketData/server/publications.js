Meteor.publish("currencies", function() {
  return Currencies.find();
});

Meteor.publish('totalCurr', function() {
  Counts.publish(this, 'totalCurr', Currencies.find());
});

Meteor.publish('totalPairs', function() {
  Counts.publish(this, 'totalPairs', Instruments.find());
});

Meteor.publish('totalGrowths', function() {
  Counts.publish(this, 'totalGrowths', AvgGrowths.find());
});

Meteor.publish('totalHist', function() {
  Counts.publish(this, 'totalHist', CurrHistory.find());
});

Meteor.publish("seriesData", function(limit) {
  var publication = this;
  this.autorun(function() {
    getCurrenciesGrowthSeries(limit).map(function(growth) {
      publication.added("seriesData", growth.name, growth);
    });
  });
});

function getCurrenciesGrowthSeries(limit) {
  var series = [];
  var currencyNames = getCurrencyNames();

  return getCurrencyNames().map(function(currencyName) {
    var accumulativeGrowth = getAccumulativeGrowthForCurrency(currencyName, limit);
    return {
      name: currencyName,
      data: accumulativeGrowth
    };
  });
}

function getCurrencyNames() {
  return _.pluck(Currencies.find().fetch(), "name");
}

function getAccumulativeGrowthForCurrency(currencyName,limit) {
  var growth = [];
  var growthByDate = AvgGrowths.find({currencyName: currencyName}, {
    sort: {time: 1},
    limit: parseInt(limit) || 10000
  }).fetch();


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