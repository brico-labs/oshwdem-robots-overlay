var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Robot = require('../models/robot');

var RaceSchema = new Schema({
    robots: [{type: mongoose.Schema.Types.ObjectId, ref: 'Robot'}],
    category: {type: String, required: true }
  });
  
RaceSchema.index({ "category" : 1 }, { unique : true })

// return the model
var Race = module.exports = mongoose.model('Race', RaceSchema);

Race.on('index', function (err) {
if (err) console.log(err)
})
  