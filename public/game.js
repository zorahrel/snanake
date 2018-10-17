//var paused = false;
//var bestScore = 0;

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

  socket = io.connect('http://localhost:3000');

  var snakePos = randomPos();
  snake = new Snake(snakePos.x, snakePos.y, [], 1, 0, 0);

  //document.getElementById('pause').addEventListener('click', pause);
  var data = {
    x: snake.x,
    y: snake.y,
    t: snake.t,
    v: snake.v,
    xSpeed: snake.xSpeed,
    ySpeed: snake.ySpeed
  }
  socket.emit('initializeSnake', data);

  socket.on('heartbeat',
    function (data) {
      gameState.snakes = data.snakes;
      gameState.foods = data.foods;
    }
  );
  
  socket.on('requestingRandomPos',
    function () {
      do {
        foodPos = randomPos();
      } while (collideSnake(foodPos, gameState.snakes));
      socket.emit('randomPos', foodPos);
    });
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
/*
function pause() {
    if (paused) {
        loop();
        paused = false;
        console.log('Unpaused');
    } else {
        noLoop();
        paused = true;
        console.log('Paused');
    }
}
*/
function draw() {
  background(255);

  var pauseX = snake.x;
  var pauseY = snake.y; // mantengo salvata la posizione del verme prima dell'update per centrale la modale della pausa

  scrollingCamera(snake.x, snake.y);

  /*
  s.update();

  s.show();
  showFood();

  s.eat();
  s.eatHimSelf();
  s.score();
  */
  // create border game line
  noFill();
  strokeWeight(1);
  stroke(0);
  rect(-1, -1, gameWidth + 1, gameHeight + 1);
  stroke(0); //reset bordo nero      
  /*
  pauseModal(pauseX, pauseY);
  */
  

  gameState.foods.forEach(function (food) {
    switch (food.type) {
      default:
      case 'normal':
        fill(205, 133, 0);
        rect(food.x, food.y, pixelUnit, pixelUnit);
        break;
      case 'speed':
        fill(0, 255, 0);
        rect(food.x, food.y, pixelUnit, pixelUnit);
        fill(0);
        textAlign(CENTER);
        textSize(30);
        text('s', food.x + 15, food.y + 15 + 7.5);
        break;
    }
  }, this);


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
      case 80: // Letter P
        /*pause();*/
        break;
    }
  }
  snake.update();
  snake.show();

  for (var i = gameState.snakes.length - 1; i >= 0; i--) {
    var id = gameState.snakes[i].id;
    if (id !== socket.id) {
      var anotherSnake = new Snake(gameState.snakes[i].x, gameState.snakes[i].y, gameState.snakes[i].t, gameState.snakes[i].v, gameState.snakes[i].xSpeed, gameState.snakes[i].ySpeed);
      
      anotherSnake.update();
      anotherSnake.show();
      
      fill(0);
      textAlign(CENTER);
      textSize(12);
      text(gameState.snakes[i].id, gameState.snakes[i].x + 15, gameState.snakes[i].y + 40);
    } else {
      fill(0);
      textAlign(CENTER);
      textSize(12);
      text("You", gameState.snakes[i].x + 15, gameState.snakes[i].y + 40);
    }
  }

  var data = {
    x: pauseX,
    y: pauseY,
    t: snake.t,
    v: snake.v,
    xSpeed: snake.xSpeed,
    ySpeed: snake.ySpeed
  }
  socket.emit('updateSnake', data);
}


function scrollingCamera(x, y) {
  translate(-x + (width / 2), -y + (height / 2));
}

function mouseClicked() {
    if (focused) {
        snake.setLevel(snake.level + 1);
        console.log('level up, now your level is: ', snake.level);
    }
}

function randomPos() {
  var cols = Math.floor(gameWidth / pixelUnit);
  var rows = Math.floor(gameHeight / pixelUnit);

  return {
    x: Math.floor(random(cols)) * pixelUnit,
    y: Math.floor(random(rows)) * pixelUnit
  };
}
/*
function collideSnake(pos, snakes) {
  var collides = false;
  snakes.forEach(function (snake) {
    snake.tails.forEach(function (tail) {
      if (pos.x == tail.x && pos.y == tail.y) {
        collides = true;
      }
    })
  });
  return collides;
}
*/

/*
function pauseModal(x, y) {
    if (paused) {
        fill('rgba(255,255,255, 0.5)');

        rect(x - (width / 2), y - (height / 2), width, height);
        fill(0, 255, 0);
        textSize(30);
        textAlign(RIGHT);
        text("Game is paused", x + (width / 2) - 30, y + (height / 2) - 30);
    }
}*/