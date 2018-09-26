'use strict';

// listing all imports
let express = require('express');
let bodyParser = require('body-parser');
let dbjs = require('./db');

// database setup
let db = null;
dbjs.initDB(function(database) {
	db = database;
});

// express setup
let app = express();
app.set('port', 8080);
app.use(express.static(__dirname + '/public')); // css and js
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
	console.log('GET /');
	response.send('heyy');
});

// Listening on localhost:8080
app.listen(app.get('port'), function() {
	console.log("App running on localhost:", app.get('port'));
});