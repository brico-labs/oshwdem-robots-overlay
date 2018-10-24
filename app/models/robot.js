// grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// robotTime schema
var RobotTimeSchema = new Schema({
  minutes: { type: Number, required: true },
  seconds: { type: Number, required: true },
  miliseconds: {type: Number, required: true }
});

// robotExtra schema
var RobotExtraSchema = new Schema({
  recycled: { type: Boolean },
  original: { type: Boolean },
  onlineDocs: { type: Boolean },
  retweetCount: { type: Number },
  twitter: { type: Boolean }
});

// robot schema
var RobotSchema = new Schema({
  name: { type: String, required: true },
  category: { type: Number, required: true },
  // Categories are indexed for flexibility
  // 1 is Laberinto
  // 2 is Siguelineas
  // 3 is Velocistas
  // 4 is Sumo
  // 5 is Hebocon
  // 6 is Combate
  times: [RobotTimeSchema],
  extra: RobotExtraSchema
});

RobotSchema.index({ "name" : 1, "category" : 1 }, { unique : true })

// return the model
var Robot = module.exports = mongoose.model('Robot', RobotSchema);

Robot.ensureIndexes(function (err) {
  if (err) console.log(err)
})

Robot.on('index', function (err) {
  if (err) console.log(err)
})
