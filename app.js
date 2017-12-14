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
var converter = require('number-to-words');


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

app.get('/api/matches/:club/:season', function(req, res, next) {
  var s = req.params.season;

  request('https://raw.githubusercontent.com/opendatajson/football.json/master/' + s +'/en.1.json', function (error, response, body){

    var rounds = JSON.parse(body).rounds;
    var stats = getResults(rounds, req.params.club);

    var o = [];
    for(var key in stats){
      o.push({type: key, number: stats[key]});
    }
    
    // res.send(o);

    var matches = {}

    var homeGoals = 0, awayGoals = 0;

    rounds.forEach(function(round){
      round.matches.forEach(function(match){

        if(match.team1.key == req.params.club){
          homeGoals += match.score1;
        }

        if (match.team2.key == req.params.club){
          awayGoals += match.score2;
        }

      });
    });
    var p = [{type: "home", number: homeGoals}, {type: "away", number: awayGoals}];

    var q = {games: o, goals: p};

    res.send(q);

  });
});

app.get('/api/goals/:club/:season', function(req, res, next) {
  var s = req.params.season;

  request('https://raw.githubusercontent.com/opendatajson/football.json/master/' + s +'/en.1.json', function (error, response, body){

    var rounds = JSON.parse(body).rounds;
    var matches = {}

    var homeGoals = 0, awayGoals = 0;

    rounds.forEach(function(round){
      round.matches.forEach(function(match){

        if(match.team1.key == req.params.club){
          homeGoals += match.score1;
        }

        if (match.team2.key == req.params.club){
          awayGoals += match.score2;
        }

      });
    });
    var o = [{type: "home", number: homeGoals}, {type: "away", number: awayGoals}];
    
    res.send(o);

  });
});

app.get('/matches/:club/:season', function(req, res, next) {
  // request({
  //   uri: 'https://raw.githubusercontent.com/opendatajson/football.json/master/2015-16/en.1.clubs.json'
  var start = Date.now()

  var s = req.params.season;

  request('https://raw.githubusercontent.com/opendatajson/football.json/master/' + s +'/en.1.json', function (error, response, body){
    // var o = JSON.parse(body);
  //   o.clubs.forEach(function(e){
  //     res.write(e.name +  "\n")
  //   })
  //   res.end()

    
    var rounds = JSON.parse(body).rounds;
    var matches = {}

    rounds.forEach(function(round){
      round.matches.forEach(function(match){

        if(match.team1.key == req.params.club){
          match.name = round.name;

          if(!(match.team2.key in matches)){
            matches[match.team2.key] = {}
            matches[match.team2.key].aggGoalsFor = match.score1
            matches[match.team2.key].aggGoalsAgainst = match.score2
            matches[match.team2.key].matches = []
          }else{
            matches[match.team2.key].aggGoalsFor += match.score1
            matches[match.team2.key].aggGoalsAgainst += match.score2
          }

          matches[match.team2.key].matches.push(match)
          var saved = match
        }

        if (match.team2.key == req.params.club){
          match.name = round.name

          if(!(match.team1.key in matches)){
            matches[match.team1.key] = {}
            matches[match.team1.key].aggGoalsFor = match.score2
            matches[match.team1.key].aggGoalsAgainst = match.score1
            matches[match.team1.key].matches = []
          }else{
            matches[match.team1.key].aggGoalsFor += match.score2
            matches[match.team1.key].aggGoalsAgainst += match.score1
          }

          matches[match.team1.key].matches.push(match)
          var saved = match
        }

        // if(saved){
        //   matches.push(match);
        // }

      });
    });

    var stats = getResults(rounds, req.params.club);


    // for(var k in matches){
    //   var match = matches[k]

      // if(match.aggGoalsFor > match.aggGoalsAgainst){
      //   stats.win++;
      // }else if(match.aggGoalsFor < match.aggGoalsAgainst){
      //   stats.lose++;
      // }else{
      //   stats.draw++;
      // }
    // }

    stats.matches = matches;

    // var oo = {opponents: opponents};
    // console.log(prettyjson.render(oo, {noColor: true}))    


    // opponents.forEach(function(opp){
    //   res.write(prettyjson.render(opp) + "\n");
    //   console.log(prettyjson.render(opp, {noColor: true}))
    // });

    var seasons = {seasons: ['2015-16', '2014-15', '2013-14', '2012-13', '2011-12']};
    res.render('matches', {club: req.params.club, season: req.params.season, seasons: seasons, stats: stats, converter: converter});
  })

});

function getResults(rounds, club){
  var stats = {win: 0, lose: 0, draw: 0}

    rounds.forEach(function(round){
      round.matches.forEach(function(match){
        if(match.team1.key == club){
          if(match.score1 > match.score2){
            stats.win++;
          }else if(match.score2 > match.score1){
            stats.lose++;
          }else{
            stats.draw++;
          }
        }

        if(match.team2.key == club){
          if(match.score1 > match.score2){
            stats.lose++;
          }else if(match.score2 > match.score1){
            stats.win++;
          }else{
            stats.draw++;
          }
        }
      });
    });

    return stats;
}

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
