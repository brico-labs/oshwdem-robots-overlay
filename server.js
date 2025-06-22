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

// Retry mongo connection function
const connectWithRetry = () => {
  mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection unsuccessful, retrying in 5 seconds...', err);
    setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
  });
};

// Call the retry connection
connectWithRetry();

var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

app.use(express.static(__dirname + '/public'));

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

app.listen(config.port, config.url);
console.log('Magic happens at '+ config.url +' on port ' + config.port);
