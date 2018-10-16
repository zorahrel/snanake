//var paused = false;
//var bestScore = 0;

var socket, snake, snakes = [];

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
  snake = new Snake(random(width), random(height), [], 1);
  //generateFoods();

  //document.getElementById('pause').addEventListener('click', pause);
  var data = {
    x: snake.x,
    y: snake.y,
    t: snake.t,
    v: snake.v
  }
  socket.emit('start', data);

  socket.on('heartbeat',
    function (data) {
      snakes = data;
    }
  )
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
  for (var i = snakes.length - 1; i >= 0; i--) {
    var id = snakes[i].id;
    if (id.substring(2, id.length) !== socket.id) {
      fill(0, 0, 255);
      rect(snakes[i].x, snakes[i].y, 30, 30);

      fill(0);
      textAlign(CENTER);
      textSize(12);
      text(snakes[i].id, snakes[i].x, snakes[i].y + 38);
    }
  }


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
  

  var data = {
    x: snake.x,
    y: snake.y,
    t: snake.t,
    v: snake.v
  }
  socket.emit('update', data);
}


function scrollingCamera(x, y) {
    translate(-x + (width / 2), -y + (height / 2));
}
/*
function mouseClicked() {
    if (focused) {
        s.setLevel(s.level + 1);
        console.log('level up, now your level is: ', s.level);
    }
}



function collideSnake(pos, snake) {
    var collides = false;
    snake.tails.forEach(function (tail) {
        if (pos.x == tail.x && pos.y == tail.y) {
            collides = true;
        }
    });

    return collides;
}

function randomPos() {
    var cols = floor(gameWidth / pixelUnit);
    var rows = floor(gameHeight / pixelUnit);

    return {
        x: floor(random(cols)) * pixelUnit,
        y: floor(random(rows)) * pixelUnit
    };
}

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