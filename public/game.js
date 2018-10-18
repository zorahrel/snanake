var socket, snake, gameState = {
  snakes: [],
  foods: []
};

var initialGamespeed = 8;

var gameWidth, gameHeight;

function setup() {
  pixelUnit = 30;
  gamespeed = initialGamespeed;
  baseSpeed = pixelUnit;
  /* dimensione del canvas */
  var width = windowWidth;
  var height = windowHeight;

  /* dimensione del game level */
  gameWidth = pixelUnit * 72;
  gameHeight = pixelUnit * 40;

  var stage = createCanvas(width, height);
  stage.parent('stage');
  frameRate(gamespeed);

  socket = io.connect(window.location.hostname);
  //socket = io.connect('http://localhost:3000');

  var textName = document.getElementById('nameText');

  ['change', 'keyup', 'paste'].forEach(function (e) {
    textName.addEventListener(e, function () {
      if (this.value.length > 0) {
        document.getElementById('setSnake').disabled = false;
      } else {
        document.getElementById('setSnake').disabled = true;
      }
    });
  });

  document.getElementById('setSnake').onclick = function () {
    this.parentNode.parentNode.removeChild(this.parentNode); // rimuovi il popup
    var snakePos = randomPos();
    snake = new Snake('self', textName.value, snakePos.x, snakePos.y, [], 1, 0, 0, 0, 0);

    var data = {
      name: snake.name,
      x: snake.x,
      y: snake.y,
      t: snake.t,
      v: snake.v,
      xSpeed: snake.xSpeed,
      ySpeed: snake.ySpeed,
      score: snake.score,
      bestScore: snake.bestScore
    }
    socket.emit('initializeSnake', data);
  }

  socket.on('heartbeat',
    function (data) {
      gameState.snakes = data.snakes;
      gameState.foods = data.foods;
    }
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);



  if (typeof snake !== 'undefined') {
    var previousX = snake.x;
    var previousY = snake.y; // mantengo salvata la posizione del verme prima dell'update per centrale la modale della pausa

    scrollingCamera(snake.x, snake.y);

    document.getElementById('score').innerHTML = 'Score: ' + snake.score;
    document.getElementById('bestscore').innerHTML = 'Best Score: ' + snake.bestScore;

    if (keyIsPressed) {
      switch (keyCode) {
        case UP_ARROW:
          snake.dir(0, -baseSpeed);
          break;
        case DOWN_ARROW:
          snake.dir(0, baseSpeed);
          break;
        case RIGHT_ARROW:
          snake.dir(baseSpeed, 0);
          break;
        case LEFT_ARROW:
          snake.dir(-baseSpeed, 0);
          break;
      }
    }

    /* start swipe handler */
    (new Swipe('#stage')).onLeft(function () {
      snake.dir(-baseSpeed, 0);
    }).run();
    (new Swipe('#stage')).onRight(function () {
      snake.dir(baseSpeed, 0);
    }).run();
    (new Swipe('#stage')).onUp(function () {
      snake.dir(0, -baseSpeed);
    }).run();
    (new Swipe('#stage')).onDown(function () {
      snake.dir(0, baseSpeed);
    }).run();
    /* end swipe handler */

    snake.update();
    snake.show();
    snake.eat();
    snake.eatSelf();
    snake.eatSnake();
    var data = {
      name: snake.name,
      x: previousX,
      y: previousY,
      t: snake.t,
      v: snake.v,
      xSpeed: snake.xSpeed,
      ySpeed: snake.ySpeed,
      score: snake.score
    }
    socket.emit('updateSnake', data);
  }

  // draw other snakes
  for (var i = gameState.snakes.length - 1; i >= 0; i--) {
    var id = gameState.snakes[i].id;
    if (id !== socket.id) {
      var anotherSnake = new Snake(id, gameState.snakes[i].name, gameState.snakes[i].x, gameState.snakes[i].y, gameState.snakes[i].t, gameState.snakes[i].v, gameState.snakes[i].xSpeed, gameState.snakes[i].ySpeed, gameState.snakes[i].score, gameState.snakes[i].bestScore);

      anotherSnake.update();
      anotherSnake.show();
      anotherSnake.eat();
      anotherSnake.eatSelf();

      fill(0);
      textAlign(CENTER);
      textSize(12);
      text(gameState.snakes[i].name, gameState.snakes[i].x + 15, gameState.snakes[i].y + 40);
    } else {
      fill(0);
      textAlign(CENTER);
      textSize(12);
      text("You", previousX + 15, previousY + 40);
    }
  }

  // draw foods
  gameState.foods.forEach(function (food) {
    switch (food.type) {
      default:
      case 'normal':
        fill(205, 133, 0);
        rect(food.x, food.y, pixelUnit, pixelUnit);
        break;
      case 'plustwo':
        fill(160, 160, 160);
        rect(food.x, food.y, pixelUnit, pixelUnit);
        fill(0);
        textAlign(CENTER);
        textSize(20);
        text('+2', food.x + 15, food.y + 15 + 7.5);
        break;
      case 'plusfive':
        fill(0, 255, 0);
        rect(food.x, food.y, pixelUnit, pixelUnit);
        fill(0);
        textAlign(CENTER);
        textSize(20);
        text('+5', food.x + 15, food.y + 15 + 7.5);
        break;
      case 'timestwo':
        fill(255, 0, 144);
        rect(food.x, food.y, pixelUnit, pixelUnit);
        fill(0);
        textAlign(CENTER);
        textSize(20);
        text('x2', food.x + 15, food.y + 15 + 7.5);
        break;
    }
  }, this);

  // create border game line
  noFill();
  strokeWeight(1);
  stroke(0);
  rect(-1, -1, gameWidth + 1, gameHeight + 1);
  stroke(0); //reset bordo nero     
}


function scrollingCamera(x, y) {
  translate(-x + (width / 2), -y + (height / 2));
}

function randomPos() {
  var cols = Math.floor(gameWidth / pixelUnit);
  var rows = Math.floor(gameHeight / pixelUnit);

  return {
    x: Math.floor(random(cols)) * pixelUnit,
    y: Math.floor(random(rows)) * pixelUnit
  };
}

function collideSnake(pos, killerId) {
  var collides = false;
  gameState.snakes.forEach(function (snake) {
    if (snake.id !== killerId) {
      snake.t.forEach(function (tail) {
        if (pos.x == tail.x && pos.y == tail.y) {
          collides = true;
        }
      })
    }
  });
  return collides;
}