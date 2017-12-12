var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var JefNode = require('json-easy-filter').JefNode;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var request = require('request');
var prettyjson = require('prettyjson');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.get('/clubs', function(req, res, next) {
  // request({
  //   uri: 'https://raw.githubusercontent.com/opendatajson/football.json/master/2015-16/en.1.clubs.json'
  var start = Date.now()
	request('https://raw.githubusercontent.com/opendatajson/football.json/master/2016-17/en.1.clubs.json', function (error, response, body){
		// var o = JSON.parse(body);
  //   o.clubs.forEach(function(e){
  //     res.write(e.name +  "\n")
  //   })
  //   res.end()
    res.render('index', {title: "EPL", epl: JSON.parse(body)})
	})

});

app.get('/matches/:club', function(req, res, next) {
  // request({
  //   uri: 'https://raw.githubusercontent.com/opendatajson/football.json/master/2015-16/en.1.clubs.json'
  var start = Date.now()

  request('https://raw.githubusercontent.com/opendatajson/football.json/master/2016-17/en.1.json', function (error, response, body){
    // var o = JSON.parse(body);
  //   o.clubs.forEach(function(e){
  //     res.write(e.name +  "\n")
  //   })
  //   res.end()

    
    var rounds = JSON.parse(body).rounds;
    var opponents = []

    rounds.forEach(function(round){
      round.matches.forEach(function(match){

        if(match.team1.key == req.params.club){
          var opp = match.team2;
        }

        if (match.team2.key == req.params.club){
          var opp = match.team1;
        }

        if(opp){
          // opponents.push(JSON.stringify(opp));
          opponents.push(opp);
        }

      });
    });

    var oo = {opponents: opponents};
    console.log(prettyjson.render(oo, {noColor: true}))    


    // opponents.forEach(function(opp){
    //   res.write(prettyjson.render(opp) + "\n");
    //   console.log(prettyjson.render(opp, {noColor: true}))
    // });
    res.write(prettyjson.render(oo, {noColor: true}));
    res.end();
    // res.send(body)
    // res.send(matches)
  })

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
