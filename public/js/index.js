var socket = io();
var pl;

class Player {
  constructor(number) {
    this.number = number;
    this.dx = 0;
    this.dy = 0;
    this.score = 1000;
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
    this.x = this.startX;
    this.y = this.startY;
  }
}

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('disconnect', function() {
  console.log('Disonnected from server');
});

socket.on('usercount', function(pnum) {
  console.log('Number of players:', pnum.num);
  $('#compte-2').text(pnum.num);
  setMaze(pnum.num);
});

socket.on('player number', function(pnum) {
  console.log('NEW Player:', pnum.num);
  pl = new Player(pnum.num);
});

function setMaze(number) {
  if (number === 1) {
    $('#wait-message').show();
    $('#wait-message').html('MERCI POUR ATTENDRE LE JOUEUR 2');
    $('canvas').hide();
  } else if (number === 2) {
    $('#wait-message').hide();
    $('canvas').show();
    maze_num = 1 - 0.5 + Math.random() * (20);
    maze_num = Math.round(maze_num);
    socket.emit('getMaze', {mazeNumber: maze_num, Player: number});
  }
}

socket.on('sendMaze', function(mnum) {
  console.log('Send maze', mnum.mazeNumber.mazeNumber);
  var maze = "/img/maze-" + mnum.mazeNumber.mazeNumber + ".png";
  drawMaze(maze, pl);
});



// socket.on('notification', function(data) {
//   console.log('Notification', data);
// });
//
// $('#rival-data-form').on('submit', function (e) {
//   e.preventDefault();
//
//   socket.emit('getInfo', {
//     pointX: $('[name=point-x]').val(),
//     pointY: $('[name=point-y]').val(),
//     score: $('[name=score]').val()
//   }, function() {
//     $('[name=point-x]').val('');
//     $('[name=point-y]').val('');
//     $('[name=score]').val('');
//   });
// });


var timer;

window.onload = function(){
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
  window.onkeydown = processKey;
  window.onkeyup = processKeyUp;
};

restart.onclick = function () {
  setMaze(2);
};

function drawMaze(mazeFile, player) {

  pl.dx = 0;
	pl.dy = 0;

  clearTimeout(timer);

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
		// context.drawImage(imgFace2, x2, y2);

    socket.on('sendInfo', function(data) {
      var x_rival = data.pointX;
      var y_rival = data.pointY;
      $('#compte-1').text(data.score);
      $('#rival_name').text(data.pointX + ' ' + data.pointY);
      context.drawImage(imgFace2, data.pointX, data.pointY);
    });

		// context.stroke();
    timer = setTimeout(drawFrame, 10);
	};
	imgMaze.src = mazeFile;
}

function drawFrame() {
	context.beginPath();
	context.fillStyle = "rgb(220,255,220)";
	context.rect(pl.x, pl.y, 10, 10);
	context.fill();

	pl.x += pl.dx;
	pl.y += pl.dy;

	if (checkForCollision()) {
		pl.x -= pl.dx;
		pl.y -= pl.dy;
		pl.dx = 0;
		pl.dy = 0;
	}

  // socket.on('sendInfo', function(data) {
  //   var x_rival = data.pointX;
  //   var y_rival = data.pointY;
  //   $('#compte-1').text(data.score);
  // });

	var imgFace1 = document.getElementById("face1");
	context.drawImage(imgFace1, pl.x, pl.y);

  // var imgFace2 = document.getElementById("face2");
	// context.drawImage(imgFace2, x_rival, y_rival);








  console.log(pl.y, canvas.height - 300);
	if (pl.y > (canvas.height - 12) && pl.number == 1) {
		document.getElementById("bar-1").style.width = "100%";
		alert("Vouz avez gagné ! SCORE: " + 777);
		// scoreCounter = 0;
		// scoreCounter2 = 0;
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
		setMaze(pl.startX, pl.startY);
		return;
	}

  if (pl.y < 2 && pl.number == 2) {
		document.getElementById("bar-1").style.width = "100%";
		alert("Vouz avez gagné ! SCORE: " + 777);
		// scoreCounter = 0;
		// scoreCounter2 = 0;
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
		setMaze(pl.startX, pl.startY);
		return;
	}
  timer = setTimeout(drawFrame, 20);
  update_rival = setTimeout(getInformation(), 10);
  update_bar = setTimeout(calculateDist(pl.x, pl.y), 10);
}

function calculateDist(pointx, pointy) {
	var dist = Math.sqrt((pointx - 164) * (pointx - 164) + (pointy - 308) * (pointy - 308));
  var distmax = Math.sqrt((3 - 164) * (3 - 164) + (3 - 308) * (3 - 308));
	var percentage = 100 - dist/distmax * 100;
	// console.log(x, y, dist, pourcentage);
	document.getElementById("bar-1").style.width = percentage + "%";
}

function getInformation() {
  socket.emit('getInfo', {
    pointX: pl.x,
    pointY: pl.y,
    score: pl.score
  }, function() {

  });
}

function processKey(e) {
	pl.dx = 0;
	pl.dy = 0;

	var compte1 = document.getElementById("compte-1");
	// UP
	if (e.keyCode == 38) {
		e.preventDefault();
		pl.dy = -1;
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 1)";
		// scoreCounter += 1;
		// compte1.innerText = scoreCounter;
	}

	// DOWN
	if (e.keyCode == 40) {
    console.log('down');
		e.preventDefault();
		pl.dy = 1;
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 1)";
		// scoreCounter += 1;
		// compte1.innerText = scoreCounter;
	}

	// LEFT
	if (e.keyCode == 37) {
		e.preventDefault();
		pl.dx = -1;
		document.getElementById("btnleft").style.backgroundColor = "rgba(255, 255, 255, 1)";
		// scoreCounter += 1;
		// compte1.innerText = scoreCounter;
	}

	// RIGHT
	if (e.keyCode == 39) {
		e.preventDefault();
		pl.dx = 1;
		document.getElementById("btnright").style.backgroundColor = "rgba(255, 255, 255, 1)";
		// scoreCounter += 1;
		// compte1.innerText = scoreCounter;
	}
}

var buttons = document.getElementsByClassName('ctrl-btn');

function processKeyUp(e) {
	pl.dx = 0;
	pl.dy = 0;
	for (i = 0; i < buttons.length; i++)
		buttons[i].style.backgroundColor = "rgba(255, 255, 255, 0.5)";
}

function checkForCollision() {
	// Перебираем все пикселы и инвертируем их цвет
	var imgData = context.getImageData(pl.x-1, pl.y-1, 10+1, 10+1);
	var pixels = imgData.data;

	// Получаем данные для одного пиксела
	for (var i = 0; n = pixels.length, i < n; i += 4) {
		var red = pixels[i];
		var green = pixels[i+1];
		var blue = pixels[i+2];
		var alpha = pixels[i+3];

		// Смотрим на наличие черного цвета стены, что указывает на столкновение
		if (red == 0 && green == 0 && blue == 0) {
			return true;
		}
	}
	// Столкновения не было
	return false;
}
