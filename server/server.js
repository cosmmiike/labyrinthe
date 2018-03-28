var path = require('path');
var http = require('http');
var express = require('express');
var socketIO = require('socket.io');

var {generateData} = require('./utils/data');
var {generateNotification} = require('./utils/notification');
var publicPath = path.join(__dirname, '/../public');
var port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var users = [];

app.use(express.static(publicPath));

io.on('connection', function(socket) {
  n_users = io.engine.clientsCount;
  console.log('New user connected', n_users);
  io.emit('usercount', {num: n_users});
  socket.emit('player number', {num: n_users});

  socket.on('disconnect', function() {
    console.log('User was disconnected', io.engine.clientsCount);
    io.emit('usercount', {num: io.engine.clientsCount});
    io.emit('disconnection');
  });

  socket.on('getMaze', function(num) {
    console.log('Get maze', num);
    io.emit('sendMaze', {mazeNumber: num});
  });

  socket.on('getInfo', function(data) {
    // console.log('Get info', data);
    socket.broadcast.emit('sendInfo', generateData(data.pointX, data.pointY, data.score));
  });

  socket.on('reset coordanates', function() {
    io.emit('reset');
  });

  socket.on('end of maze', function(data) {
    socket.emit('send result');
    socket.broadcast.emit('send end message', data);
  });
});

server.listen(port, function() {
  console.log('Server is up on port ' + port);
});
