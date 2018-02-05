'use strict';

var moment = require('moment-timezone');
var mongoose = require('mongoose');
var Weather = mongoose.model('WeatherSchema');

const axios = require("axios");
const key = "409167ff741942d9a59201326170304";
const city = "Buenos Aires";
const current_url = "http://api.apixu.com/v1/current.json?lang=es&key=" + key + "&q=" + city;
const history_url = "http://api.apixu.com/v1/history.json?lang=es&key=" + key + "&q=" + city;

exports.show_current_report = function(req, res) {
	axios
	  .get(current_url)
	  .then((response) => {
		  const payload = response.data.current;
		  res.send( 
			{ temperatura_actual : payload.temp_c,  
			  humedad : payload.humidity, 
			  condiciones : payload.condition.text
			} 
		  ); 
	  })
	  .catch(err => {
        console.log(err)
        res.send({ err }) // <= send error
      })
}	  

//Obtengo informacion de temperatura de hoy y del dia anterior. 
//Si existe en DB la recupero de alli, si no la busco en el apixu y la persisto en db. Luego hago los calculos.
exports.get_average_temp = function(req, res) {
	var exists = false;
	var historic;
	var today = new Date();
	Weather.find({
      report_date: { 
		$gte: new Date(today.getDate() - 1), 
		$lt: today
	  } 
	}, 
	'by_hour_report', function (err, report) {
		if(!report.length) {			
			var promiseReport = get_historic_report();
			promiseReport.then(function(response) {				
				historic = response;
				var dataSchema = reportToSchema(report);
				var weatherReport = new Weather({
					by_hour_report:	dataSchema
				});
				weatherReport.save(function(error) {
					console.log("Se persiste el reporte de clima de" + new Date());
					if(error) {
						console.log(error);
					}
				});
			},
			function(err) {
				console.log(err);
			})			
		}
		else {
			historic = report;
		}

		//recorro la data de temperaturas, si es info de hasta 24hs atras, la incorporo y luego la promedio.
		var tempAverage = historic[0].by_hour_report
			.filter(obj => Math.round(new Date() - new Date(obj.time)) <= 24)
			.map(obj => obj.temp)
			.reduce((total, temp, index, array) => {
				total+= temp
				if(index === array.length - 1) {
					return total / array.length;
				}
				else {
					return total;
				}
			});		
		res.send({tempertura_promedio:tempAverage.toFixed(2)});
	});
}

var reportToSchema = function(report) {
	var hour_temp = [];
	report.forEach(hour => hour_temp.push({time: hour.time, temp: hour.temp_c}));
	return hour_temp;
}

var create_a_report = function(body) {	
  var new_report = new Weather(body);
  new_report.save(function(err, report) {
    if (err)
      console.error(err);    
  });
};

var get_historic_report = function() { 
	return new Promise(function(resolve, reject) {
		var payload = {};
		axios.all([
		  axios.get(history_url + "&dt=" + getCurrentDate()),
		  axios.get(history_url + "&dt=" + getCurrentDate(1))
		])  
		.then(axios.spread(function (today, yesterday) {		
		  var payload_today = today.data.forecast.forecastday[0].hour;
		  var payload_yesterday = yesterday.data.forecast.forecastday[0].hour;		  
		  resolve(payload_yesterday.concat(payload_today));
		}))
		.catch(err => {
			console.log(err)  
			reject(err);		
		})	
	}) 
};	

var getCurrentDate = function(dayoffset) {
	var momentDate = moment().tz("America/Argentina/Buenos_Aires");
	
	if(dayoffset) {
		momentDate.subtract(dayoffset, 'days');
	}
	
	return momentDate.format('YYYY-MM-DD');
}
