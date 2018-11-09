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

      // Check if the category needs the combat object
      if(req.body.category >= 4){
        var combatInfo = {
          played: 0,
          won: 0,
          lost: 0,
          draw: 0,
          eliminated: false,
          dropOut: false
        }

        robot.combatInfo = combatInfo;
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
        if (req.body.combatInfo){
          if(typeof req.body.combatInfo.played !== 'undefined') robot.combatInfo.played = req.body.combatInfo.played;
          if(typeof req.body.combatInfo.won !== 'undefined') robot.combatInfo.won = req.body.combatInfo.won;
          if(typeof req.body.combatInfo.lost !== 'undefined') robot.combatInfo.lost = req.body.combatInfo.lost;
          if(typeof req.body.combatInfo.draw !== 'undefined') robot.combatInfo.draw = req.body.combatInfo.draw;
          if(typeof req.body.combatInfo.eliminated !== 'undefined') robot.combatInfo.eliminated = req.body.combatInfo.eliminated;
          if(typeof req.body.combatInfo.dropOut !== 'undefined') robot.combatInfo.dropOut = req.body.combatInfo.dropOut;
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

  apiRouter.route('/robots/category/:category')
    .get(function(req, res){
      Robot.find({ 'category': req.params.category }, function(err, robots) {
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
  		})
      .populate('robots')
      .exec(function(err, tourneys){
        // return the
        res.json({ success: true, message: tourneys });
      })
  	})
    .post(function(req, res) {
      // create a new tourney
      var tourney = new Tourney();
      // set the users information (comes from the request)
      tourney.name = req.body.name;
      tourney.category = req.body.category;
      tourney.modality = req.body.modality;
      tourney.allMatches = [];
      tourney.currentMatches = [];

      // save the user and check for errors
      tourney.save(function(err) {
        if (err) {
          console.log("ERROR: " + err)
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
      })
      .populate('allMatches.winner')
      .exec(function(err, tourneys){
        res.json({ success: true, message: tourneys });
      });
    })
    .put(function(req, res) {
      // use our user model to find the robot we want
      Tourney.findById(req.params.tourney_id, function(err, tourney) {
        if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t update tourney: ' + err });
        //update the robot info only if its new
        if (req.body.name) tourney.name = req.body.name;
        if (req.body.category) tourney.category = req.body.category;
        if (req.body.modality) tourney.modality = req.body.modality;
        if (req.body.allMatches) tourney.allMatches = req.body.allMatches;
        if (req.body.currentMatches) tourney.currentMatches = req.body.currentMatches;
        if (req.body.robots) tourney.robots = req.body.robots;
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
    			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney matches',
            error_detail: err});
    		})
        .populate('allMatches.participant_a')
        .populate('allMatches.participant_a')
        .populate('currentMatches.participant_a')
        .populate('currentMatches.participant_b')
        .exec(function(err, result){
          res.json({ 'success': true, 'message': {"all": result.allMatches, "current": result.currentMatches }})
        })
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

          tourney.currentMatches.push(match);

          // save the tourney
          tourney.save(function(err, tourney) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save the tourney ',
                  error_detail: err });
            res.json({ success: true, message: tourney });
          });
        });
      })
      .put(function(req, res) {
        Tourney.findById(req.params.tourney_id, function(err, tourney) {
          if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney matches' });
          tourney.allMatches.push(req.body.matchData);

          // save the tourney
          tourney.save(function(err, tourney) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save the tourney ',
                  error_detail: err });
            res.json({ success: true, message: tourney });
          });
        });
      })
      .delete(function(req, res){
        Tourney.findById(req.params.tourney_id, function(err, tourney) {
          if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney matches' });

          tourney.allMatches = [];
          tourney.currentMatches = [];

          // save the tourney
          tourney.save(function(err) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save the tourney ',
                  error_detail: err });
            // return a message
            res.json({ success: true, message: tourney });
          });
        });
      });

      apiRouter.route('/tourney/:tourney_id/matches/:match_id')
        .get(function(req,res){
          Tourney.findById(req.params.tourney_id, function(err, tourney) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney' });
          }).populate('allMatches')
          .exec(function (err, tourney){
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t populate matches' });
            match = tourney.allMatches.filter(m => m._id == req.params.match_id)
            if (match.length == 0) return res.json({ success: false, error: err.code, message: 'Couldn\'t find that match' });
            res.json({ success: true, message: match[0] });
          })
        })
        .delete(function(req, res){
          Tourney.findById(req.params.tourney_id, function(err, tourney) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney matches' });
            pos = -1;
            currentIDs = tourney.currentMatches.map(function(m) { return m._id; });
            for (i = 0; i < currentIDs.length; i++){
              if(currentIDs[i] == req.params.match_id){
                pos = i;
              }
            }

            if (pos != -1){
              tourney.currentMatches.splice(pos, 1)
            }


            // save the tourney
            tourney.save(function(err) {
              if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save the tourney ',
                    error_detail: err });
              // return a message
              res.json({ success: true, message: tourney });
            });
          });
        });


      apiRouter.route('/tourney/:tourney_id/robots')
      	.get(function(req, res){
      		Tourney.findById(req.params.tourney_id, function(err, tourney) {
      			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney robots' });
      		}).populate('robots').
          exec(function (err, robots){
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t populate robots' });
            res.json({ success: true, message: robots.robots });
          })
      	})
        .post(function(req, res) {
          Tourney.findById(req.params.tourney_id, function(err, tourney) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney robots' });
            if (tourney.allMatches.length == 0){
                tourney.robots.push( req.body.robot_id );
            } else {
              return res.json({ success: false, error: err.code, message: 'Cannot add robots once tourney has started' });
            }

            // save the tourney
            tourney.save(function(err) {
              if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save the tourney ',
                    error_detail: err });
              // return a message
              res.json({ success: true, message: tourney });
            });
          });
        })


    apiRouter.route('/tourney/:tourney_id/robots/:robot_id')
      .delete(function(req, res) {
        Tourney.findById(req.params.tourney_id, function(err, tourney) {
          if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney robots' });
          robotIdx = tourney.robots.indexOf( req.params.robot_id )
          if (robotIdx == -1) {
            return res.json({ success: false, message: 'That robot doesn\'t exist or is not participating' });
          }
          if (tourney.allMatches.length == 0){
            tourney.robots.splice(robotIdx, 1);
          } else {
            return res.json({ success: false, error: err.code, message: 'Cannot remove robots once tourney has started' });
          }

          // save the tourney
          tourney.save(function(err) {
            if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save the tourney ',
                  error_detail: err });
            // return a message
            res.json({ success: true, message: tourney });
          });
        });
      })


    apiRouter.route('/tourney/category/:category')
      .get(function(req, res){
        Tourney.find({ 'category': req.params.category }, function(err, tourneys) {
    			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourneys by category' });
    		})
        .populate('robots')
        .populate('allMatches.winner')
        .exec(function(err, tourneys){
          // return the
          res.json({ success: true, message: tourneys });
        })
      })

  return apiRouter;
}
