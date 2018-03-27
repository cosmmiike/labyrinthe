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
  console.log('New user connected', io.engine.clientsCount);
  io.emit('usercount', {num: io.engine.clientsCount});
  socket.emit('player number', {num: io.engine.clientsCount});

  socket.on('disconnect', function() {
    console.log('User was disconnected', io.engine.clientsCount);
    io.emit('usercount', {num: io.engine.clientsCount});
    io.emit('hide points', {num: io.engine.clientsCount});
  });

  socket.on('getMaze', function(num) {
    console.log('Get maze', num);
    io.emit('sendMaze', {mazeNumber: num});
  });

  socket.on('getInfo', function(data) {
    // console.log('Get info', data);
    socket.broadcast.emit('sendInfo', generateData(data.pointX, data.pointY, data.score));
  });

});

server.listen(port, function() {
  console.log('Server is up on port ' + port);
});
