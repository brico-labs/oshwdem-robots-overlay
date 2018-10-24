var Robot = require('../models/robot');
var Tourney = require('../models/tourney');
var config = require('../../config')

var superSecret = config.secret;

module.exports = function(app, express) {
  var apiRouter = express.Router();

  // test route to make sure everything is working
  // accessed at GET http://localhost:8080/api
  apiRouter.get('/', function(req, res) {
  	res.json({ success: true,  message: 'This is the awesome Oshwdem Robot Management API' });
  });

  // REGISTER OUR ROUTES -------------------------------
  // all of our routes will be prefixed with /api
  apiRouter.route('/robots')
  	.post(function(req, res) {
  		// create a new instance of the Robot model
  		var robot = new Robot();
  		// set the users information (comes from the request)
  		robot.name = req.body.name;
   		robot.category = req.body.category;

      var time = {
        "minutes": 0,
        "seconds": 0,
        "miliseconds": 0
      }

      robot.times.push(time);
      robot.times.push(time);
      robot.times.push(time);

      // Check if the category needs the extra object
      if(req.body.category == 2){
        var extra = {
          recycled: false,
          original: false,
          onlineDocs: false,
          retweetCount: 0,
          twitter: 0
        }

        robot.extra = extra;
      }

  		// save the user and check for errors
  		robot.save(function(err) {
  			if (err) {
  				// duplicate entry
  				if (err.code == 11000)
  					return res.json({ success: false, error: err.code, message: 'A robot with that name already exists in that category.'});
  				else
  					return res.send(err);
  			}
  		res.json({ success: true, message: robot });
  		});
  	})
  	.get(function(req, res) {
  		Robot.find(function(err, robots) {
  			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robots' });
  			// return the users
  			res.json({ success: true, message: robots });
  		});
  	});

  // on routes that end in /robots/:robot_id
  // ----------------------------------------------------
  apiRouter.route('/robots/:robot_id')
  	.get(function(req, res) {
  		Robot.findById(req.params.robot_id, function(err, robot) {
  			//if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' });
        if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' });
  			// return that robot
  			res.json({ success: true, message: robot });
  		});
  	})
  	.put(function(req, res) {
  		// use our user model to find the robot we want
  		Robot.findById(req.params.robot_id, function(err, robot) {
  			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t update robot' });
  			//update the robot info only if its new
  			if (req.body.name) robot.name = req.body.name;
  			if (req.body.category) robot.category = req.body.category;
        if (req.body.times) robot.times = req.body.times;
  			if (req.body.extra){
          if(typeof req.body.extra.recycled !== 'undefined') robot.extra.recycled = req.body.extra.recycled;
          if(typeof req.body.extra.original !== 'undefined') robot.extra.original = req.body.extra.original;
          if(typeof req.body.extra.onlineDocs !== 'undefined') robot.extra.onlineDocs = req.body.extra.onlineDocs;
          if(typeof req.body.extra.retweetCount !== 'undefined') robot.extra.retweetCount = req.body.extra.retweetCount;
          if(typeof req.body.extra.twitter !== 'undefined') robot.extra.twitter = req.body.extra.twitter;
        }
  			// save the robot
  			robot.save(function(err) {
  				if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save robot' });
  				// return a message
  				res.json({ success: true, message: robot });
  			});
  		});
  	})
  	.delete(function(req, res) {
  		Robot.remove({
  			_id: req.params.robot_id
  		}, function(err, user) {
  			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t delete robot' });
  			res.json({ success: true });
  		});
  });

  apiRouter.route('/robots/:robot_id/times')
  	.get(function(req, res){
  		Robot.findById(req.params.robot_id, function(err, robot) {
  			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robot times' });
  			// return that robot
  			res.json(robot.times);
  		});
  	})
    .put(function(req, res) {
      // use our user model to find the robot we want
      Robot.findById(req.params.robot_id, function(err, robot) {
        if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t update robot time' });
        var time = {
          "minutes": req.body.minutes,
          "seconds": req.body.seconds,
          "miliseconds": req.body.miliseconds
        }

        robot.times[req.body.timeid] = time;

        // save the robot
        robot.save(function(err) {
          if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save robot times' });
          // return a message
          res.json({ success: true, message: robot });
        });
      });
    })
    .delete(function(req, res){
      // use our user model to find the robot we want
      Robot.findById(req.params.robot_id, function(err, robot) {
        if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t delete robot time' });
        var time = {
          "minutes": 0,
          "seconds": 0,
          "miliseconds": 0
        }

        robot.times[req.body.timeid] = time;

        // save the robot
        robot.save(function(err) {
          if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save robot times' });
          // return a message
          res.json({ success: true, message: robot });
        });
      });
    });

  apiRouter.route('/robots/category/:category_id')
    .get(function(req, res){
      Robot.find({ 'category': req.params.category_id }, function(err, robots) {
  			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robots by category' });
  			// return those robots
  			res.json({ success: true, message: robots });
  		});
    })

  // ----------------------------------------------- //

  apiRouter.route('/tourney')
    .get(function(req, res) {
  		Tourney.find(function(err, tourneys) {
  			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourneys' });
  			// return the
  			res.json({ success: true, message: tourneys });
  		});
  	})
    .post(function(req, res) {
      // create a new tourney
      var tourney = new Tourney();
      // set the users information (comes from the request)
      tourney.name = req.body.name;
      tourney.category = req.body.category_id;
      tourney.modality = req.body.modality;
      tourney.matches = [];
      console.log(req.body.name, req.body.category_id);

      // save the user and check for errors
      tourney.save(function(err) {
        if (err) {
          // duplicate entry
          if (err.code == 11000)
            return res.json({ success: false, error: err.code, message: 'A tourney with that name already exists in that category.'});
          else
            return res.send(err);
        }
      res.json({ success: true, message: tourney });
      });
    });

  apiRouter.route('/tourney/:tourney_id')
    .get(function(req, res) {
      Tourney.findById(req.params.tourney_id, function(err, tourney) {
        if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney' });
        // return that tourney
        res.json({ success: true, message: tourney });
      });
    })
    .put(function(req, res) {
      // use our user model to find the robot we want
      Tourney.findById(req.params.tourney_id, function(err, tourney) {
        if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t update tourney' });
        //update the robot info only if its new
        if (req.body.name) tourney.name = req.body.name;
        if (req.body.category_id) tourney.category = req.body.category_id;
        if (req.body.modality) tourney.modality = req.body.modality;
        if (req.body.matches) tourney.matches = req.body.matches;
        // save the tourney
        tourney.save(function(err) {
          if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save tourney' });
          // return a message
          res.json({ success: true, message: tourney });
        });
      });
    })
    .delete(function(req, res) {
      Tourney.remove({
        _id: req.params.tourney_id
      }, function(err, tourney) {
        if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t delete tourney' });
        res.json({ success: true });
      });
    });

    apiRouter.route('/tourney/:tourney_id/matches')
    	.get(function(req, res){
    		Tourney.findById(req.params.tourney_id, function(err, tourney) {
    			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney matches' });
    			// return that tourney matches
    			res.json(tourney.matches);
    		});
    	})
      .post(function(req, res) {
        Tourney.findById(req.params.tourney_id, function(err, tourney) {
          if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney matches' });

          if ( tourney.modality == "single" ){
            var match = {
              "bracket": req.body.bracket,
              "stage": req.body.stage,
              "result_a": req.body.result_a,
              "result_b": req.body.result_b,
              "participant_a": req.body.participant_a,
              "participant_b": req.body.participant_b,
              "winner": req.body.winner
            }
          }
          if ( tourney.modality == "league" ){
            var match = {
              "result_a": req.body.result_a,
              "result_b": req.body.result_b,
              "participant_a": req.body.participant_a,
              "participant_b": req.body.participant_b,
              "winner": req.body.winner
            }
          }

          console.log(req.body.winner);

          tourney.matches.push(match);

          // ParseFailed, aqui hay algun problema con refs

          // save the tourney
          tourney.save(function(err) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save the tourney' });
            // return a message
            res.json({ success: true, message: tourney });
          });
        });
      })

    apiRouter.route('/tourney/category/:category_id')
      .get(function(req, res){
        Tourney.find({ 'category': req.params.category_id }, function(err, tourneys) {
    			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourneys by category' });
    			// return those robots
    			res.json({ success: true, message: tourneys });
    		});
      })

  return apiRouter;
}
