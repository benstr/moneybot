// Computed collection. See seriesData publication.
SeriesData = new Mongo.Collection('seriesData')

Template.body.onCreated(() => {
  let template = Template.instance()
  template.limit = new ReactiveVar(20)
  template.subscribe('currencies')
  template.subscribe('totalCurr')
  template.subscribe('totalPairs')
  template.subscribe('totalGrowths')
  template.subscribe('totalHist')
  template.autorun(() => {
    template.subscribe('seriesData', template.limit.get())
    if (template.subscriptionsReady()) builtArea(SeriesData.find({}).fetch())
  })
})

Template.body.helpers({
  totalCurr() {
    return Counts.get('totalCurr')
  },
  totalPairs() {
    return Counts.get('totalPairs')
  },
  totalGrowths() {
    return Counts.get('totalGrowths')
  },
  totalHist() {
    return Counts.get('totalHist')
  },
  limit() {
    return Template.instance().limit.get()
  }
})

Template.body.events({
  'change #reactive'(event, template) {
    let limit = $(event.target).val()
    template.limit.set(limit)
  }
})

// Function to draw the area chart

builtArea = (series) => {
  series.forEach((oneSeries) => {
    let lastDataValue = numeral(oneSeries.data[oneSeries.data.length - 1])
      .format('0.00') + '%'
      
    _.extend(oneSeries, {
      currentValue: lastDataValue})
  })
  
  $('#container-area').highcharts({
    title: {text: 'Currency Growth'},
    credits: {enabled: false},
    subtitle: {enabled: false},
    xAxis: {
      allowDecimals: false,
      labels: {
        formatter() {
          return this.value // clean, unformatted number for year
        }
      }
    },
    yAxis: {
      title: {
        text: 'Percent Growth'
      },
      labels: {
        formatter() {
          return this.value + '%'
        }
      }
    },
    tooltip: {
      formatter() {
        return `${this.series.options._id}: ${numeral(this.point.y).format('0.00') + '%'}`
      }
    },
    plotOptions: {
      line: {
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
  })
}
