var mysql = require('mysql');
var request = require('request');
var _ = require('underscore');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Robos5372317!',
    database: 'scouting2016',
    debug: true
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

function getEventsCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var result = JSON.parse(body);
        _.each(result.Schedule, function (match) {
            console.log('Importing '+match.matchNumber);
            connection.query('INSERT INTO matches SET match_number='+match.matchNumber+', match_type="q", event_id=4, red1='+match.Teams[0].teamNumber+',red2='+match.Teams[1].teamNumber+',red3='+match.Teams[2].teamNumber+',blue1='+match.Teams[3].teamNumber+',blue2='+match.Teams[4].teamNumber+',blue3='+match.Teams[5].teamNumber+',starttime=0', function (err, result) {
                if (err) {
                    console.log('failed ' + match);
                } else {
                    console.log('inserted ' + match.matchNumber);
                }

            });
        });
    }
}

request({
    'url': apiRoot + '/' + season + '/schedule/arlr/?tournamentLevel=qual+D6E30E76-03E5-4898-83AD-2FC5E2744D7C',
    'auth': auth,
    'headers': {
        'Accept': 'application/json'
    }
}, getEventsCallback);