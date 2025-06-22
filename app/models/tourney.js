// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Robot = require('../models/robot');

var TourneySchema = new Schema();
var TourneyRoundSchema = new Schema();

var RoundMatchSchema = new Schema({
  robotA: {type: mongoose.Schema.Types.ObjectId, ref: 'Robot'},
  robotB: {type: mongoose.Schema.Types.ObjectId, ref: 'Robot'},
  winner: {type: mongoose.Schema.Types.ObjectId, ref: 'Robot'},
  resultA: {type: Number},
  resultB: {type: Number},
  bracket: {type: String},
  isDraw: {type: Boolean}
});

TourneyRoundSchema.add({
  tourney: {type: mongoose.Schema.Types.ObjectId, ref: 'Tourney'},
  roundNumber: {type: Number, required: true },
  matches: [RoundMatchSchema]
});

TourneySchema.add({
  robots: [{type: mongoose.Schema.Types.ObjectId, ref: 'Robot'}],
  category: { type: String, required: true },
  system: {type: String, required: true },
  seeded: {type: Boolean, required: true },
  rounds: [TourneyRoundSchema]
});

TourneySchema.index({ "category" : 1, "system": 1 }, { unique : true })

// return the model
var Tourney = module.exports = mongoose.model('Tourney', TourneySchema);

Tourney.ensureIndexes(function (err) {
  if (err) console.log(err)
})

Tourney.on('index', function (err) {
  if (err) console.log(err)
})
