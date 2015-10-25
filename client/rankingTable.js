Template.rankingTable.rendered = function () {
  this.subscribe('instruments');
};

Template.rankingTable.helpers({

  latestRankings: function () {
    var sortObj = getSortObject(this.limit);
    var rankingSeries = SeriesData.find({}, {sort: sortObj});

    if (rankingSeries) {

      return rankingSeries.map((currencySeries) => ({
          currencyName: currencySeries.name,
          latestValue: currencySeries.data[currencySeries.data.length - 1]
        })
      );

    }
  },

  pairs: function () {
    var sortObj = getSortObject(this.limit);
    var rankingSeries = SeriesData.find({}, {sort: sortObj}).fetch();

    if (rankingSeries && rankingSeries.length) {

      return getPairs(rankingSeries);

    }
  },

  validPairs: function () {
    var sortObj = getSortObject(this.limit);
    var rankingSeries = SeriesData.find({}, {sort: sortObj}).fetch();

    if (rankingSeries && rankingSeries.length) {
      var pairs = getPairs(rankingSeries);
      return Instruments.find({instrument: {$in: pairs}});
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
  var topThree = rankingSeries.slice(0, 3);
  var bottomThree = rankingSeries.slice(-3, rankingSeries.length);

  var pairPairs = topThree.map((topSeries) =>
      bottomThree.map((bottomSeries) =>
          `${topSeries.name}_${bottomSeries.name}`
      )
  );

  var pairs = pairPairs.reduce((a, b) => a.concat(b), []);

  return pairs;
}