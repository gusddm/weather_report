'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weatherSchema = new Schema({
  by_hour_report: [{time: Date, temp: Number}],	
  report_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WeatherSchema', weatherSchema);