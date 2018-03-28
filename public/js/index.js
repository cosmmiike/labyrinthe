var socket = io();
var player;
var timer;
var update_score;
var buttons = document.getElementsByClassName('ctrl-btn');

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
	canvas = document.getElementById('canvas');
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
    $('#player_point').hide();
    $('#rival_point').hide();
    $('#compte-1').text(0);
    $('#compte-2').text(0);
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
    $('#wait-message').show();
    $('#wait-message').text('VEUILLE ATTENDRE LE JOUEUR 2');
    $('canvas').hide();
    $('.control-buttons').hide();
    $('#restart').hide();
  } else if (number === 2) {
    $('#wait-message').hide();
    $('canvas').show();
    $('.control-buttons').show();
    $('#restart').show();
    maze_num = 1 - 0.5 + Math.random() * (20);
    maze_num = Math.round(maze_num);
    socket.emit('getMaze', {mazeNumber: maze_num, Player: number});
  }
}

function renderPlayer(pointX, pointY) {
  $('#player_point').show().css('margin-left', pointX + 'px').css('margin-top', pointY + 'px');
  if (player.number === 1) {
    $('#compte-1').text(player.score);
  } else if (player.number === 2) {
    $('#compte-2').text(player.score);
  }
}

function renderRival(pointX, pointY) {
  $('#rival_point').show().css('margin-left', pointX + 'px').css('margin-top', pointY + 'px');
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
      $('#j1_name').text('VOUS');
      $('#j2_name').text('RIVAL');
    } else if (player.number === 2) {
      $('#j1_name').text('RIVAL');
      $('#j2_name').text('VOUS');
    }

		x1 = player.startX; x2 = player.startX_rival;
    y1 = player.startY; y2 = player.startY_rival;

    renderPlayer(x1, y1);
    renderRival(x2, y2);

    socket.on('sendInfo', function(data) {
      var x_rival = data.pointX;
      var y_rival = data.pointY;

      if (player.number === 1) {
        $('#compte-2').text(data.score);
        percentage = 110 - calculateDist(data.pointX, data.pointY);
        $('#bar-2').css('width', percentage + '%');
      } else if (player.number === 2) {
        $('#compte-1').text(data.score);
        renderBar(1, data.pointX, data.pointY);
        percentage = 110 - calculateDist(data.pointX, data.pointY);
        $('#bar-1').css('width', percentage + '%');
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
		document.getElementById("bar-1").style.width = "100%";
    player.dx = 0;
    player.dy = 0;
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
		return;
	}

  if (player.y < 3 && player.number == 2) {
    socket.emit('end of maze', {player_num: player.number, player_score: player.score});
		document.getElementById("bar-2").style.width = "100%";
    player.dx = 0;
    player.dy = 0;
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
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
  $('#bar-' + num).css('width', percentage + '%');
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
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 1)";
	}

	// DOWN
	if (e.keyCode == 40) {
		e.preventDefault();
		player.dy = 1;
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 1)";
	}

	// LEFT
	if (e.keyCode == 37) {
		e.preventDefault();
		player.dx = -1;
		document.getElementById("btnleft").style.backgroundColor = "rgba(255, 255, 255, 1)";
	}

	// RIGHT
	if (e.keyCode == 39) {
		e.preventDefault();
		player.dx = 1;
		document.getElementById("btnright").style.backgroundColor = "rgba(255, 255, 255, 1)";
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

restart.onclick = function () {
  player.dx = 0;
	player.dy = 0;
  setMaze(2);
  socket.emit('reset coordanates');
};

function controlButtons() {
  function setOpacity(id, opacity) {
    document.getElementById(id).style.backgroundColor = 'rgba(255, 255, 255,' + opacity + ')';
  }

  btnright.addEventListener("mouseover", function() {setOpacity('btnright', 1);});
	btnleft.addEventListener("mouseover", function () {setOpacity('btnleft', 1);});
	btnup.addEventListener("mouseover", function () {setOpacity('btnup', 1);});
	btndown.addEventListener("mouseover", function () {setOpacity('btndown', 1);});

  btnup.addEventListener("mousedown", function() {player.dy = -1;});
	btnleft.addEventListener("mousedown", function() {player.dx = -1;});
  btndown.addEventListener("mousedown", function() {player.dy = 1;});
  btnright.addEventListener("mousedown", function() {player.dx = 1;});

  btnup.addEventListener("touchstart", function (e) {
		e.preventDefault(); player.dy = -1; setOpacity('btnup', 1);});
	btnleft.addEventListener("touchstart", function (e) {
		e.preventDefault(); player.dx = -1; setOpacity('btnleft', 1);});
	btndown.addEventListener("touchstart", function (e) {
		e.preventDefault(); player.dy = 1; setOpacity('btndown', 1);});
  btnright.addEventListener("touchstart", function (e) {
		e.preventDefault(); player.dx = 1; setOpacity('btnright', 1);});

  btnright.addEventListener("mouseup", function() {player.dx = 0;});
	btnleft.addEventListener("mouseup", function() {player.dx = 0;});
	btnup.addEventListener("mouseup", function() {player.dy=0;});
	btndown.addEventListener("mouseup", function() {player.dy=0;});

  btnright.addEventListener("touchend", function (e) {
		e.preventDefault(); player.dx = 0; setOpacity('btnright', 0.5);});
	btnleft.addEventListener("touchend", function (e) {
		e.preventDefault(); player.dx = 0; setOpacity('btnleft', 0.5);});
	btnup.addEventListener("touchend", function (e) {
		e.preventDefault(); player.dy = 0; setOpacity('btnup', 0.5);});
	btndown.addEventListener("touchend", function (e) {
		e.preventDefault(); player.dy = 0; setOpacity('btndown', 0.5);});

  btnright.addEventListener("mouseout", function() {setOpacity('btnright', 0.5);});
	btnleft.addEventListener("mouseout", function () {setOpacity('btnleft', 0.5);});
	btnup.addEventListener("mouseout", function () {setOpacity('btnup', 0.5);});
	btndown.addEventListener("mouseout", function () {setOpacity('btndown', 0.5);});
}
