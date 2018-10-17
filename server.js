var gameState = { snakes: [], foods: [] };

var foodOnStage = 1;
var foodTypes = ['normal', 'speed'];

function getRandomFoodType() {
  return foodTypes[Math.floor(Math.random() * foodTypes.length)];
}

function Food(type, x, y) {
  this.type = type;
  this.x = x;
  this.y = y;
}

function Snake(id, x, y, t, v, xSpeed, ySpeed) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.t = t;
  this.v = v;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
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
function logging() {console.log(gameState.foods)}
*/
setInterval(generateFoods, 1000);

function generateFoods() {
  for(var i = 0; i<foodOnStage; i++) {
      if(gameState.foods.length < foodOnStage) {
        io.sockets.emit('requestingRandomPos', /**/);
      }
  }
}

io.sockets.on('connection',
  function(socket) {
    console.log("We have a new client: " + socket.id);

    socket.on('initializeSnake',
      function(data) {
        var snake = new Snake(socket.id, data.x, data.y, data.t, data.v, data.xSpeed, data.ySpeed);
        gameState.snakes.push(snake);
      }
    );

    socket.on('randomPos', function(pos) {
      console.log('ho ricevuto una pos');
      var food = new Food(getRandomFoodType(), pos.x, pos.y);
      gameState.foods.push(food);
    })

    socket.on('updateSnake',
      function(data) {
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
      }
    );

    socket.on('disconnect', function() {
      for (var i = 0; i < gameState.snakes.length; i++) {
        if (gameState.snakes[i].id == socket.id ) {
          gameState.snakes.splice(i, 1);
        }
      }
      console.log("Client has disconnected");
    });
  }
);
