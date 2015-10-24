Template.body.onRendered( function () {
  Meteor.call("getSeriesData", function(error, series) {
    console.log(error, series)
    builtArea(series);
  })
});

Template.body.helpers({
  totalCurr: function () {
    return Currencies.find().count();
  },
  totalPairs: function () {
    return Instruments.find().count();
  },
  totalGrowths: function () {
    return AvgGrowths.find().count();
  },
  totalHist: function () {
    return CurrHistory.find().count();
  }
});

Template.body.events = {
  'change #reactive': function (event, template) {
    var newValue = $(event.target).val();
    Meteor.call("getSeriesData", newValue, function (error, series) {
      console.log(error, series)
      builtArea(series);
    })
  }
}

// Function to draw the area chart

function builtArea(series) {
  $('#container-area').highcharts({
    chart: {
      type: 'area',
      zoomType: 'x'
    },
    title: {text: 'Currency Growth'},
    credits: {enabled: false},
    subtitle: {enabled: false},
    xAxis: {
      allowDecimals: false,
      labels: {
        formatter: function () {
          return this.value; // clean, unformatted number for year
        }
      }
    },

    yAxis: {
      title: {
        text: 'Percent Growth'
      },
      labels: {
        formatter: function () {
          return this.value + '%';
        }
      }
    },

    tooltip: {
      //pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
    },

    plotOptions: {
      area: {
        pointStart: 0,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
              enabled: true
            }
          }
        }
      }
    },

    series: series
    // [{
    //   name: 'John',
    //   data: [5, 3, 4, 7, 2]
    // }, {
    //   name: 'Jane',
    //   data: [2, -2, -3, 2, 1]
    // }, {
    //   name: 'Joe',
    //   data: [3, 4, 4, -2, 5]
    // }]
  });
}

function getCurrenciesGrowthSeries() {
  var series = [];
  var currencyNames = getCurrencyNames();
  console.log(currencyNames)
  currencyNames.forEach(function(currencyName) {
    var accumulativeGrowth = getAccumulativeGrowthForCurrency(currencyName)

    series.push({
      name: currencyName,
      data: []
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
  console.log(currencyName)
  var growthByDate = AvgGrowths.findOne({currencyName: currencyName})

  console.log("Growth: ", growthByDate)
}


