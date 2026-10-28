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
var wdio = require('webdriverio');
var firefoxProfile = require('firefox-profile');
var request = require('request');
var moment = require('moment');

var okCode = 200;


/********
 Instantiate and extend the webdriver
********/
var ffProfile = new firefoxProfile();
ffProfile.setPreference("browser.download.folderList",2);
ffProfile.setPreference("browser.download.manager.showWhenStarting",true);
ffProfile.setPreference("browser.download.dir", "/d/dev/src/zar-projects/bill-scraper/downloads");
ffProfile.setPreference("browser.helperApps.neverAsk.saveToDisk", "text/html, application/xhtml+xml, application/csv, text/plain, application/vnd.ms-excel, text/csv, text/comma-separated-values, application/octet-stream, application/vnd.intu.qfx, application/x-qfx");

var profile;
ffProfile.encoded(function(myProfile) { profile = myProfile });

var options = {
  host: '127.0.0.1',
  port:4444,
  path:'/wd/hub',
  baseUrl: baseUrl,
  browserName: 'firefox',
  firefox_profile: profile
}

var client = wdio.remote(options);
client.addCommand('waitForTitle', function async (target, timeout, interval) {
  return this.waitUntil(function() {
    return this.getTitle().then(function(title) {
      return title === target;
    });
  }, timeout, interval);
});

client.addCommand('waitForHeadingContains', function async (target, timeout, interval) {
  return this.waitUntil(function() {
    return this.getText('h1 h2').then(function(text) {
      return text.contains(target);
    });
  });
});

client.addCommand('getPersonalAccountTransactions', function async () {
  return this
    .frame('tddetails')   
    // Visit the personal accounts page
    //.waitForExist('a=Personal Accounts')
    //.click('a=Personal Accounts')
    // TODO Verify that all accounts are selected
    //.getValue('input[name="download[]"]').then(function(value) {
    //  console.log(value);
    //  if(value!='checked') click('');
    //})
    // Choose the download type
    //.scroll('select#exportType')
    .selectByValue('select#exportType', 'ofx')
    // Download the files OR setup the download
    .click('a#download_link').then(function() {console.log("Attempting to download the quicken files")})
    // TODO Verify that we are asked to setup the download.
    // Download the files by clicking the OK button
    //.click('a img[alt*=OK]')
    // Determine the url of the file we want to capture
    .getAttribute('a img[alt*=OK]', 'href').then(function(fileUrl) {
      // Capture the session and pass it over to an external tool
      this.getCookie().then(function(cookies) {
        console.log("Got this url: " + fileUrl);
        console.log("Got these cookies: " + cookies[0]);
        // TODO Pass the cookies to a third party tool to download and rename the file(s)
        // Inspired by https://github.com/mxfli/node-cookies.txt
        var now = moment();
        request.get({
            url: fileUrl,
            encoding: null,
            headers: { 'Cookie': cookies}
          })
          .on('response', function(response) {
            console.log(response.statusCode);
            console.log(response.headers['content-type']);
          })
          .on('error', function(err) {
            console.log("ERROR " + err);
          })
          .pipe(fs.createWriteStream('/d/dev/src/zar-projects/bill-scraper/downloads/' + moment.format('YYYYMMDD') + " TD Personal Accounts.qfx"));
      });
    })
    .waitForTitle('x', 500000, 2000)
});



/********
 Execute the script itself
********/
client
  .init()
  // Head to the login page
  .url(loginUrl).then(function(){console.log(i18n_waitForLogin)})
  // Wait until the user clicks the button before proceeding.
  .waitForTitle(loginSuccessTitle, 500000, 1000).then(function(){console.log("Logged in successfully")})
  .getPersonalAccountTransactions()
  .end();

