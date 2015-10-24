Template.body.onRendered( function () {
  builtArea();
});

Template.body.helpers({

});


// Function to draw the area chart

function builtArea() {

  $('#container-area').highcharts({
    chart: {type: 'area'},
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
        pointStart: 1940,
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

    series: [{
      name: 'John',
      data: [5, 3, 4, 7, 2]
    }, {
      name: 'Jane',
      data: [2, -2, -3, 2, 1]
    }, {
      name: 'Joe',
      data: [3, 4, 4, -2, 5]
    }]
  });
}