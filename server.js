var gameState = {
  snakes: [],
  foods: [],
  leaderboard: []
};

var foodOnStage = 20;
var foodTypes = ['normal'];

/* might need to sync those values between clients and server */
var pixelUnit = 30;
var gameWidth = pixelUnit * 72;
var gameHeight = pixelUnit * 40;

function invalidPos(pos) {
  var collides = false;
  gameState.snakes.forEach(function (snake) {
    snake.t.forEach(function (tail) {
      if (pos.x == tail.x && pos.y == tail.y) {
        collides = true;
      }
    })
  });
  gameState.foods.forEach(function (food) {
    if (pos.x == food.x && pos.y == food.y) {
      collides = true;
    }
  });
  return collides;
}

function getRandomFoodType() {
  return foodTypes[Math.floor(Math.random() * foodTypes.length)];
}

function randomPos() {
  do {
    var cols = Math.floor(gameWidth / pixelUnit);
    var rows = Math.floor(gameHeight / pixelUnit);
  } while (invalidPos({
      x: cols,
      y: rows
    }));

  return {
    x: Math.floor((Math.random() * cols)) * pixelUnit,
    y: Math.floor((Math.random() * rows)) * pixelUnit
  };
}

function Food(type, x, y) {
  this.type = type;
  this.x = x;
  this.y = y;
}

function Snake(id, name, color, x, y, t, v, xSpeed, ySpeed, score, bestScore) {
  this.id = id;
  this.name = name;
  this.color = color;
  this.x = x;
  this.y = y;
  this.t = t;
  this.v = v;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.score = score;
  this.bestScore = bestScore;
}

function Leaderboard(name, score) {
  this.name = name;
  this.score = score;
}

var express = require('express');
var app = express();

var server = app.listen(process.env.PORT || 3000, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Snanake app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

var io = require('socket.io')(server);

setInterval(heartbeat, 33);

function heartbeat() {
  io.sockets.emit('heartbeat', gameState);
}
/*
setInterval(logging, 5000);
function logging() {
  var bom = randomPos();
  console.log(bom);
}
*/

setInterval(() => {
  io.sockets.emit('updateLeaderboard');
}, 10000); /* to-do find another way of updating the leaderboard in real time */

setInterval(generateFoods, 1000);

function generateFoods() {
  for (var i = 0; i < foodOnStage; i++) {
    if (gameState.foods.length < foodOnStage) {
      var np = randomPos();
      console.log('generating new food at x: ' + np.x + ' y: ' + np.y);
      var food = new Food(getRandomFoodType(), np.x, np.y);
      gameState.foods.push(food);
    }
  }
}

io.sockets.on('connection',
  function (socket) {
    console.log("We have a new client: " + socket.id);

    socket.on('initializeSnake',
      function (data) {
        var snake = new Snake(socket.id, data.name, data.color, data.x, data.y, data.t, data.v, data.xSpeed, data.ySpeed, data.score, data.bestScore);
        gameState.snakes.push(snake);
        /*
        var testScore = new Leaderboard('nope', 232);
        gameState.leaderboard.push(testScore);*/

      }
    );

    socket.on('updateSnake',
      function (data) {
        var snake;
        for (var i = 0; i < gameState.snakes.length; i++) {
          if (socket.id == gameState.snakes[i].id) {
            snake = gameState.snakes[i];
          }
        }
        snake.name = data.name;
        snake.color = data.color;
        snake.x = data.x;
        snake.y = data.y;
        snake.t = data.t;
        snake.v = data.v;
        snake.xSpeed = data.xSpeed;
        snake.ySpeed = data.ySpeed;
        snake.score = data.score;
        snake.bestScore = data.bestScore;
      }
    );

    socket.on('eatFood',
      function (index) {
        console.log('eating food ' + index);
        gameState.foods.splice(index, 1);
      });

    socket.on('deleteSnake', function (target) {
      for (var i = 0; i < gameState.snakes.length; i++) {
        if (gameState.snakes[i].id == target) {
          var bscore = new Leaderboard(gameState.snakes[i].name, gameState.snakes[i].bestScore);
          gameState.leaderboard.push(bscore);
          gameState.snakes.splice(i, 1);

        }
      }
      console.log(target + " has died");
    })
    socket.on('disconnect', function () {
      for (var i = 0; i < gameState.snakes.length; i++) {
        if (gameState.snakes[i].id == socket.id) {
          var bscore = new Leaderboard(gameState.snakes[i].name, gameState.snakes[i].bestScore);
          gameState.leaderboard.push(bscore);
          gameState.snakes.splice(i, 1);
        }
      }
      console.log("Client has disconnected");
    });
  }
);