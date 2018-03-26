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

app.use(express.static(publicPath));

io.on('connection', function(socket) {
  console.log('New user connected');

  socket.emit('notification', generateNotification('Welcome to the LABYRINTHE App'));
  socket.broadcast.emit('notification', generateNotification('New user joined'));

  socket.on('getInfo', function(data) {
    console.log('Get info', data);
    io.emit('sendInfo', generateData(data.pointX, data.pointY, data.score));
  });

  socket.on('disconnect', function() {
    console.log('User was disconnected');
  });
});

server.listen(port, function() {
  console.log('Server is up on port ' + port);
});
