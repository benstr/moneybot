Meteor.methods({
  'getRatesData'(instrument) {
    console.log(`GETTING RATE INFO FOR: ${instrument}`)

    let urlString = `${OANDA.baseURL}prices?accountId=${OANDA.account}&instruments=${instrument}`
    console.log('URL: ', urlString)

    return HTTP.get(urlString, OANDA.header)
  }
})
