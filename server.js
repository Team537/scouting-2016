var express = require('express')
  , http = require('http');
var mysql = require('mysql');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var connected_users = [];

var mysql      = require('mysql');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password: 'Robots537',
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
    
    socket.on('next_match',function(data){
        connection.query('SELECT * FROM matches WHERE matchno="'+data+'"', function(err, rows, fields) {
          if (err) throw err;
          if(rows[0] !== undefined){
            io.to('admin').emit('response',{'response':'NextMatch','data':rows[0]});
          }else{
              io.to('admin').emit('response',{'response':'NextMatch','data':'null'});
          }
          console.log('The solution is: ', rows[0]);
        });        
    });
    socket.on('prev_match',function(data){
        connection.query('SELECT * FROM matches WHERE matchno="'+data+'"', function(err, rows, fields) {
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
    
    
    socket.on('prepare_match',function(data){
        teams = [];
        teams.push({'number':data.current_match.blue1,'alliance':'blue'});
        teams.push({ 'number': data.current_match.blue2, 'alliance': 'blue' });
        teams.push({ 'number': data.current_match.blue3, 'alliance': 'blue' });
        teams.push({ 'number': data.current_match.red1, 'alliance': 'red' });
        teams.push({ 'number': data.current_match.red2, 'alliance': 'red' });
        teams.push({ 'number': data.current_match.red3, 'alliance': 'red' });
        Shuffle(teams);
       i=0;
       while(i <= 5){
           if(connected_users[i]){
               fn = connected_users[i].fN;
               ln = connected_users[i].lN;
               console.log(teams[i]);
               io.to(fn+'_'+ln).emit('prepare_match',{'response':data,'scouting_team':teams[i]});
           }
           
           i++;
       }
        
        console.log(teams);
        
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
