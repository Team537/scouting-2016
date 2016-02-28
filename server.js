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
  password : '',
  database: 'scouting2016',
    debug: true
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
          console.log('Response:  ', rows[0]);
        });
    });
    
    socket.on('next_match',function(data){
        connection.query('SELECT * FROM matches WHERE match_number="'+data+'"', function(err, rows, fields) {
          if (err) throw err;
          if(rows[0] !== undefined){
            io.to('admin').emit('response',{'response':'NextMatch','data':rows[0]});
          }else{
              io.to('admin').emit('response',{'response':'NextMatch','data':'null'});
          }
          console.log('Response:  ', rows[0]);
        });        
    });
    socket.on('prev_match',function(data){
        connection.query('SELECT * FROM matches WHERE match_number="'+data+'"', function(err, rows, fields) {
          if (err) throw err;
          io.to('admin').emit('response',{'response':'NextMatch','data':rows[0]});
          console.log('Response:  ', rows[0]);
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
        teams.push(data.current_match.blue1);
        teams.push(data.current_match.blue2);
        teams.push(data.current_match.blue3);
        teams.push(data.current_match.red1);
        teams.push(data.current_match.red2);
        teams.push(data.current_match.red3);
        Shuffle(teams);
       i=0;
       while(i <= 5){
           console.log(teams[i]);
           if(connected_users[i]){
            fn = connected_users[i].fN;
            ln = connected_users[i].lN;
            io.to(fn+'_'+ln).emit('prepare_match',data);
           }
           
           i++;
       }
        
        console.log(teams);
        
    });
    
});

app.use('/images', express.static(__dirname + '/images'));
app.use('/scouting', express.static(__dirname + '/scouting'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

app.get('/', function (req, res, next) {
    console.log('sent file');
    res.sendfile('./scouting/index.html');
});
app.get('/admin', function (req, res, next) {
    console.log('');
    res.sendfile('./index.html');
});


server.listen('80', function () {
    console.log('Server on port 80');
});
