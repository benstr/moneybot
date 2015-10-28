Meteor.publish("currencies", () => {
  return Currencies.find()
})

Meteor.publish('totalCurr', function() {
  Counts.publish(this, 'totalCurr', Currencies.find())
})

Meteor.publish('totalPairs', function() {
  Counts.publish(this, 'totalPairs', Instruments.find())
})

Meteor.publish('totalGrowths', function() {
  Counts.publish(this, 'totalGrowths', AvgGrowths.find())
})

Meteor.publish('totalHist', function() {
  Counts.publish(this, 'totalHist', CurrHistory.find())
})

Meteor.publish('instruments', () => {
  return Instruments.find()
})

Meteor.publish("seriesData", function(limit) {
  let self = this

  getCurrenciesGrowthSeries(limit).map((growth) => {
    self.added("seriesData", growth.name, growth)
    return self.ready()
  })

})

let getCurrenciesGrowthSeries = limit => {
  let series = []
  let currencyNames = getCurrencyNames()

  return getCurrencyNames().map((currencyName) => {
    let accumulativeGrowth = getAccumulativeGrowthForCurrency(currencyName, limit)
    return {
      name: currencyName,
      data: accumulativeGrowth
    }
  })
}

function getCurrencyNames() {
  return _.pluck(Currencies.find().fetch(), "name")
}

let getAccumulativeGrowthForCurrency = (currencyName,limit) => {
  let growthByDate = AvgGrowths.find({currencyName: currencyName}, {
    sort: {time: -1},
    limit: parseInt(limit) || 10000
  }).fetch()

  let growth = _.pluck(growthByDate, "growth")
  growth.reverse()

  let accumulativeGrowth = 0
  growth.forEach((growthPercentage, index) => {
    accumulativeGrowth += growthPercentage
    growth[index] = accumulativeGrowth
  })

  return growth
}
