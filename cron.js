var CronJob = require('cron').CronJob;

var Wyii = require('./whatyearisit');

new CronJob('00 00 */5 * * *', function() {
  Wyii.run();
}, null, true, 'America/New_York');
