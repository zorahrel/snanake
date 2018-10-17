var gameState = {
  snakes: [],
  foods: []
};

var foodOnStage = 15;
var foodTypes = ['normal', 'plustwo', 'plusfive', 'timestwo'];

/* might need to sync those values between clients and server */
var pixelUnit = 30;
var gameWidth = pixelUnit * 72;
var gameHeight = pixelUnit * 40;

function getRandomFoodType() {
  return foodTypes[Math.floor(Math.random() * foodTypes.length)];
}

function randomPos() {
  var cols = Math.floor(gameWidth / pixelUnit);
  var rows = Math.floor(gameHeight / pixelUnit);
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

function Snake(id, x, y, t, v, xSpeed, ySpeed, score) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.t = t;
  this.v = v;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
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

setInterval(generateFoods, 1000);

function generateFoods() {
  for (var i = 0; i < foodOnStage; i++) {
    if (gameState.foods.length < foodOnStage) {
      var np = randomPos();
      //console.log(newrandomfoodpos);
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
        var snake = new Snake(socket.id, data.x, data.y, data.t, data.v, data.xSpeed, data.ySpeed, data.score);
        gameState.snakes.push(snake);
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
        snake.x = data.x;
        snake.y = data.y;
        snake.t = data.t;
        snake.v = data.v;
        snake.xSpeed = data.xSpeed;
        snake.ySpeed = data.ySpeed;
        snake.score = data.score;
      }
    );

    socket.on('eatFood',
      function (index) {
        console.log('ho mangiato qualcosa :O');
        gameState.foods.splice(index, 1);
      });

    socket.on('disconnect', function () {
      for (var i = 0; i < gameState.snakes.length; i++) {
        if (gameState.snakes[i].id == socket.id) {
          gameState.snakes.splice(i, 1);
        }
      }
      console.log("Client has disconnected");
    });
  }
);

function randomPos() {
  var cols = Math.floor(gameWidth / pixelUnit);
  var rows = Math.floor(gameHeight / pixelUnit);
  //console.log((Math.random() * cols) + 1);
  return {
    x: Math.floor((Math.random() * cols)) * pixelUnit,
    y: Math.floor((Math.random() * rows)) * pixelUnit
  };
}