function Snake(id, name, x, y, t, v, xSpeed, ySpeed, score, bestScore) {
  this.id = id;
  this.name = name;
  this.x = x;
  this.y = y;
  this.xSpeed = xSpeed;
  this.ySpeed = ySpeed;
  this.initialSpeed = v;
  this.speed = this.initialSpeed;
  this.level = 0;
  this.t = t;
  this.score = score;
  this.bestScore = bestScore;

  this.update = function () {
    for (var i = this.level; i > 0; i--) {
      this.t[i] = this.t[i-1]; //+1

      /* fix temporaneo / permanente per i food potenziati */
      if(this.t[i-1] == null) { //+2
        this.t[i] = this.t[i-2];
        if(this.t[i-2] == null) { //+5
          this.t[i-3] = this.t[i-5];
          this.t[i-2] = this.t[i-5];
          this.t[i-1] = this.t[i-5];
          this.t[i] =this.t[i-5];
          //console.log(this.t);
          if(this.t[i-5] == null) { //x2
            this.t[i] = this.t[i-(this.level/2)]
          }
        }
      }
    }
    this.t[0] = {
      x: this.x,
      y: this.y
    };

    var newX = this.x + (this.xSpeed * this.speed);
    if (newX < gameWidth && newX > -pixelUnit) {
      this.x = newX;
    } else {
      if (newX < 0) {
        this.x = gameWidth - pixelUnit;
      }
      if (newX + pixelUnit > gameWidth) {
        this.x = 0;
      }
    }

    var newY = this.y + (this.ySpeed * this.speed);
    if (newY < gameHeight && newY > -pixelUnit) {
      this.y = newY;
    } else {
      if (newY < 0) {
        this.y = gameHeight - pixelUnit;
      }
      if (newY + pixelUnit > gameHeight) {
        this.y = 0;
      }
    }
  }

  this.show = function () {
    fill(255);
    var that = this;
    var tails = this.t;
    tails.forEach(function (tail, index) {
      var type = 'body';
      if (index == 0 && tails.length > 1) { // Testa
        type = 'head';
      }
      if (index + 1 == tails.length && tails.length > 1) { // Coda
        type = 'tail';
      }
      if (index == 0 && index + 1 == tails.length) { // Pezzo unico
        type = 'one';
      }
      // Body draw
      switch (type) {
        case 'head':
          fill(255, 0, 0);
          break;
        case 'body':
        case 'tail':
          if(that.id === 'self') {
            fill(100, 0, 100);
          } else {
            fill(135,206,250);
          }
          break;
        case 'one':
          fill(255, 255, 0);
          break;
      }
      rect(tail.x, tail.y, pixelUnit, pixelUnit);

      // Eyes draw
      if (type === 'head' || type === 'one') {
        var leftEyeOffset = {};
        var rightEyeOffset = {};

        leftEyeOffset.y = that.ySpeed > 0 ? 2 / 3 : 1 / 3;
        rightEyeOffset.y = that.ySpeed >= 0 ? 2 / 3 : 1 / 3;
        leftEyeOffset.x = that.xSpeed > 0 ? 2 / 3 : 1 / 3;
        rightEyeOffset.x = that.xSpeed >= 0 ? 2 / 3 : 1 / 3;

        fill(0);
        ellipse(tail.x + pixelUnit * leftEyeOffset.x, tail.y + pixelUnit * leftEyeOffset.y, 3, 3);
        ellipse(tail.x + pixelUnit * rightEyeOffset.x, tail.y + pixelUnit * rightEyeOffset.y, 3, 3);
      }
    });
    this.t = tails;
  }

  this.eat = function () {
    pos = {
      x: this.x,
      y: this.y
    };
    lev = this.level;
    gameState.foods.forEach(function (food, index) {
      if (food.x == pos.x && food.y == pos.y) {
        switch (food.type) {
          case 'normal':
            lev +=1;
            break;
          case 'plustwo':
            lev +=2;
            break;
          case 'plusfive':
            lev +=5;
            break;
          case 'timestwo':
            lev *=2;
            break;
        }
        
        socket.emit('eatFood', index);
      }
    });
    this.setLevel(lev);
  }

  this.setLevel = function (level) {
    this.level = level;
    this.score = level;
    this.bestScore = (this.bestScore>level)?this.bestScore:level;
  }
  
  this.eatSelf = function() {
      var lev = this.level;
      var tails = this.t;
      for(var i=0; i<tails.length-1; i++) {
          if(i==0) {
              continue;
          }
          if(tails[i].x == this.x && tails[i].y == this.y) {
              for(var iB = i; iB<lev; iB++) {
                  tails = tails.splice(0, iB);
              }
              lev = i;
              break;
          }
      }
      this.t = tails;
      this.level = lev;
  }
  
  this.eatSnake = function() {
    if(collideSnake({x: this.t[0].x, y: this.t[0].y}, socket.id)){
      snake = undefined;
      socket.emit('deleteSnake', socket.id);
      document.getElementById('deathAlert').style.display = "block";
    }
  }

  this.dir = function (xSpeed, ySpeed) {
    if (xSpeed * this.xSpeed == 0 || this.level == 0) {
      this.xSpeed = xSpeed;
    }
    if (ySpeed * this.ySpeed == 0 || this.level == 0) {
      this.ySpeed = ySpeed;
    }
  }
}