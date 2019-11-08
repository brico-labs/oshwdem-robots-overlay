var Robot = require('../models/robot');
var Tourney = require('../models/tourney');
var Race = require('../models/race');
var config = require('../../config')

var superSecret = config.secret;

module.exports = function(app, express) {
	var apiRouter = express.Router();

	// test route to make sure everything is working
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ success: true,  message: 'This is the awesome Oshwdem Robot Management 2.0 API' });
	});

	// REGISTER OUR ROUTES -------------------------------
	// all of our routes will be prefixed with /api

	// Routes for Robot Collection management
	apiRouter.route('/robots')
	.post(function(req, res) {
		var robot = new Robot();
		robot.name = req.body.name;
		robot.category = req.body.category;
		robot.hasDocumentation = false;
		robot.scores = []
		robot.times = []
		if (req.body.extra){
			robot.extra = req.body.extra;
		}
		robot.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, error: err.code, message: 'A robot with that name already exists in that category.'});
				else
					return res.send(err);
			}
		res.json({ success: true, message: robot });
		})
	})
	.get(function(req, res) {
		Robot.find(function(err, robots) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robots' });
			// return the users
			res.json({ success: true, message: robots });
		});
	});

	// Routes for Individual Robot Management
	apiRouter.route('/robots/:robot_id')
	.get(function(req, res) {
		if (req.query.category != undefined) {
			Robot.findOne({ 'name' : req.params.robot_id, 'category' : req.query.category}, function(err, robot){
				if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' });
				// return that robot
				res.json({ success: true, message: robot });
			});
		} else {
			Robot.findById(req.params.robot_id, function(err, robot) {
				//if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' });
				if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' });
				// return that robot
				res.json({ success: true, message: robot });
			});
		}
	})
	.put(function(req, res) {
		Robot.findById(req.params.robot_id, function(err, robot) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t update robot' });
			//update the robot info only if its new
			if (req.body.name) robot.name = req.body.name;
			if (req.body.category) robot.category = req.body.category;
			if (req.body.hasDocumentation != undefined) robot.hasDocumentation = req.body.hasDocumentation;
			if (req.body.scores) robot.scores = req.body.scores;
			if (req.body.times) robot.times = req.body.times;
			if (req.body.extra) robot.extra = req.body.extra;
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

	// Routes for Robot Category Management
	apiRouter.route('/category/:category_name/robots')
	.get(function(req, res) {
		Robot.find({'category' : req.params.category_name}, function(err, robots) {
			//if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' });
		if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get robots' });
			// return that robot
			res.json({ success: true, message: robots });
		});
	});

	apiRouter.route('/category/:category_name/tourneys')
	.get(function(req, res){
		Tourney.find({'category' : req.params.category_name}, function(err, tourneys){
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourneys' });
			// return that robot
			res.json({ success: true, message: tourneys });
		}).populate('rounds.matches.robotA').populate('rounds.matches.robotB').populate('rounds.matches.winner');
	});

	apiRouter.route('/category/:category_name/races')
	.get(function(req, res){
		Race.find({'category' : req.params.category_name}, function(err, races){
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get races' });
			// return that robot
			res.json({ success: true, message: races });
		});
	});

	apiRouter.route('/tourneys')
	.get(function(req, res){
		Tourney.find(function(err, tourneys) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourneys' });
			// return the users
			res.json({ success: true, message: tourneys });
		});
	})
	.post(function(req, res){
		var tourney = new Tourney();
		tourney.category = req.body.category;
		tourney.system = req.body.system;
		tourney.robots = req.body.robots;
		tourney.rounds = []

		tourney.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, error: err.code, message: 'A tourney for that category and system already exists'});
				else
					return res.send(err);
			}
		res.json({ success: true, message: tourney });
		})
	});

	apiRouter.route('/tourneys/:tourney_id')
	.get(function(req, res){
		Tourney.findById(req.params.tourney_id, function(err, tourney) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney' });
			res.json({ success: true, message: tourney });
		})
	})
	.put(function(req, res){
		Tourney.findById(req.params.tourney_id, function(err, tourney) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t update tourney' });
			if (req.body.robots) tourney.robots = req.body.robots;
			if (req.body.rounds) tourney.rounds = req.body.rounds;
			tourney.save(function(err) {
				if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save tourney' });
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

	//************ RACES */

	apiRouter.route('/races')
	.get(function(req, res){
		Races.find(function(err, races) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get races' });
			// return the users
			res.json({ success: true, message: races });
		});
	})
	.post(function(req, res){
		var race = new Race();
		race.category = req.body.category;
		race.robots = req.body.robots;

		race.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, error: err.code, message: 'A race for that category already exists'});
				else
					return res.send(err);
			}
		res.json({ success: true, message: race });
		})
	});

	apiRouter.route('/races/:race_id')
	.get(function(req, res){
		Race.findById(req.params.race_id, function(err, race) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t get race' });
			res.json({ success: true, message: race });
		});
	})
	.put(function(req, res){
		Race.findById(req.params.race_id, function(err, race) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t update race' });
			if (req.body.robots) race.robots = req.body.robots;
			race.save(function(err) {
				if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t save race' });
				res.json({ success: true, message: race });
			});
		});
	})
	.delete(function(req, res) {
		Race.remove({
			_id: req.params.race_id
		}, function(err, race) {
			if (err) return res.json({ success: false, error: err.code, message: 'Couldn\'t delete race' });
			res.json({ success: true });
		});
	});

  return apiRouter;
}
