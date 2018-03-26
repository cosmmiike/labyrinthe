var canvas;
var context;

var startX = 148;
var startY = 3;

var x = 148;
var y = 3;

var dx = 0;
var dy = 0;

var timer;

var scoreCounter = 0;
var scoreCounter2 = 0;

var distmax = 340;

var compte1 = 0;
var compte2 = 0;

function calculateDist(pointx, pointy) {
	var dist = Math.sqrt((pointx - 164) * (pointx - 164) + (pointy - 308) * (pointy - 308));
	var pourcentage = 100 - dist/distmax * 100;
	// console.log(x, y, dist, pourcentage);
	document.getElementById("bar-1").style.width = pourcentage + "%";
}

function drawMaze(mazeFile, startingX, startingY){

	console.log("draw");
	// Остановить таймер (если запущен)
	clearTimeout(timer);

	// Остановить перемещение значка
	dx = 0;
	dy = 0;

	scoreCounter = 0;
	scoreCounter2 = 0;

	// Загружаем изображение лабиринта
	var imgMaze = new Image();
	imgMaze.onload = function() {
		// Изменяем размер холста в соответствии
		// с размером изображения лабиринта
		canvas.width = imgMaze.width;
		canvas.height = imgMaze.height;

		// Рисуем лабиринт
		context.drawImage(imgMaze, 0,0);

		// Рисуем значок
		x = startingX;
		y = startingY;

		var imgFace = document.getElementById("face");
		context.drawImage(imgFace, x, y);
		context.stroke();

		// Рисуем следующий кадр через 10 миллисекунд
		timer = setTimeout(drawFrame, 10);
	};
	imgMaze.src = mazeFile;
}

function drawFrame() {
	// Обновляем кадр только если значок движется
	if (dx != 0 || dy != 0) {
		// Закрашиваем перемещение значка желтым цветом
		context.beginPath();
		context.fillStyle = "rgb(220,255,220)";
		context.rect(x, y, 10, 10);
		context.fill();

		// Обновляем координаты значка, создавая перемещение
		x += dx;
		y += dy;

		// Проверка столкновения со стенками лабиринта
		// (вызывается доп. функция)
		if (checkForCollision()) {
			x -= dx;
			y -= dy;
			dx = 0;
			dy = 0;
		}

		// Перерисовываем значок
		var imgFace = document.getElementById("face");
		context.drawImage(imgFace, x, y);

		// Проверяем дошел ли пользователь до финиша.
		// Если дошел, то выводим сообщение
		if (y > (canvas.height - 12)) {
			document.getElementById("bar-1").style.width = "100%";
			alert("Vouz avez gagné ! SCORE: " + scoreCounter);
			scoreCounter = 0;
			scoreCounter2 = 0;
			document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
			setMaze(startX, startY);
			return;
		}
	}

	// Рисуем следующий кадр через 10 миллисекунд
	timer = setTimeout(drawFrame, 10);
	updatebar = setTimeout(calculateDist(x, y), 1);
}

function processKey(e) {
	// Если значок находится в движении, останавливаем его
	dx = 0;
	dy = 0;

	var compte1 = document.getElementById("compte-1");
	// Если нажата стрелка вверх, начинаем двигаться вверх
	if (e.keyCode == 38) {
		dy = -1;
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 1)";
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	}

	// Если нажата стрелка вниз, начинаем двигаться вниз
	if (e.keyCode == 40) {
		dy = 1;
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 1)";
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	}

	// Если нажата стрелка влево, начинаем двигаться влево
	if (e.keyCode == 37) {
		dx = -1;
		document.getElementById("btnleft").style.backgroundColor = "rgba(255, 255, 255, 1)";
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	}

	// Если нажата стрелка вправо, начинаем двигаться вправо
	if (e.keyCode == 39) {
		dx = 1;
		document.getElementById("btnright").style.backgroundColor = "rgba(255, 255, 255, 1)";
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	}
}

function processKeyUp(e) {
	dx = 0;
	dy = 0;
	for (i = 0; i < buttons.length; i++)
		buttons[i].style.backgroundColor = "rgba(255, 255, 255, 0.5)";
}

function controlButtons() {
	btnup.addEventListener("mousedown", function () {
		dy = -1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	});

	btnleft.addEventListener("mousedown", function () {
		dx = -1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	});

	btndown.addEventListener("mousedown", function () {
		dy = 1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	});

	btnright.addEventListener("mousedown", function () {
		dx = 1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
	});

	btnup.addEventListener("touchstart", function (event) {
		event.preventDefault();
		dy = -1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btnleft.addEventListener("touchstart", function (event) {
		event.preventDefault();
		dx = -1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
		document.getElementById("btnleft").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btndown.addEventListener("touchstart", function (event) {
		event.preventDefault();
		dy = 1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btnright.addEventListener("touchstart", function (event) {
		event.preventDefault();
		dx = 1;
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
		document.getElementById("btnright").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btnright.addEventListener("mouseup", function () {
		dx = 0;
		dy = 0;
	});

	btnleft.addEventListener("mouseup", function () {
		dx = 0;
		dy = 0;
	});

	btnup.addEventListener("mouseup", function () {
		dx = 0;
		dy = 0;
	});

	btndown.addEventListener("mouseup", function () {
		dx = 0;
		dy = 0;
	});

	btnright.addEventListener("touchend", function (event) {
		event.preventDefault();
		dx = 0;
		dy = 0;
		document.getElementById("btnright").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});

	btnleft.addEventListener("touchend", function (event) {
		event.preventDefault();
		dx = 0;
		dy = 0;
		document.getElementById("btnleft").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});

	btnup.addEventListener("touchend", function (event) {
		event.preventDefault();
		dx = 0;
		dy = 0;
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});

	btndown.addEventListener("touchend", function (event) {
		event.preventDefault();
		dx = 0;
		dy = 0;
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});

	btnright.addEventListener("mouseover", function () {
		document.getElementById("btnright").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btnleft.addEventListener("mouseover", function () {
		document.getElementById("btnleft").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btnup.addEventListener("mouseover", function () {
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btndown.addEventListener("mouseover", function () {
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 1)";
	});

	btnup.addEventListener("mouseout", function () {
		document.getElementById("btnup").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});

	btnleft.addEventListener("mouseout", function () {
		document.getElementById("btnleft").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});

	btnright.addEventListener("mouseout", function () {
		document.getElementById("btnright").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});

	btndown.addEventListener("mouseout", function () {
		document.getElementById("btndown").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
	});
}

function checkForCollision() {
	// Перебираем все пикселы и инвертируем их цвет
	var imgData = context.getImageData(x-1, y-1, 10+1, 10+1);
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

function setMaze(startingX, startingY) {
	compte1.innerText = 0;
	compte2.innerText = 0;
	var rand = 1 - 0.5 + Math.random() * (20);
  rand = Math.round(rand);
	console.log(rand);
	drawMaze("img/maze-" + rand + ".png", startingX, startingY);
}

window.onload = function(){
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");

	setMaze(startX, startY);

	window.onkeydown = processKey;
	window.onkeyup = processKeyUp;

	compte1 = document.getElementById("compte-1");
	compte2 = document.getElementById("compte-2");
	function incrementSeconds() {
		scoreCounter += 1;
		compte1.innerText = scoreCounter;
		// scoreCounter2 += 1;
		// compte2.innerText = scoreCounter2;
	}

	controlButtons();

	var updateCompre = setInterval(incrementSeconds, 200);

	restart.onclick = function () {
		setMaze(startX, startY);
	};

};
