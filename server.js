var express    = require('express');
var app        = express();
var mongoose 	 = require('mongoose');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var config     = require('./config');
var path     = require('path');

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

var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

app.use(express.static(__dirname + '/public'));

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(config.port);
console.log('Magic happens on port ' + config.port);
