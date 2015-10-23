// Oanda settings
OANDA = {};
OANDA.baseURL = 'https://api-fxtrade.oanda.com/v1/';
OANDA.token = Meteor.settings.OANDA_TOKEN;
OANDA.account = Meteor.settings.OANDA_ACCOUNT;
OANDA.header = {headers: {'Authorization': "Bearer " + OANDA.token}};