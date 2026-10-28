/********
All variables specific to the TD website
********/
var baseUrl = 'https://easyweb.td.com/';
var loginUrl = '/';
var loginButton = 'input#login';
var loginBanner = 'h3.td-margin-top-none';
var loginSuccessTitle = 'Accounts Overview';


/********
Internationalization / string variables
********/
var i18n_waitForLogin = "Waiting for user to log in";


/********
All general variables for execution of the script
********/
var Request = require('request');
var Cheerio = require('cheerio');

var Codes = {
  OK:200
}


/********
Begin the script
********/
Request(baseUrl, function(error, response, html) {
  if(!error && response.statusCode == Codes.OK) {
    var $ = Cheerio.load(html);
    login($)
  }
});
