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
		if (req.body.extra) {
			robot.extra = req.body.extra;
		}

		robot.save()
			.then(() => res.json({ success: true, message: robot }))
			.catch(err => {
				if (err.code === 11000)
					return res.json({ success: false, error: err.code, message: 'A robot with that name already exists in that category.' });
				else
					return res.send(err);
			});
	})
	.get(function(req, res) {
		Robot.find()
			.then(robots => res.json({ success: true, message: robots }))
			.catch(err => res.json({ success: false, error: err.code, message: 'couldn\'t get robots' }));
	});

	// Routes for Individual Robot Management
	apiRouter.route('/robots/:robot_id')
	.get(function(req, res) {
		if (req.query.category != undefined) {
			Robot.findOne({ name: req.params.robot_id, category: req.query.category })
				.then(robot => res.json({ success: true, message: robot }))
				.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' }));
		} else {
			Robot.findById(req.params.robot_id)
				.then(robot => res.json({ success: true, message: robot }))
				.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get robot' }));
		}
	})
	.put(function(req, res) {
		Robot.findById(req.params.robot_id)
			.then(robot => {
				if (!robot) return res.json({ success: false, message: 'Robot not found' });

				if (req.body.name) robot.name = req.body.name;
				if (req.body.category) robot.category = req.body.category;
				if (req.body.hasDocumentation !== undefined) robot.hasDocumentation = req.body.hasDocumentation;
				if (req.body.scores) robot.scores = req.body.scores;
				if (req.body.times) robot.times = req.body.times;
				if (req.body.extra) robot.extra = req.body.extra;

				return robot.save();
			})
			.then(updatedRobot => res.json({ success: true, message: updatedRobot }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t update robot' }));
	})

    .delete(function(req, res) {
        Robot.deleteOne({ _id: req.params.robot_id })
            .then(() => res.json({ success: true }))
            .catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t delete robot' }));
	});

	// Routes for Robot Category Management
	apiRouter.route('/category/:category_name/robots')
    .get(function(req, res) {
        Robot.find({ category: req.params.category_name })
			.then(robots => res.json({ success: true, message: robots }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get robots' }));
	});

	apiRouter.route('/category/:category_name/tourneys')
	.get(function(req, res){
		Tourney.find({ category: req.params.category_name })
			.populate('rounds.matches.robotA')
			.populate('rounds.matches.robotB')
			.populate('rounds.matches.winner')
			.then(tourneys => res.json({ success: true, message: tourneys }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get tourneys' }));
	});

	apiRouter.route('/category/:category_name/races')
	.get(function(req, res){
		Race.find({ category: req.params.category_name })
			.then(races => res.json({ success: true, message: races }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get races' }));
	});

	apiRouter.route('/tourneys')
	.get(function(req, res){
        Tourney.find()
			.then(tourneys => res.json({ success: true, message: tourneys }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get tourneys' }));
	})
	.post(function(req, res){
		var tourney = new Tourney();
		tourney.category = req.body.category;
		tourney.system = req.body.system;
		tourney.robots = req.body.robots;
		tourney.seeded = req.body.seeded;
		tourney.rounds = []

		tourney.save()
			.then(() => res.json({ success: true, message: tourney }))
			.catch(err => {
				if (err.code === 11000)
					return res.json({ success: false, error: err.code, message: 'A tourney for that category and system already exists' });
				else
					return res.send(err);
			});
	});

	apiRouter.route('/tourneys/:tourney_id')
    .get(function(req, res) {
		Tourney.findById(req.params.tourney_id)
			.then(tourney => res.json({ success: true, message: tourney }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get tourney' }));
    })
    .put(function(req, res) {
        Tourney.findOneAndUpdate({ _id: req.params.tourney_id }, req.body, { new: true })
			.then(tourney => res.json({ success: true, message: tourney }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t save tourney' }));
    })
    .delete(function(req, res) {
        Tourney.findOne({ _id: req.params.tourney_id }).populate('robots').exec()
			.then(tourney => {
				if (!tourney) throw new Error('Tourney not found');

				const promises = tourney.robots.map(rob => {
					if (rob.scores) {
						rob.scores = [];
						return rob.save();
					}
					return Promise.resolve();
			});

	        return Promise.all(promises).then(() => Tourney.deleteOne({ _id: req.params.tourney_id }));
		})
        .then(() => res.json({ success: true }))
        .catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t delete tourney' }));
    });

	//************ RACES */

	apiRouter.route('/races')
    .get(function(req, res) {
		Race.find()
			.then(races => res.json({ success: true, message: races }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get races' }));
    })
	.post(function(req, res){
		var race = new Race();
		race.category = req.body.category;
		race.robots = req.body.robots;

		race.save()
			.then(() => res.json({ success: true, message: race }))
			.catch(err => {
				if (err.code === 11000)
					return res.json({ success: false, error: err.code, message: 'A race for that category already exists' });
				else
					return res.send(err);
			});
	});

	apiRouter.route('/races/:race_id')
	.get(function(req, res) {
		Race.findById(req.params.race_id)
			.then(race => res.json({ success: true, message: race }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t get race' }));
	})
    .put(function(req, res) {
        Race.findById(req.params.race_id)
		    .then(race => {
				if (!race) return res.json({ success: false, message: 'Race not found' });
				if (req.body.robots) race.robots = req.body.robots;
				return race.save();
			})
			.then(updatedRace => res.json({ success: true, message: updatedRace }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t update race' }));
    })
    .delete(function(req, res) {
		Race.deleteOne({ _id: req.params.race_id })
			.then(() => res.json({ success: true }))
			.catch(err => res.json({ success: false, error: err.code, message: 'Couldn\'t delete race' }));
    });

    return apiRouter;
}
