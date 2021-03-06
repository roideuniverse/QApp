var express = require("express");
var app = express();
var MemoryStore = require('connect').session.MemoryStore;
var dbPath = 'mongodb://localhost/QApp';

// Import the data layer
var mongoose = require('mongoose');

// Import the tech table
var models = {
	TechnologysList: require('./models/TechnologysList')(mongoose)
};

app.configure(function () {
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));
	app.use(express.limit('1mb'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: "QApp",
		store: new MemoryStore()
	}));
	mongoose.connect(dbPath, function onMongooseError(err) {
		if (err) throw err;
	});
});

/*
 * Loads QASystem/views/index.jade file
 * /index.jade file loads a) 'QASystem/public/js/boot', b) QASystem/public/js/libs/require.js'
 * public/js/boot.js loads QASystem/public/js/QApp.js
 * public/js/QApp.js loads public/js/router.js
 * public/js/QApp.js sets window.location.hash = 'index' which triggers the router to load routes:index
 * public/js/router.js loads a)public/js/views/index.js and b) public/js/models/techCollection.js
 * Browser then displays the view index.js
 */
app.get('/', function (req, res) {
	console.log("app.js::app.get /");
	res.render('index.jade');
});

/*
  After all booting is done by "/" address "/index" will be loaded as view page
*/
app.get('/index', function (req, res) {
	console.log("app.js::app.get /index");
	models.TechnologysList.populateTech(function (docs) {
		res.send(docs);
	});
});

/*
  This will serve pages which has subtechnology as parameter
*/
app.get('/index/:subtechnology', function (req, res) {
	var subtechnology = req.params.subtechnology;
	models.TechnologysList.findQuesBySubtech(subtechnology, function (docs) {
		//console.log("isnide app.js");
		//console.log(docs);
		res.send(docs);
	});
});

app.get('/reviewquestions', function (req, res) {
	models.TechnologysList.question(function (docs) {
		//console.log(docs);
		res.send(docs);
	});
});

app.get('/subtechnologies', function (req, res) {
	models.TechnologysList.getSubtechnologies(function (docs) {
		//console.log(docs);
		res.send(docs);
	});
});

/*
  This is requested by ajax request in index.js view in "updatequestion" method
*/
app.post('/questionsubmit', function (req, res) {
	//console.log(req.param('subtechnology',[]));
	models.TechnologysList.questionInsert(req.param('subtechnology', []), req.param('question', ''), req.param('answer', ''),
		req.param('difficultylevel'), req.param('conceptscore'), req.param('importancescore'), function (success) {
			if (success == true) {
				res.send(200);
				console.log('sucess in inserting question in questionbank');
			} else {
				console.log("failed in inserting question in questionbank")
			}
		}
	);
});

app.listen(8080);
console.log("listening to port 8080.");