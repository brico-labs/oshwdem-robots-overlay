var express    = require('express');
var app        = express();
var mongoose 	 = require('mongoose');
var apiRouter  = express.Router();
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var config     = require('./config');
var path     = require('path');

// BASE SETUP
// ==========================
var Robot = require('./app/models/robot');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

app.use(morgan('dev'));

mongoose.connect(config.database);

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);
apiRouter.route('/robots')
	.post(function(req, res) {
		// create a new instance of the Robot model
		var robot = new Robot();
		// set the users information (comes from the request)
		robot.name = req.body.name;
 		robot.category = req.body.category;

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
			if (req.body.extra) robot.extra = req.body.extra;
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
	});
	// Post to Add time
	// Put to modify time (Specify index)
	// Delete to delete time (Specify index)

app.use(express.static(__dirname + '/public'));

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(config.port);
console.log('Magic happens on port ' + config.port);
