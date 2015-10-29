// Computed collection. See seriesData publication.
SeriesData = new Mongo.Collection('seriesData');

bias = new ReactiveVar("none");

Template.body.onCreated(function() {
  this.limit = new ReactiveVar(20);
});

Template.body.onRendered( function () {
  this.subscribe('currencies');
  this.subscribe('totalCurr');
  this.subscribe('totalPairs');
  this.subscribe('totalGrowths');
  this.subscribe('totalHist');

  this.autorun(function() {
    this.subscribe('seriesData', this.limit.get());
  }.bind(this));

  this.autorun(function() {
    console.log('rendering');
    builtArea(SeriesData.find({}).fetch());
  });
});

Template.body.helpers({
  totalCurr() {
    return Counts.get('totalCurr');
  },
  totalPairs() {
    return Counts.get('totalPairs');
  },
  totalGrowths() {
    return Counts.get('totalGrowths');
  },
  totalHist() {
    return Counts.get('totalHist');
  },
  limit() {
    return Template.instance().limit.get();
  },
  currencies() {
    return Currencies.find();
  }
});

Template.body.events({
  'change #reactive': function (event, template) {
    var limit = $(event.target).val();
    template.limit.set(limit);
  },
  
  'click #clear': function(event) {
    var theHighchart = $('#container-area').highcharts();
    theHighchart.series.forEach(function (series) {
      series.hide();
    });
  },

  'change #bias': function(event) {
    bias.set($(event.target).val());
  }
});

seriesData = function(series) {
  if (bias.get() === "none")
    return series;
  var biasSeries;
  _.forEach(series, function(oneSeries) {
    if (oneSeries.name === bias.get()) {
      biasSeries = oneSeries;
    }
  });
  var biasedSeries = [];
  _.forEach(series, function(oneSeries) {
    el = {
      _id: oneSeries._id,
      currentValue: oneSeries.currentValue,
      name: oneSeries.name,
      data: []
    }
    _.forEach(oneSeries.data, function(value, n) {
      el.data[n] = value-biasSeries.data[n];
    });
    biasedSeries.push(el);
  });
  return biasedSeries;
}

// Function to draw the area chart

function builtArea(series) {
  _.forEach(series, function(oneSeries) {
    let lastDataValue = numeral(oneSeries.data[oneSeries.data.length - 1])
      .format('0.00') + '%';
      
    _.extend(oneSeries, {
      currentValue: lastDataValue});
  });
  
  titleText = 'Currency Growth'
  if (bias.get() !== "none")
    titleText = 'Currency Growth relative to '+bias.get()

  $('#container-area').highcharts({
    title: {text: titleText},
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
      formatter: function() {
        return `${this.series.options._id}: ${numeral(this.point.y).format('0.00') + '%'}`;
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

    series: seriesData(series)
  });
}
