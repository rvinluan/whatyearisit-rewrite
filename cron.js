var CronJob = require('cron').CronJob;

var Wyii = require('./whatyearisit');

var job = new CronJob({
  cronTime: '00 00 */5 * * *',
  onTick: function() {
    Wyii.run();
  },
  start: false,
  timeZone: 'America/New_York'
});
job.start();
