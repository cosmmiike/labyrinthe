var path = require('path');
var http = require('http');
var express = require('express');
var socketIO = require('socket.io');

var publicPath = path.join(__dirname, '/../public');
var port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', function(socket) {
  console.log('New user connected');

  socket.emit('notification', {
    text: 'Welcome to the LABYRINTH App',
    time: new Date().getTime()
  });

  socket.broadcast.emit('notification', {
    text: 'New user joined',
    time: new Date().getTime()
  });

  socket.on('getInfo', function(data) {
    console.log('Get info', data);
    io.emit('sendInfo', {
      pointX: data.pointX,
      pointY: data.pointY,
      score: data.score
    });
  });

  socket.on('disconnect', function() {
    console.log('User was disconnected');
  });
});

server.listen(port, function() {
  console.log('Server is up on port ' + port);
});
