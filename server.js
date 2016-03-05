var express = require('express')
  , http = require('http');
var mysql = require('mysql');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var _ = require('underscore');

var connected_users = [];

var mysql      = require('mysql');


var pool  = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "Robos5372317!",
	database: "scouting2016"
});

function Shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

io.on('connect',function(socket){
   console.log('connected'); 
    
   socket.on('GetCurrent_match', function (data) {
       pool.getConnection(function (err, connection) {
           connection.query('SELECT * FROM matches', function (err, rows, fields) {
               if (err) throw err;
               io.to('admin').emit('response', { 'response': 'CurrentMatch', 'data': rows[0] });
               console.log('The solution is: ', rows[0]);
           });
           connection.release();
       });
    });
    
    socket.on('next_match', function (data) {
        pool.getConnection(function (err, connection) {
            connection.query('SELECT * FROM matches WHERE match_number="' + data + '"', function (err, rows, fields) {
                connection.end();
                if (err) throw err;
                if (rows[0] !== undefined) {
                    io.to('admin').emit('response', { 'response': 'NextMatch', 'data': rows[0] });
                } else {
                    io.to('admin').emit('response', { 'response': 'NextMatch', 'data': 'null' });
                }
                console.log('The solution is: ', rows[0]);
            });
            connection.release();
        });
    });
    socket.on('prev_match', function (data) {
        pool.getConnection(function (err, connection) {
            connection.query('SELECT * FROM matches WHERE match_number="' + data + '"', function (err, rows, fields) {
                if (err) throw err;
                io.to('admin').emit('response', { 'response': 'NextMatch', 'data': rows[0] });
                console.log('The solution is: ', rows[0]);
                connection.release();
            });
        });
    });
    
    
    socket.on('logout',function(data){
       console.log(connected_users[data]); 
        fn = connected_users[data].fN;
        ln = connected_users[data].lN;
        
        io.to(fn+'_'+ln).emit('scouter_disconnect',true)
       connected_users.splice(data,1);
    });
    
    socket.on('scouter_connect',function(data){
       console.log(data.fN);
        socket.join(data.fN+'_'+data.lN);
        connected_users.push(data);
        console.log(connected_users.length);
        io.to('admin').emit('connected_user',connected_users);
    });
    
    socket.on('subscribe',function(room){
       console.log(room);
       socket.join(room);
        if(room == 'admin'){
            io.to('admin').emit('connected_user',connected_users);
        }
    });
    //define location of robot
    function locationConverter(locationName, alliance) {
        if (alliance == 'red') {
            //seceret passage and brattice
            if (locationName == 'BB') { locationId = 14; }
            if (locationName == 'BP') { locationId = 2; }
            if (locationName == 'RB') { locationId = 14; }
            if (locationName == 'RP') { locationId = 1; }
            //tower left center right
            if (locationName == 'BTL' || locationName == 'RTL') { locationId = 19; }
            if (locationName == 'BTC' || locationName == 'RTC') { locationId = 18; }
            if (locationName == 'BTR' || locationName == 'RTR') { locationId = 17; }
            //Neutral Zones////// NN is left //// FN is right
            if (locationName == 'NN') { locationId = 15; }
            if (locationName == 'FN') { locationId = 16; }
            //Own Defenses
            if (locationName == 'R1') { locationId = 4; }
            if (locationName == 'R2') { locationId = 5; }
            if (locationName == 'R3') { locationId = 6; }
            if (locationName == 'R4') { locationId = 7; }
            if (locationName == 'R5') { locationId = 8; }
            //opponent defenses
            if (locationName == 'B1') { locationId = 9; }
            if (locationName == 'B2') { locationId = 10; }
            if (locationName == 'B3') { locationId = 11; }
            if (locationName == 'B4') { locationId = 12; }
            if (locationName == 'B5') { locationId = 13; }

        } else {
            //seceret passage and brattice
            if (locationName == 'RB') { locationId = 14; }
            if (locationName == 'RP') { locationId = 2; }
            if (locationName == 'BB') { locationId = 14; }
            if (locationName == 'BP') { locationId = 1; }
            //tower left center right
            if (locationName == 'BTL' || locationName == 'RTL') { locationId = 19; }
            if (locationName == 'BTC' || locationName == 'RTC') { locationId = 18; }
            if (locationName == 'BTR' || locationName == 'RTR') { locationId = 17; }
            //Neutral Zones////// NN is left //// FN is right
            if (locationName == 'NN') { locationId = 15; }
            if (locationName == 'FN') { locationId = 16; }
            //Oppenent Defenses
            if (locationName == 'R1') { locationId = 9; }
            if (locationName == 'R2') { locationId = 10; }
            if (locationName == 'R3') { locationId = 11; }
            if (locationName == 'R4') { locationId = 12; }
            if (locationName == 'R5') { locationId = 13; }
            //Own defenses
            if (locationName == 'B1') { locationId = 4; }
            if (locationName == 'B2') { locationId = 5; }
            if (locationName == 'B3') { locationId = 6; }
            if (locationName == 'B4') { locationId = 7; }
            if (locationName == 'B5') { locationId = 8; }
        }
        return locationId;
    }
    function defenseCross(pos, alliance, defenses) {
        if (pos >= 4 && pos <= 8) {
            console.log('own defense');
            //narrow down to what defense
            pos = pos - 3;
            var type = 0;
            _.each(defenses, function (d, loc) {
                //console.log(d);
                if (loc == alliance + pos) {
                    //narrow down to action type
                    console.log(d);
                    if (d == 'Portcullis') { type = 6 }
                    if (d == 'Cheval de Frise') { type = 7 }
                    if (d == 'Moat') { type = 8 }
                    if (d == 'Ramparts') { type = 9 }
                    if (d == 'Drawbridge') { type = 10 }
                    if (d == 'Sally Port') { type = 11 }
                    if (d == 'Rock Wall') { type = 12 }
                    if (d == 'Rough Terrain') { type = 13 }
                    if (d == 'Low Bar') { type = 14 }
                    
                }
            });
            return type;
        } else {
            console.log('opponent defense');
            //narrow down to what defense
            pos = pos - 8;
            var type = 0;
            _.each(defenses, function (d, loc) {
                //console.log(d);
                if (loc == alliance + pos) {
                    //narrow down to action type
                    console.log(d);
                    if (d == 'Portcullis') { type = 6 }
                    if (d == 'Cheval de Frise') { type = 7 }
                    if (d == 'Moat') { type = 8 }
                    if (d == 'Ramparts') { type = 9 }
                    if (d == 'Drawbridge') { type = 10 }
                    if (d == 'Sally Port') { type = 11 }
                    if (d == 'Rock Wall') { type = 12 }
                    if (d == 'Rough Terrain') { type = 13 }
                    if (d == 'Low Bar') { type = 14 }

                }
            });
            return type;
        }
        
        
    }
    socket.on('submit_event', function (data) {
        data = JSON.parse(data);
        console.log(data);
        //define some basic vars
        match_id = data.match_info.current_match.match_id;
        match_num = data.match_info.current_match.match_num;
        scouting_team = data.scouting_team.number;
        scouting_alliance = data.scouting_team.alliance;
        //

        //put some logic on this thing
        robotPos = locationConverter(data.location, scouting_alliance);
        //if defenses
        if (data.defense_action.crossed == true) {
            //robot is crossing a defense
            //figure out which defense
            action = defenseCross(robotPos, scouting_alliance, data.match_info.defenses);
            console.log(action);
        }else if(data.defense_action.reached){
            //challange
            action = 4;
        } else if (data.tower.climb) {
            action = 16;
        } else if (data.tower.challenge) {
            action = 15;
        } else if (data.tower.high_goal) {
            action = 2;
        } else if (data.tower.low_goal) {
            action = 3;
        } else if (data.robot_actions.defended) {
            action = 18;
        } else if (data.robot_actions.collect) {
            action = 5;
        } else if (data.robot_actions.passed) {
            action = 17;
        }
        if(data.success){
            success = 1;
        }else{
            success = 0;
        }
        console.log(robotPos);
        match_time = data.time;

        pool.getConnection(function (err, connection) {
            connection.query('INSERT INTO match_actions (match_id,action_id,team_number,match_time,location_id,successful) VALUES("' + match_id + '","' + action + '","' + scouting_team + '","' + match_time + '","' + robotPos + '","' + success + '")', function (err, rows, fields) {
                console.log(err);
            });
            connection.release();
        });

    });
    //defense type function

    function defense_type(type) {
        if (type == 'A-1') { title = 'Portcullis'; }
        if (type == 'A-2') { title = 'Cheval de Frise'; }
        if (type == 'B-1') { title = 'Moat'; }
        if (type == 'B-2') { title = 'Ramparts' }
        if (type == 'C-1') { title = 'Drawbridge'; }
        if (type == 'C-2') { title = 'Sally Port' }
        if (type == 'D-1') { title = 'Rock Wall'; }
        if (type == 'D-2') { title = 'Rough Terrain'; }
        if (type == 'lowbar') { title = 'Low Bar'; }
        return title;
    }
    
    socket.on('prepare_match', function (data) {
       console.log(data);
        teams = [];
        teams.push({'number':data.current_match.blue1,'alliance':'blue'});
        teams.push({ 'number': data.current_match.blue2, 'alliance': 'blue' });
        teams.push({ 'number': data.current_match.blue3, 'alliance': 'blue' });
        teams.push({ 'number': data.current_match.red1, 'alliance': 'red' });
        teams.push({ 'number': data.current_match.red2, 'alliance': 'red' });
        teams.push({ 'number': data.current_match.red3, 'alliance': 'red' });
        Shuffle(teams);
        i = 1;
        defenses = {};
        _.each(data.defenses, function (defenseType) {
            if (i > 5) { type = 'blue' } else { type = 'red' }
 
            defenseType = defense_type(defenseType);
            if (i > 5) {
                pos = i - 5;
                type = 'blue'
            } else {
                pos = i;
                type = 'red';
            }
            defenses[type + pos] = defenseType;
            i++;
        });

        //this has issues with double repeating
        active = false;
        socket.on('start_match', function (data) {
            if (data == 'true') {
                //some how this logic works... I don't know why
                //but hey, it works!
                if (active == false) {
                    active = true;
                    console.log(connected_users.length);
                    connected_users.forEach(function (user) {
                        fn = user.fN;
                        ln = user.lN;
                        //console.log(fn+' starting');
                        io.to(fn + '_' + ln).emit('start_match', 'true');
                    });
                }
            }
        });

        socket.on('stop_match', function (data) {
            connected_users.forEach(function (users) {
                fn = users.fN;
                ln = users.lN;
                io.to(fn+'_'+ln).emit('stop_match','true');
            });
        });

        //console.log(defenses);
        data.defenses = defenses;
        console.log(connected_users);
        i2 = 0;
        connected_users.forEach(function (user) {
                fn = user.fN;
                ln = user.lN;
                console.log(fn);
                io.to(fn + '_' + ln).emit('prepare_match', { 'response': data, 'scouting_team': teams[i2] });

            i2++;
        });
        
        //console.log(teams);
        
    });
    
});

var root = "C:\wamp64\www";

app.use('/images', express.static(__dirname + '/images'));
app.use('/scouting', express.static(__dirname + '/scouting'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

app.get('/', function (req, res, next) {
    console.log(req.app.server);
    res.sendfile('./scouting/index.html');
});
app.get('/admin', function (req, res, next) {
    console.log(req.app.server);
    res.sendfile('./index.html');
});


server.listen('80', function () {
    console.log('Server on port 80');
});
