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
  // if (io.engine.clientsCount === 1) {
  //
  // }

  function updateMaze() {
    io.sockets.emit('User count', {num: io.engine.clientsCount});
  }


  console.log('New user connected', io.engine.clientsCount);
  io.emit('User count', {num: io.engine.clientsCount});

  socket.emit('playerNumber', {number: io.engine.clientsCount});

  socket.emit('notification', generateNotification('Welcome to the LABYRINTHE App'));
  socket.broadcast.emit('notification', generateNotification('New user joined'));

  socket.on('getMaze', function(num) {
    console.log('Get maze', num);
    io.emit('sendMaze', {mazeNumber: num});
  });

  socket.on('getInfo', function(data, callback) {
    console.log('Get info', data);
    io.emit('sendInfo', generateData(data.pointX, data.pointY, data.score));
    callback('This is from the server');
  });

  socket.on('disconnect', function() {
    console.log('User was disconnected', io.engine.clientsCount);
    updateMaze();
  });
});

server.listen(port, function() {
  console.log('Server is up on port ' + port);
});
