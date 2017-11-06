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

// user schema
var RobotSchema = new Schema({
  name: { type: String, required: true },
  category: { type: Number, required: true },
  times: [RobotTimeSchema],
  extra: RobotExtraSchema
});

RobotSchema.index({ "name" : 1, "category" : 1 }, { unique : true })

// return the model
var Robot = module.exports = mongoose.model('Robot', RobotSchema);

Robot.ensureIndexes(function (err) {
  console.log('ENSURE INDEX')
  if (err) console.log(err)
})

Robot.on('index', function (err) {
  console.log('ON INDEX')
  if (err) console.log(err)
})
