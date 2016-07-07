var CronJob = require('cron').CronJob;

var LikeHashtags = require('./whatyearisit');

new CronJob('00 00 * * * *', function() {
  LikeHashtags.run();
}, null, true, 'America/New_York');
