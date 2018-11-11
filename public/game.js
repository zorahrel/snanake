var socket, snake, gameState = {
  snakes: [],
  foods: [],
  leaderboard: []
};

var initialGamespeed = 8;
var gameWidth, gameHeight;

var time = 'firstStep';

function setup() {
  //socket = io.connect(window.location.hostname);
  socket = io.connect('http://localhost:3000');
  
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
  frameRate(60);
  var textName = document.getElementById('nameText');
  var colorPicker = document.getElementById('colorPicker');

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
    this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode); // rimuovi il popup
    var snakePos = randomPos();
    snake = new Snake('self', textName.value.substring(0, 18), colorPicker.value, snakePos.x, snakePos.y, [], 1, 0, 0, 0, 0);

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

  document.getElementById('openLeaderboard').onclick = function () {
    var leaderboard = document.getElementById('leaderboard');
    (leaderboard.style.display == "none") ? leaderboard.style.display = "block": leaderboard.style.display = "none";
  }

  socket.on('heartbeat',
    function (data) {
      gameState.snakes = data.snakes;
      gameState.foods = data.foods;
      gameState.leaderboard = data.leaderboard;
    }
  );

  socket.on('updateLeaderboard', function () {
      updateLeaderboard();
    });

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);

  if (typeof snake !== 'undefined') {
    var previousX = snake.x;
    var previousY = snake.y;

    var data = {
      name: this.name,
      color: this.color,
      x: this.x,
      y: this.y,
      t: this.t,
      v: this.v,
      xSpeed: this.xSpeed,
      ySpeed: this.ySpeed,
      score: this.score,
      bestScore: this.bestScore
    }
    socket.emit('updateSnake', data);

    scrollingCamera(snake.x, snake.y);

    document.getElementById('score').innerHTML = 'Score: ' + snake.score;
    document.getElementById('bestscore').innerHTML = 'Best Score: ' + snake.bestScore;
    
    snake.show();
    time = snake.update(time);

    snake.eat();
    snake.eatSelf();
    snake.eatSnake();
    
    

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
    var swiper = new Swipe(document);
    swiper.onUp(function () {
      snake.dir(0, -baseSpeed);
    });
    swiper.onDown(function () {
      snake.dir(0, baseSpeed);
    });
    swiper.onLeft(function () {
      snake.dir(-baseSpeed, 0);
    });
    swiper.onRight(function () {
      snake.dir(baseSpeed, 0);
    });
    swiper.run();
    /* end swipe handler */   
    
  }

  // draw other snakes
  for (var i = gameState.snakes.length - 1; i >= 0; i--) {
    var id = gameState.snakes[i].id;
    if (id !== socket.id) {
      var anotherSnake = new Snake(id, gameState.snakes[i].name, gameState.snakes[i].color, gameState.snakes[i].x, gameState.snakes[i].y, gameState.snakes[i].t, gameState.snakes[i].v, gameState.snakes[i].xSpeed, gameState.snakes[i].ySpeed, gameState.snakes[i].score, gameState.snakes[i].bestScore);

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

function hextorgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

const updateLeaderboard = () => {
  var leaderboard = document.getElementById('listcontainer');

  while (leaderboard.firstChild) {
    leaderboard.removeChild(leaderboard.firstChild);
  } /* clear leaderboard every time */

  if (gameState.leaderboard.length > 1) {
    var sortedByBiggest = gameState.leaderboard.sort(dynamicSort('-score'));
    for (i = 0; i < sortedByBiggest.length; i++) {
      if(i == 20) { break }; // break the listing if it goes beyond index 19 (because it's a top 20)
      var newListElement = document.createElement('div');
      if(i == 0) {
        newListElement.innerHTML = '<div id="leaderboardTrophy"><img src="assets/gold.jpg" /></div><div id="leaderboardName">' + sortedByBiggest[i].name + '</div><div id="leaderboardScore">' + sortedByBiggest[i].score + '</div>';
      } else {
        newListElement.innerHTML = '<div id="leaderboardTrophy"></div><div id="leaderboardName">' + sortedByBiggest[i].name + '</div><div id="leaderboardScore">' + sortedByBiggest[i].score + '</div>';
      }
      leaderboard.appendChild(newListElement);
    }
  } else if (gameState.leaderboard.length == 1) {
    var newListElement = document.createElement('div');
    newListElement.innerHTML = '<div id="leaderboardTrophy"><img src="assets/gold.jpg" /></div><div id="leaderboardName">' + gameState.leaderboard[0].name + '</div><div id="leaderboardScore">' + gameState.leaderboard[0].score + '</div>';

    leaderboard.appendChild(newListElement);
  }
}

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}