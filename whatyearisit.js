var Twit = require('twit');
var T = new Twit(require('./config.js'));
var fs = require('fs');
var mkdirp = require('mkdirp');

var theYear = new Date().getFullYear();
var theMonth = new Date().getMonth();
var query = '%22it%27s%20' + theYear + "%22";
var logObject = {};

function tweetContainsKeywords(tweet) {
  var keywords = ["still", "yet", "why"];
  var normalizedText = tweet.text.toLowerCase();
  var found = false;
  keywords.forEach(function (word) {
    if( normalizedText.indexOf(word + " ") !== -1 ) {
      found = true;
    }
  })
  return found;
}

function isReply(t) {
  return (
    t.in_reply_to_status_id         //twitter recognizes this as a reply
    || t.text.charAt(0) === '@'   //this is a manual reply?
    || t.text.charAt(1) === '@'   //this is a .@ which isn't technically a reply but I still don't want
  );
}

function isRetweet(t) {
  return (
    t.retweeted_status                                       //twitter recognizes this as a retweet
    || t.retweeted                                            //this account has already retweeted this tweet
    || t.text.substring(0, 2).toLowerCase() === "rt"   //this tweet starts with RT
  );
}

function run() {
  T.get('search/tweets', { q: query, count: 100, lang: 'en' }, function(err, data, response) {
    if(err) {
      console.log(err);
    } else {
      var theTweet = null;
      for (var i = data.statuses.length - 1; i >= 0; i--) {
        var t = data.statuses[i];
        //filter out retweets, replies, and tweets that don't contain special keywords
        if(isRetweet(t) || isReply(t) || !tweetContainsKeywords(t)) {
          continue;
        } else {
          theTweet = t;
          break;
        }
      }

      //didn't find anything, stop here
      if(!theTweet) { return; }

      //create an object that will be added to the logs
      logObject.tweetID = theTweet.id_str;
      logObject.text = theTweet.text;
      logObject.user =  theTweet.user.screen_name;

      //retweet the tweet
      // T.post('statuses/retweet/:id', { id: theTweet.id }, function (err, data, response) {
      // })

      //log it to the filesystem
      var filepath = __dirname + '/WhatYearIsIt-LOGS/'+theYear+'/';
      var filename = theMonth+'.json';
      fs.readFile(filepath + filename, function(err, data){
        if(err) {
          if(err.errno == -2) {
            //file or directory doesn't exist
            mkdirp(filepath, function(err) {
              if(err) console.log("error making file:" + err);
              var writeArray = JSON.stringify([logObject]);
              fs.writeFile(filepath + filename, writeArray, (err) => console.log(err ? err : "wrote to a new file"));
            })
          } else {
            console.log("error reading:" + err);
          }
        } else {
          var readArray = JSON.parse(data);
          console.log(readArray);
          readArray.push(logObject);
          fs.writeFile(filepath + filename, JSON.stringify(readArray), (err) => console.log(err ? err : "wrote to an existing file"));
        }
      });
    }
  })
}

module.exports = {
  run: run
}

//tests
// console.log( tweetContainsKeywords( {text: "It's 2015 why is racism still a thing"} ) );
// console.log( isReply( {text: "@robertvinluan hey"} ));
// console.log( isReply( {text: ".@robertvinluan hey"} ));
// console.log( isRetweet( {text: "RT @robertvinluan hey"} ));
// run();