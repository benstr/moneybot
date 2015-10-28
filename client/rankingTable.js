Template.rankingTable.onCreated(() => {
  let template = Template.instance()
  template.pairPrices = new ReactiveVar({bid:0,ask:0,time:''})
  template.selectedPair = new ReactiveVar('')
  template.subscribe('instruments')
})

Template.rankingTable.helpers({
  latestRankings() {
    let sortObj = getSortObject(this.limit)
    let rankingSeries = SeriesData.find({}, {sort: sortObj})

    if (rankingSeries) {
      return rankingSeries.map((currencySeries) => ({
        currencyName: currencySeries.name,
        latestValue: numeral(currencySeries.data[currencySeries.data.length - 1]).format('0.00') + '%'
      }))
    }
  },

  validPairs() {
    let sortObj = getSortObject(this.limit)
    let rankingSeries = SeriesData.find({}, {sort: sortObj}).fetch()

    if (rankingSeries && rankingSeries.length) {
      let pairs = getPairs(rankingSeries)
      return Instruments.find({instrument: {$in: pairs}})
    }
  },

  isPairSelected(pair) {
    return Template.instance().selectedPair.get() === pair.displayName ? 'selected' : ''
  },

  prices() {
    return Template.instance().pairPrices.get()
  }

})

Template.rankingTable.events({
  'click .valid-pair-item'(e, template) {
    let el = $(e.currentTarget)
    let instrumentId = el.data('instrument')
    let instrument = Instruments.findOne(instrumentId)
    let pairText = instrument.displayName
    let pairArray = [instrument.baseCurrencyName, instrument.counterCurrencyName]
    let theHighchart = $('#container-area').highcharts()

    if (template.selectedPair.get() !== pairText) {
      template.selectedPair.set(pairText)

      theHighchart.series.forEach((series) => {
        if (pairArray.indexOf(series.name) === -1) {
          series.hide()
        } else {
          series.show()

          Meteor.call('getRatesData', instrument.instrument, (err, result) => {
            console.log(result)
            let data = result.data.prices[0]
            template.pairPrices.set({
              bid: data.bid,
              ask: data.ask,
              time: moment(data.time).fromNow()
            })
          })

        }
      })
    } else {
      theHighchart.series.forEach((series) => {
        template.selectedPair.set('')
        series.show()
      })
    }
  }
})

let getSortObject = limit => {
  let sortLimit = limit - 1
  let sortObj = {}
  sortObj['data.' + sortLimit] = -1
  return sortObj
}

let getPairs = rankingSeries => {

  // Get the top three currencies, and bottom three currencies according to the most recent chart data
  let topThree = rankingSeries.slice(0, 3)
  let bottomThree = rankingSeries.slice(-3, rankingSeries.length)

  // Find all possible currency pairs like TOP_BOT
  let pairPairs = topThree.map((topSeries) =>
    bottomThree.map((bottomSeries) =>
      [`${topSeries.name}_${bottomSeries.name}`, `${bottomSeries.name}_${topSeries.name}`]
    )
  )

  // Flatten the array and return it to the template
  return _.flatten(pairPairs, true)
}
