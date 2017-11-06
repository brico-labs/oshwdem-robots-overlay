var Robot = require('../models/robot');
var config = require('../../config')

var superSecret = config.secret;
module.exports = function(app, express) {
  var apiRouter = express.Router();

  // test route to make sure everything is working
  // accessed at GET http://localhost:8080/api
  apiRouter.get('/', function(req, res) {
  	res.json({ message: 'hooray! welcome to our api!' });
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

  		// save the user and check for errors
  		robot.save(function(err) {
  			if (err) {
  				// duplicate entry
  				if (err.code == 11000)
  					return res.json({ success: false, message: 'A robot with that name already exists. '});
  				else
  					return res.send(err);
  			}
  		res.json({ message: 'Robot created!' });
  		});
  	})
  	.get(function(req, res) {
  		Robot.find(function(err, robots) {
  			if (err) res.send(err);
  			// return the users
  			res.json(robots);
  		});
  	});

  // on routes that end in /robots/:robot_id
  // ----------------------------------------------------
  apiRouter.route('/robots/:robot_id')
  	.get(function(req, res) {
  		Robot.findById(req.params.robot_id, function(err, robot) {
  			if (err) res.send(err);
  			// return that robot
  			res.json(robot);
  		});
  	})
  	.put(function(req, res) {
  		// use our user model to find the robot we want
  		Robot.findById(req.params.robot_id, function(err, robot) {
  			if (err) res.send(err);
  			//update the robot info only if its new
  			if (req.body.name) robot.name = req.body.name;
  			if (req.body.category) robot.category = req.body.username;
  			if (req.body.extra){
          if(req.body.extra.recycled) robot.extra["recycled"] = req.body.extra.recycled;
          if(req.body.extra.original) robot.extra["original"] = req.body.extra.original;
          if(req.body.extra.onlineDocs) robot.extra["onlineDocs"] = req.body.extra.onlineDocs;
          if(req.body.extra.retweetCount) robot.extra["retweetCount"] = req.body.extra.retweetCount;
          if(req.body.extra.twitter) robot.extra["twitter"] = req.body.extra.twitter;
        }
  			// save the robot
  			robot.save(function(err) {
  				if (err) res.send(err);
  				// return a message
  				res.json({ message: 'Robot updated!' });
  			});
  		});
  	})
  	.delete(function(req, res) {
  		Robot.remove({
  			_id: req.params.robot_id
  		}, function(err, user) {
  			if (err) return res.send(err);
  			res.json({ message: 'Successfully deleted' });
  		});
  });

  apiRouter.route('/robots/:robot_id/times')
  	.get(function(req, res){
  		Robot.findById(req.params.robot_id, function(err, robot) {
  			if (err) res.send(err);
  			// return that robot
  			res.json(robot.times);
  		});
  	})
    .post(function(req, res) {
      // use our user model to find the robot we want
  		Robot.findById(req.params.robot_id, function(err, robot) {
  			if (err) res.send(err);
  			var time = {
          "minutes": req.body.minutes,
          "seconds": req.body.seconds,
          "miliseconds": req.body.miliseconds
        }

        robot.times.push(time);

  			// save the robot
  			robot.save(function(err) {
  				if (err) res.send(err);
  				// return a message
  				res.json({ message: 'Robot time added!' });
  			});
  		});
  	})
    .put(function(req, res) {
      // use our user model to find the robot we want
      Robot.findById(req.params.robot_id, function(err, robot) {
        if (err) res.send(err);
        var time = {
          "minutes": req.body.minutes,
          "seconds": req.body.seconds,
          "miliseconds": req.body.miliseconds
        }

        robot.times[req.body.timeid] = time;

        // save the robot
        robot.save(function(err) {
          if (err) res.send(err);
          // return a message
          res.json({ message: 'Robot time ' + req.body.timeid + ' updated!' });
        });
      });
    })
    .delete(function(req, res){
      // use our user model to find the robot we want
      Robot.findById(req.params.robot_id, function(err, robot) {
        if (err) res.send(err);
        var time = {
          "minutes": 0,
          "seconds": 0,
          "miliseconds": 0
        }

        robot.times[req.body.timeid] = time;

        // save the robot
        robot.save(function(err) {
          if (err) res.send(err);
          // return a message
          res.json({ message: 'Robot time ' + req.body.timeid + ' deleted!' });
        });
      });
    });

  apiRouter.route('/robots/category/:category_id')
    .get(function(req, res){
      Robot.find({ 'category': req.params.category_id }, function(err, robots) {
  			if (err) res.send(err);
  			// return those robots
  			res.json(robots);
  		});
    })

  return apiRouter;
}
