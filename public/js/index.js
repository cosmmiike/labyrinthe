var socket = io();

socket.on('connect', function() {
  console.log('Connected to server');

  socket.emit('getInfo', {
    pointX: 552,
    pointY: 34,
    score: 836
  });
});

socket.on('disconnect', function() {
  console.log('Disonnected from server');
});

socket.on('sendInfo', function(data) {
  console.log('Send info', data);
});
