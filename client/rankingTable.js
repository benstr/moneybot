Template.rankingTable.created = function() {



};

Template.rankingTable.helpers({

    latestRankings: function () {
        var rankingSeries = this;
        return rankingSeries.map( function(currencySeries) {
            return {
                currencyName: currencySeries.name,
                latestValue: currencySeries.data[currencySeries.data.length - 1]
            };
        });
    }

});