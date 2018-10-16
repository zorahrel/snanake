var snakes = [];

function Snake(id, x, y, t, v) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.t = t;
  this.v = v;
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
  io.sockets.emit('heartbeat', snakes);
}

io.sockets.on('connection',
  function(socket) {
    console.log("We have a new client: " + socket.id);

    socket.on('start',
      function(data) {
        var snake = new Snake(socket.id, data.x, data.y, data.t, data.v);
        snakes.push(snake);
      }
    );
    socket.on('update',
      function(data) {
        var snake;
        for (var i = 0; i < snakes.length; i++) {
          if (socket.id == snakes[i].id) {
            snake = snakes[i];
          }
        }
        snake.x = data.x;
        snake.y = data.y;
        snake.t = data.t;
        snake.v = data.v;
      }
    );

    socket.on('disconnect', function() {
      for (var i = 0; i < snakes.length; i++) {
        if (snakes[i].id == socket.id ) {
          snakes.slice(i, 1);
        }
      }
      console.log("Client has disconnected");
    });
  }
);
