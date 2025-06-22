// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Tourney = require('../models/tourney');
var Race = require('../models/race');

var RobotSchema = new Schema();

var RobotExtraSchema = new Schema({
  bestRecycled: { type: Boolean },
  bestOriginal: { type: Boolean },
  bestOnlineDocs: { type: Boolean }
});

var TourneyScoreSchema = new Schema({
  tourney: {type: mongoose.Schema.Types.ObjectId, ref: 'Tourney'},
  currentScore: { type: Number},
  trajectory: { type: Number },
  dropped: {type : Boolean },
  won : {type : Number},
  lost : {type : Number},
  draw : {type : Number},
  defeated : [{type: mongoose.Schema.Types.ObjectId, ref: 'Robot'}]
});

var RaceTimeSchema = new Schema({
  race: { type: mongoose.Schema.Types.ObjectId, ref: 'Race'},
  minutes: { type: Number, required: true },
  seconds: { type: Number, required: true },
  miliseconds: {type: Number, required: true }
});

RobotSchema.add({
  name: { type: String, required: true },
  category: { type: String, required: true },
  hasDocumentation: {type: Boolean, required: true},
  scores: [TourneyScoreSchema],
  times: [RaceTimeSchema],
  extra: RobotExtraSchema
});

RobotSchema.index({ "name" : 1, "category" : 1 }, { unique : true })

// return the model
var Robot = module.exports = mongoose.model('Robot', RobotSchema);

Robot.on('index', function (err) {
  if (err) console.log(err)
})
