'use strict';
module.exports = function(app) {
  var controller = require('../controllers/weatherController');

  // controller Routes
  //app.route('/reports')
  //  .get(controller.list_all_reports)
  //  .post(controller.create_a_report);
	
  app.route('/current')
	.get(controller.show_current_report);
	
	  // controller Routes
  app.route('/get_average_temp')
    .get(controller.get_average_temp);
    
};
