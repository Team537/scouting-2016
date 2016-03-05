var express = require('express')
  , http = require('http');
var mysql = require('mysql');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var _ = require('underscore');

var connected_users = [];

var mysql      = require('mysql');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password: 'Robos5372317!',
  database : 'scouting2016'
});

function Shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

io.on('connect',function(socket){
   console.log('connected'); 
    
    socket.on('GetCurrent_match',function(data){
        connection.query('SELECT * FROM matches', function(err, rows, fields) {
          if (err) throw err;
          io.to('admin').emit('response',{'response':'CurrentMatch','data':rows[0]});
          console.log('The solution is: ', rows[0]);
        });
    });
    
    socket.on('next_match', function (data) {
        connection.query('SELECT * FROM matches WHERE match_number="' + data + '"', function (err, rows, fields) {
            
          if (err) throw err;
          if(rows[0] !== undefined){
            io.to('admin').emit('response',{'response':'NextMatch','data':rows[0]});
          }else{
              io.to('admin').emit('response',{'response':'NextMatch','data':'null'});
          }
          console.log('The solution is: ', rows[0]);
        });        
    });
    socket.on('prev_match', function (data) {
        connection.query('SELECT * FROM matches WHERE match_number="' + data + '"', function (err, rows, fields) {
            
          if (err) throw err;
          io.to('admin').emit('response',{'response':'NextMatch','data':rows[0]});
          console.log('The solution is: ', rows[0]);
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
