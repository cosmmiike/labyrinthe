var socket = io();

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disonnected from server');
});

socket.on('sendInfo', function(data) {
  console.log('Send info', data);
  $('#rival_name').text(data.pointX + ' ' + data.pointY);
  $('#compte-2').text(data.score);
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
    $('[name=point-x]').val('');
    $('[name=point-y]').val('');
    $('[name=score]').val('');
  });
});
