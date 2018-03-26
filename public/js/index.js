var socket = io();

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disonnected from server');
});

socket.on('sendInfo', function(data) {
  console.log('Send info', data);
});

socket.on('notification', function(data) {
  console.log('Notification', data);
});
