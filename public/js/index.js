var socket = io();
var pl;

class Player {
  constructor(number) {
    this.number = number;
    if (this.number == 1) {
      this.startX = 148;
      this.startY = 3;
      this.startX_rival = 164;
      this.startY_rival = 310;
    }
    if (this.number == 2) {
      this.startX = 164;
      this.startY = 310;
      this.startX_rival = 148;
      this.startY_rival = 3;
    }
  }
}

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disonnected from server');
});

socket.on('usercount', function(pnum) {
  setMaze(pnum);
});

socket.on('playerNumber', function(pnum) {
  console.log('Player number', pnum.number);
  $('#compte-2').text(pnum.number);
  pl = new Player(pnum.number);
  setMaze(pnum.number);
});

socket.on('sendMaze', function(mnum) {
  console.log('Send maze', mnum.mazeNumber.mazeNumber);
  var maze = "/img/maze-" + mnum.mazeNumber.mazeNumber + ".png";
  drawMaze(maze, pl);
  $('#wait-message').html('');
});

socket.on('sendInfo', function(data) {
  console.log('Send info', data);
  $('#rival_name').text(data.pointX + ' ' + data.pointY);
  // $('#compte-2').text(data.score);
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















var dx = 0, dy = 0;
var maze_num = 1;

window.onload = function(){
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
};

function drawMaze(mazeFile, player) {

  dx = 0;
	dy = 0;

	var imgMaze = new Image();
	imgMaze.onload = function() {
		canvas.width = imgMaze.width;
		canvas.height = imgMaze.height;

		context.drawImage(imgMaze, 0,0);

		x1 = pl.startX; y1 = pl.startY;
    x2 = pl.startX_rival; y2 = pl.startY_rival;

		var imgFace1 = document.getElementById("face1");
		context.drawImage(imgFace1, x1, y1);
    var imgFace2 = document.getElementById("face2");
		context.drawImage(imgFace2, x2, y2);

		context.stroke();
	};
	imgMaze.src = mazeFile;
}

function setMaze(number) {
  if (number === 1) {
    $('canvas').hide();
    // $('#wait-message').show();
    $('#wait-message').html('MERCI POUR ATTENDER LE JOUEUR 2');
  } else {
    // $('#wait-message').hide();
    $('canvas').show();
    maze_num = 1 - 0.5 + Math.random() * (20);
    maze_num = Math.round(maze_num);
    socket.emit('getMaze', {mazeNumber: maze_num});
  }
}
