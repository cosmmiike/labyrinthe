var socket = io();
var player;
var timer;
var update_score;
var buttons = document.getElementsByClassName('game__control-button');

class Player {
  constructor(number) {
    this.number = number;
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
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

window.onload = function(){
	canvas = document.getElementById('game__canvas');
	context = canvas.getContext('2d');

  socketListeners();

  window.onkeydown = processKey;
  window.onkeyup = processKeyUp;
  controlButtons();

  update_score = setInterval(function() {player.score += 1;}, 100);
};

function socketListeners() {
  socket.on('connect', function() {
    console.log('Connected to server');
  });

  socket.on('disconnect', function() {
    console.log('Disonnected from server');
  });

  // Эту функцию заменить позже на комнату из 2 игроков
  socket.on('usercount', function(pnum) {
    console.log('Number of players:', pnum.num);
    if (pnum.num < 3) {
      setMaze(pnum.num);
    } else {

    }
  });

  socket.on('disconnection', function() {
    clearTimeout(timer);
    socket.emit('reset coordanates');
    clearInterval(update_score);
    $('#game__player-point--player').hide();
    $('#game__player-point--rival').hide();
    $('#game__player-score--number--1').text(0);
    $('#game__player-score--number--2').text(0);
  });

  // Эту функцию заменить позже на комнату из 2 игроков
  socket.on('player number', function(pnum) {
    console.log('NEW Player:', pnum.num);
    player = new Player(pnum.num);
  });

  socket.on('sendMaze', function(mnum) {
    console.log('Send maze', mnum.mazeNumber.mazeNumber);
    var maze = "/img/maze-" + mnum.mazeNumber.mazeNumber + ".png";
    renderMaze(maze, player);
  });

  socket.on('reset', function() {
    player.x = player.startX;
    player.y = player.startY;
    player.score = 0;
  });

  socket.on('send result', function() {
    alert("Vouz êtes fini ! SCORE : " + player.score);
  });

  socket.on('send end message', function(msg) {
    console.log(msg);
    alert("Joueur " + msg.player_num + " est fini avec score : " + msg.player_score);
  });
}

// Эта функция сработывает по 2 раза когда number === 2 !
function setMaze(number) {
  if (number === 1) {
    $('#game__message--wait-message').show();
    $('#game__message--wait-message').text('VEUILLE ATTENDRE LE JOUEUR 2');
    $('#game__canvas').hide();
    $('.game__control-buttons').hide();
    $('#control-panel__button--name--new-game').hide();
  } else if (number === 2) {
    $('#game__message--wait-message').hide();
    $('#game__canvas').show();
    $('.game__control-buttons').show();
    $('#control-panel__button--name--new-game').show();
    maze_num = 1 - 0.5 + Math.random() * (20);
    maze_num = Math.round(maze_num);
    socket.emit('getMaze', {mazeNumber: maze_num, Player: number});
  }
}

function renderPlayer(pointX, pointY) {
  $('#game__player-point--player').show().css('margin-left', pointX + 'px').css('margin-top', pointY + 'px');
  if (player.number === 1) {
    $('#game__player-score--number--1').text(player.score);
  } else if (player.number === 2) {
    $('#game__player-score--number--2').text(player.score);
  }
}

function renderRival(pointX, pointY) {
  $('#game__player-point--rival').show().css('margin-left', pointX + 'px').css('margin-top', pointY + 'px');
}

function renderMaze(mazeFile, player) {
  clearTimeout(timer);

  var imgMaze = new Image();

	imgMaze.onload = function() {
    player.score = 0;
		canvas.width = imgMaze.width;
		canvas.height = imgMaze.height;

		context.drawImage(imgMaze, 0,0);

    if (player.number === 1) {
      $('#game__player-name--number--1').text('VOUS');
      $('#game__player-name--number--2').text('RIVAL');
    } else if (player.number === 2) {
      $('#game__player-name--number--1').text('RIVAL');
      $('#game__player-name--number--2').text('VOUS');
    }

		x1 = player.startX; x2 = player.startX_rival;
    y1 = player.startY; y2 = player.startY_rival;

    renderPlayer(x1, y1);
    renderRival(x2, y2);

    socket.on('sendInfo', function(data) {
      var x_rival = data.pointX;
      var y_rival = data.pointY;

      if (player.number === 1) {
        $('#game__player-score--number--2').text(data.score);
        percentage = 110 - calculateDist(data.pointX, data.pointY);
        $('#game__current-progress--number--2').css('width', percentage + '%');
      } else if (player.number === 2) {
        $('#game__player-score--number--1').text(data.score);
        renderBar(1, data.pointX, data.pointY);
        percentage = 110 - calculateDist(data.pointX, data.pointY);
        $('#game__current-progress--number--1').css('width', percentage + '%');
      }

      renderRival(data.pointX, data.pointY);
    });

    timer = setTimeout(renderPath, 10);
	};
	imgMaze.src = mazeFile;
}

function renderPath() {
	context.beginPath();
	context.fillStyle = "#ffdddd";
	context.rect(player.x, player.y, 10, 10);
	context.fill();

	player.x += player.dx;
	player.y += player.dy;

  player.score += Math.abs(player.dx);
	player.score += Math.abs(player.dy);

	if (checkForCollision()) {
		player.x -= player.dx;
		player.y -= player.dy;
    player.score -= Math.abs(player.dx);
  	player.score -= Math.abs(player.dy);
		player.dx = 0;
		player.dy = 0;
	}

  renderPlayer(player.x, player.y);

	if (player.y > (canvas.height - 12) && player.number == 1) {
    socket.emit('end of maze', {player_num: player.number, player_score: player.score});
		document.getElementById("game__current-progress--number--1").style.width = "100%";
    player.dx = 0;
    player.dy = 0;
		document.getElementById("game__control-button--down").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
		return;
	}

  if (player.y < 3 && player.number == 2) {
    socket.emit('end of maze', {player_num: player.number, player_score: player.score});
		document.getElementById("game__current-progress--number--2").style.width = "100%";
    player.dx = 0;
    player.dy = 0;
		document.getElementById("game__control-button--up").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
		return;
	}

  timer = setTimeout(renderPath, 20);
  update_rival = setTimeout(getInformation(), 20);
  update_bar = setTimeout(renderBar(player.number, player.x, player.y), 20);
}

function calculateDist(pointx, pointy) {
  var dist = 0;

  if (player.number === 1) {
    dist = Math.sqrt((pointx - 164) * (pointx - 164) + (pointy - 308) * (pointy - 308));
  }

  if (player.number === 2) {
    dist = Math.sqrt((pointx - 148) * (pointx - 148) + (pointy - 2) * (pointy - 2));
  }

  var distmax = Math.sqrt((3 - 164) * (3 - 164) + (3 - 308) * (3 - 308));
	var percentage = 100 - dist/distmax * 100;

  return percentage;
}

function renderBar(num, pointX, pointY) {
  percentage = calculateDist(pointX, pointY);
  $('#game__current-progress--number--' + num).css('width', percentage + '%');
}

function getInformation() {
  socket.emit('getInfo', {
    pointX: player.x,
    pointY: player.y,
    score: player.score
  }, function() {

  });
}

function processKey(e) {
	// UP
	if (e.keyCode == 38) {
		e.preventDefault();
		player.dy = -1;
		document.getElementById("game__control-button--up").style.backgroundColor = "rgba(255, 255, 255, 1)";
	}

	// DOWN
	if (e.keyCode == 40) {
		e.preventDefault();
		player.dy = 1;
		document.getElementById("game__control-button--down").style.backgroundColor = "rgba(255, 255, 255, 1)";
	}

	// LEFT
	if (e.keyCode == 37) {
		e.preventDefault();
		player.dx = -1;
		document.getElementById("game__control-button--left").style.backgroundColor = "rgba(255, 255, 255, 1)";
	}

	// RIGHT
	if (e.keyCode == 39) {
		e.preventDefault();
		player.dx = 1;
		document.getElementById("game__control-button--right").style.backgroundColor = "rgba(255, 255, 255, 1)";
	}
}

function processKeyUp(e) {
	player.dx = 0;
	player.dy = 0;

	for (i = 0; i < buttons.length; i++)
		buttons[i].style.backgroundColor = "rgba(255, 255, 255, 0.5)";
}

function checkForCollision() {
	var imgData = context.getImageData(player.x-1, player.y-1, 10+1, 10+1);
	var pixels = imgData.data;

	for (var i = 0; n = pixels.length, i < n; i += 4) {
		var red = pixels[i];
		var green = pixels[i+1];
		var blue = pixels[i+2];
		var alpha = pixels[i+3];

		if (red == 0 && green == 0 && blue == 0) {
			return true;
		}
	}

	return false;
}

$('#control-panel__button--new-game').on("click", function () {
  player.dx = 0;
	player.dy = 0;
  setMaze(2);
  socket.emit('reset coordanates');
});

function controlButtons() {
  function setOpacity(id, opacity) {
    document.getElementById(id).style.backgroundColor = 'rgba(255, 255, 255,' + opacity + ')';
  }

  $('#game__control-button--right').on("mouseover", function() {setOpacity('game__control-button--right', 1);});
	$('#game__control-button--left').on("mouseover", function () {setOpacity('game__control-button--left', 1);});
	$('#game__control-button--up').on("mouseover", function () {setOpacity('game__control-button--up', 1);});
	$('#game__control-button--down').on("mouseover", function () {setOpacity('game__control-button--down', 1);});

  $('#game__control-button--up').on("mousedown", function() {player.dy = -1;});
	$('#game__control-button--left').on("mousedown", function() {player.dx = -1;});
  $('#game__control-button--down').on("mousedown", function() {player.dy = 1;});
  $('#game__control-button--right').on("mousedown", function() {player.dx = 1;});

  $('#game__control-button--up').on("touchstart", function (e) {
		e.preventDefault(); player.dy = -1; setOpacity('game__control-button--up', 1);});
	$('#game__control-button--left').on("touchstart", function (e) {
		e.preventDefault(); player.dx = -1; setOpacity('game__control-button--left', 1);});
	$('#game__control-button--down').on("touchstart", function (e) {
		e.preventDefault(); player.dy = 1; setOpacity('game__control-button--down', 1);});
  $('#game__control-button--right').on("touchstart", function (e) {
		e.preventDefault(); player.dx = 1; setOpacity('game__control-button--right', 1);});

  $('#game__control-button--right').on("mouseup", function() {player.dx = 0;});
	$('#game__control-button--left').on("mouseup", function() {player.dx = 0;});
	$('#game__control-button--up').on("mouseup", function() {player.dy=0;});
	$('#game__control-button--down').on("mouseup", function() {player.dy=0;});

  $('#game__control-button--right').on("touchend", function (e) {
		e.preventDefault(); player.dx = 0; setOpacity('game__control-button--right', 0.5);});
	$('#game__control-button--left').on("touchend", function (e) {
		e.preventDefault(); player.dx = 0; setOpacity('game__control-button--left', 0.5);});
	$('#game__control-button--up').on("touchend", function (e) {
		e.preventDefault(); player.dy = 0; setOpacity('game__control-button--up', 0.5);});
	$('#game__control-button--down').on("touchend", function (e) {
		e.preventDefault(); player.dy = 0; setOpacity('game__control-button--down', 0.5);});

  $('#game__control-button--right').on("mouseout", function() {setOpacity('game__control-button--right', 0.5);});
	$('#game__control-button--left').on("mouseout", function () {setOpacity('game__control-button--left', 0.5);});
	$('#game__control-button--up').on("mouseout", function () {setOpacity('game__control-button--up', 0.5);});
	$('#game__control-button--down').on("mouseout", function () {setOpacity('game__control-button--down', 0.5);});
}
