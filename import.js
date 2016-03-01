var mysql = require('mysql');
var request = require('request');
var _ = require('underscore');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Robots537',
  database : 'scouting2016'
});

connection.connect();

// setup
var season = 2016;
var apiRoot = 'https://frc-api.firstinspires.org/v2.0';
var auth = {
    'user': '',
    'pass': '',
    'sendImmediately': false
};

// events import
function getEventsCallback(error, response, body) {    
    if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        _.each(result.Events, insertEvent);
    }
}

function insertEvent(value, index) {
    console.log('inserting ' + value.name)
    connection.query('INSERT INTO events SET ?', { 
        'event_code': value.code, 
        'event_name': value.name,
        'event_year': season,
        'start_date': value.dateStart
    }, function(err, result) {
        if (err.code == 'ER_DUP_ENTRY') {
            console.log('failed ' + value.code);
        } else {
            console.log('inserted ' + value.code);
        }                
        
        getTeamsForEvent(value.code, 1);
    });
}

function getEvents()
{    
    request({
        'url': apiRoot + '/' + season + '/events/?excludeDistrict=true',
        'auth': auth,
        'headers': {
            'Accept': 'application/json'
        }
    }, getEventsCallback);
}

// get teams
function insertTeam(team, eventCode) {
    console.log(team.teamNumber + eventCode);
    connection.query('INSERT INTO teams SET ?', { 
        'team_number': team.teamNumber, 
        'team_name': team.nameShort
    }, function(err, result) {
        if (err != null && err.code == 'ER_DUP_ENTRY') {
            console.log('failed ' + team.teamNumber);
        } else {
            console.log('inserted ' + team.teamNumber);
        }
    });
}

function getTeamsCallback(error, response, body, eventCode) {    
    if (!error && response.statusCode == 200) {
        var teamsResult = JSON.parse(body);
        if (teamsResult.pageCurrent < teamsResult.pageTotal) {
            getTeamsForEvent(eventCode, teamsResult.pageCurrent++)
        };
        _.each(teamsResult.teams, function(value) {
            insertTeam(value, eventCode);
        });
    }
}

function getTeamsForEvent(eventCode, pageNumber)
{
    console.log('getting teams: ' + eventCode)
    request({
        'url': apiRoot + '/' + season + '/teams?eventCode=' + eventCode + '&page=' + pageNumber,
        'auth': auth,
        'headers': {
            'Accept': 'application/json'
        }
    }, function(error, response, body) {
        getTeamsCallback(error, response, body, eventCode);
    });
}


// cleanup
function cleanUp()
{
    connection.end();
}

getEvents();