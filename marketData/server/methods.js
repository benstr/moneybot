Meteor.methods({
  'getRatesData': function(instrument) {
    console.log(`GETTING RATE INFO FOR: ${instrument}`);

    var urlString = `${OANDA.baseURL}prices?accountId=${OANDA.account}&instruments=${instrument}`
    console.log('URL: ', urlString);

    return HTTP.get(urlString, OANDA.header);
  }
});
