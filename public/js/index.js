var socket = io();

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disonnected from server');
});

socket.on('sendInfo', function(data) {
  console.log('Send info', data);
  $('#rival-data').html('<b>X Coordinate</b>: ' + data.pointX + '<br><b>Y Coordinate</b>: ' + data.pointY + '<br><b>Score</b>: ' + data.score);
});

socket.on('notification', function(data) {
  console.log('Notification', data);
});

$('#rival-data-form').on('submit', function (e) {
  e.preventDefault();

  socket.emit('getInfo', {
    pointX: $('[name=point-x]').val(),
    pointY: $('[name=point-y]').val(),
    score: $('[name=score]').val()
  }, function() {

  });
});
