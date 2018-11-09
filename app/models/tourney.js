// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Robot = require('../models/robot');

// tourneyMatch schema
var TourneyMatchSchema = new Schema({
  participant_a: {type: mongoose.Schema.Types.ObjectId, ref: 'Robot', required: true},
  participant_b: {type: mongoose.Schema.Types.ObjectId, ref: 'Robot', required: false},
  stage: {type: Number, required: false },
  result_a: {type: Number, required: true},
  result_b: {type: Number, required: true},
  winner: {type: mongoose.Schema.Types.ObjectId, ref: 'Robot', required: false}
},
{usePushEach: true});

var TourneyMatch = module.exports = mongoose.model('TourneyMatch', TourneyMatchSchema);

// tourney schema
var TourneySchema = new Schema({
  name: { type: String, required: true },
  category: { type: Number, required: true },
  modality: { type: String, required: true },
  // Categories are indexed for flexibility
  // 1 is Laberinto
  // 2 is Siguelineas
  // 3 is Velocistas
  // 4 is Sumo
  // 5 is Hebocon
  // 6 is Combate
  allMatches : [TourneyMatchSchema],
  currentMatches : [TourneyMatchSchema],
  robots: [{type: mongoose.Schema.Types.ObjectId, ref: 'Robot', required: false}]
},
{usePushEach: true});

TourneySchema.index({ "name" : 1, "category" : 1, "modality": 1 }, { unique : true })

// return the model
var Tourney = module.exports = mongoose.model('Tourney', TourneySchema);

Tourney.ensureIndexes(function (err) {
  if (err) console.log(err)
})

Tourney.on('index', function (err) {
  if (err) console.log(err)
})
