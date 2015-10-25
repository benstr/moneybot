// Oanda settings
OANDA = {};
OANDA.baseURL = Meteor.settings.OANDA_BASEURL;
OANDA.token = Meteor.settings.OANDA_TOKEN;
OANDA.account = Meteor.settings.OANDA_ACCOUNT;
OANDA.header = {headers: {'Authorization': "Bearer " + OANDA.token}};