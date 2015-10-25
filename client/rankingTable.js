Template.rankingTable.rendered = function () {
  this.subscribe('instruments');
  this.selectedPair = new ReactiveVar('');
};

Template.rankingTable.helpers({

  latestRankings: function () {
    var sortObj = getSortObject(this.limit);
    var rankingSeries = SeriesData.find({}, {sort: sortObj});

    if (rankingSeries) {
      return rankingSeries.map((currencySeries) => ({
        currencyName: currencySeries.name,
        latestValue: numeral(currencySeries.data[currencySeries.data.length - 1]).format('0.00') + '%'
      }));
    }
  },

  validPairs: function () {
    var sortObj = getSortObject(this.limit);
    var rankingSeries = SeriesData.find({}, {sort: sortObj}).fetch();

    if (rankingSeries && rankingSeries.length) {
      var pairs = getPairs(rankingSeries);
      return Instruments.find({instrument: {$in: pairs}});
    }
  },

  isPairSelected: function (pair) {
    return Template.instance().selectedPair.get() === pair.instrument ? 'selected' : '';
  }

});

Template.rankingTable.events({

  'click .valid-pair-item': function (e, template) {
    var el = $(e.currentTarget);
    var pair = el.text();
    var pairs = pair.split('_');
    var theHighchart = $('#container-area').highcharts();

    if (template.selectedPair.get() !== pair) {
      template.selectedPair.set(pair);
      theHighchart.series.forEach(function (series) {
        if (pairs.indexOf(series.name) === -1) {
          series.hide();
        } else {
          series.show();
        }
      });
    } else {
      theHighchart.series.forEach(function (series) {
        template.selectedPair.set('');
        series.show();
      });
    }
  }

});

function getSortObject(limit) {
  var sortLimit = limit - 1;
  var sortObj = {};
  sortObj['data.' + sortLimit] = -1;
  return sortObj;
}

function getPairs(rankingSeries) {

// Get the top three currencies, and bottom three currencies according to the most recent chart data
  var topThree = rankingSeries.slice(0, 3);
  var bottomThree = rankingSeries.slice(-3, rankingSeries.length);

// Find all possible currency pairs like TOP_BOT
  var pairPairs = topThree.map((topSeries) =>
    bottomThree.map((bottomSeries) =>
      [`${topSeries.name}_${bottomSeries.name}`, `${bottomSeries.name}_${topSeries.name}`]
    )
  );

// Flatten the array and return it to the template
  return _.flatten(pairPairs, true);
}
