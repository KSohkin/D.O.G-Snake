var canvas = document.getElementById("the-game");
var context = canvas.getContext("2d");
var game, snake, food;

window.onkeydown = function(e) {
  return !(e.keyCode === 32);
};

function gridSnap(val) {
  return Math.floor(val / snake.size) * snake.size;
}

// Images
var keha = new Image();
keha.src = 'SnakePics/D.O.G keha.png';
var pea = new Image();
pea.src = 'SnakePics/D.O.G pea.png';
var saba = new Image();
saba.src = 'SnakePics/D.O.G saba.png';
var foodImage = new Image();
foodImage.src = 'SnakePics/d.o.g_food.png';

game = {
  score: 0,
  fps: 60,
  over: false,
  message: null,

  start: function () {
    game.over = false;
    game.message = null;
    game.score = 0;
    game.fps = 6;
    snake.init();
    food.set();
  },

  stop: function () {
    game.over = true;
    game.message = 'A fatal mistake! - PRESS SPACEBAR';
  },

  drawBox: function (x, y, size, color) {
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x - (size / 2), y - (size / 2));
    context.lineTo(x + (size / 2), y - (size / 2));
    context.lineTo(x + (size / 2), y + (size / 2));
    context.lineTo(x - (size / 2), y + (size / 2));
    context.closePath();
    context.fill();
  },

  drawScore: function () {
    context.fillStyle = '#999';
    context.font = (canvas.height / 10) + 'px Impact, sans-serif';
    context.textAlign = 'center';
    context.fillText(game.score, canvas.width / 2, canvas.height * 0.9);
  },

  drawMessage: function () {
    if (game.message !== null) {
      context.fillStyle = '#00F';
      context.strokeStyle = '#FFF';
      context.font = (canvas.height / 13) + 'px Impact';
      context.textAlign = 'center';
      context.fillText(game.message, canvas.width / 2, canvas.height / 2);
      context.strokeText(game.message, canvas.width / 2, canvas.height / 2);
    }
  },

  resetCanvas: function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
  },

  drawImage: function (img, x, y, width, height, angle) {
    context.save();
    context.translate(x + snake.size / 2, y + snake.size / 2);
    context.rotate(angle * Math.PI / 180);
    context.drawImage(img, -width / 2, -height / 2, width, height);
    context.restore();
  }
};

snake = {
  size: canvas.width / 20,
  x: null,
  y: null,
  direction: 'left',
  sections: [],
  turns: [],

  init: function () {
    snake.sections = [];
    snake.turns = [];
    snake.direction = 'left';
    snake.x = gridSnap(canvas.width / 2);
    snake.y = gridSnap(canvas.height / 2);
    for (let i = 5; i >= 0; i--) {
  snake.sections.push({
    x: snake.x + i * snake.size,
    y: snake.y,
    direction: 'left'
  });
}
  },

  move: function () {
    if (snake.turns.length > 0) {
      let turn = snake.turns[0];
      if (snake.x === turn.x && snake.y === turn.y) {
        snake.direction = turn.direction;
        snake.turns.shift();
      }
    }

    switch (snake.direction) {
      case 'up': snake.y -= snake.size; break;
      case 'down': snake.y += snake.size; break;
      case 'left': snake.x -= snake.size; break;
      case 'right': snake.x += snake.size; break;
    }

    snake.sections.push({
      x: snake.x,
      y: snake.y,
      direction: snake.direction
    });

    snake.checkCollision();
    snake.checkGrowth();
  },

  draw: function () {
    for (var i = 0; i < snake.sections.length; i++) {
      snake.drawSection(snake.sections[i], snake.sections.length, i);
    }
  },

  drawSection: function(section, pikkus, index) {
    let rotation = 0;
    let direction = section.direction;

    switch(direction) {
      case 'left': rotation = -90; break;
      case 'right': rotation = 90; break;
      case 'down': rotation = 180; break;
      case 'up': rotation = 0; break;
    }

    let x = section.x;
    let y = section.y;

    if (index === pikkus - 1) {
      game.drawImage(pea, x, y, snake.size, snake.size, rotation);
    } else if (index === 0) {
      game.drawImage(saba, x, y, snake.size, snake.size, rotation);
    } else {
      game.drawImage(keha, x, y, snake.size, snake.size, rotation);
    }
  },

  checkCollision: function () {
    const head = snake.sections[snake.sections.length - 1];

    if (
      head.x < 0 ||
      head.x >= canvas.width ||
      head.y < 0 ||
      head.y >= canvas.height
    ) {
      game.stop();
    }

    for (let i = 0; i < snake.sections.length - 1; i++) {
      const s = snake.sections[i];
      if (s.x === head.x && s.y === head.y) {
        game.stop();
      }
    }
  },

  checkGrowth: function () {
    const head = snake.sections[snake.sections.length - 1];
    if (head.x === food.x && head.y === food.y) {
      game.score++;
      if (game.score % 5 === 0 && game.fps < 60) {
        game.fps++;
      }
      food.set();
    } else {
      snake.sections.shift();
    }
  }
};

food = {
  size: null,
  x: null,
  y: null,

  set: function () {
    food.size = snake.size;
    let cols = Math.floor(canvas.width / snake.size);
    let rows = Math.floor(canvas.height / snake.size);

    do {
      food.x = Math.floor(Math.random() * cols) * snake.size;
      food.y = Math.floor(Math.random() * rows) * snake.size;
    } while (snake.sections.some(s => s.x === food.x && s.y === food.y));
  },

  draw: function () {
    game.drawImage(foodImage, food.x, food.y, snake.size, snake.size);
  }
};

var inverseDirection = {
  'up': 'down',
  'left': 'right',
  'right': 'left',
  'down': 'up'
};

var keys = {
  up: [38, 75, 87],
  down: [40, 74, 83],
  left: [37, 65, 72],
  right: [39, 68, 76],
  start_game: [13, 32]
};

function getKey(value) {
  for (var key in keys) {
    if (keys[key].includes(value)) {
      return key;
    }
  }
  return null;
}

addEventListener("keydown", function (e) {
  var lastKey = getKey(e.keyCode);
  if (["up", "down", "left", "right"].includes(lastKey) &&
      lastKey !== inverseDirection[snake.direction]) {

    snake.turns.push({
      x: snake.x,
      y: snake.y,
      direction: lastKey
    });

  } else if (["start_game"].includes(lastKey) && game.over) {
    game.start();
  }
}, false);

var requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame;

function loop() {
  if (!game.over) {
    game.resetCanvas();
    game.drawScore();
    snake.move();
    food.draw();
    snake.draw();
    game.drawMessage();
  }
  setTimeout(function () {
    requestAnimationFrame(loop);
  }, 1000 / game.fps);
}

requestAnimationFrame(loop);