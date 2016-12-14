var foods = [];
var s = new Snake();

function setup() {
    pixelUnit = 30;
    baseSpeed = pixelUnit;

    var width = pixelUnit * 15;
    var height = pixelUnit * 15;

    createCanvas(width, height);

    generateFood();
    frameRate(8);
}

function draw() {
    background(0);
    s.update();
    s.show();
    s.eat();
    s.eatHimSelf();
    s.score();
}

function mouseClicked() {
    s.level = s.level+1;
    console.log('level up, now your level is: ', s.level);
}

function keyPressed() {
    switch(keyCode) {
        case UP_ARROW:
            s.dir(0, -baseSpeed);
        break;
        case DOWN_ARROW:
            s.dir(0, baseSpeed);
        break;
        case RIGHT_ARROW:
            s.dir(baseSpeed, 0);
        break;
        case LEFT_ARROW:
            s.dir(-baseSpeed, 0);
        break;
    }
}

function generateFood() {
    do {
        food = randomPos();
    } while(collideSnake(food, s));
    foods.push(food);
}

function collideSnake(pos, snake) {
    var collides = false;
    snake.tails.forEach(function(tail) {
        if(pos.x == tail.x && pos.y == tail.y) {
            collides = true;
        }
    });

    return collides;
}

function randomPos() {
    var cols = floor(width/pixelUnit);
    var rows = floor(width/pixelUnit);
    
    return {
        x: floor(random(cols))*pixelUnit,
        y: floor(random(rows))*pixelUnit
    };
}

function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.level = 0;
    this.tails = [];
    
    this.update = function() {
        for(var i=this.level; i>0; i--) {
            this.tails[i] = this.tails[i-1];
        }
        this.tails[0] = { x: this.x, y: this.y };

        var newX = this.x + this.xSpeed;
        if(newX < width && newX > -pixelUnit) {
            this.x = newX;
        } else {
            if(newX < 0) {
                this.x = width-pixelUnit;
            }
            if(newX+pixelUnit > width) {
                this.x = 0;
            }
        }
        
        var newY = this.y + this.ySpeed;
        if(newY < height && newY > -pixelUnit) {
            this.y = newY;
        } else {
            if(newY < 0) {
                this.y = height-pixelUnit;
            }
            if(newY+pixelUnit > height) {
                this.y = 0;
            }
        }
    }

    this.show = function() {
        fill(255);
        var tails = this.tails;
        tails.forEach(function(tail, index) {
            var type = 'body';
            if(index == 0 && tails.length>1) { // Testa
                type = 'head';
            }
            if(index+1 == tails.length && tails.length>1) { // Coda
                type = 'tail';
            }
            if(index == 0 && index+1 == tails.length) { // Pezzo unico
                type = 'one';
            }
            
            switch(type) {
                case 'head':
                    fill(255,0,0);
                break;
                case 'body':
                case 'tail':
                    fill(255,255,255);
                break;
                case 'one':
                    fill(255,255,0);
                break;
            }
            rect(tail.x, tail.y, pixelUnit, pixelUnit);
        });
        this.tails = tails;

        foods.forEach(function(food) {
            fill(0, 255, 0);
            rect(food.x, food.y, pixelUnit, pixelUnit);
        }, this);
    }
    
    this.eat = function() {
        pos = { x: this.x, y: this.y };
        lev = this.level;
        foods.forEach(function(food, index) {
            if(food.x == pos.x && food.y == pos.y) {
                lev = lev+1;
                generateFood();
                foods.splice(index, 1);
            }
        });
        this.level = lev;
        return false;
    }

    this.eatHimSelf = function() {
        var lev = this.level;
        var tails = this.tails;
        for(var i=0; i<tails.length-1; i++) {
            if(i==0) {
                continue;
            }
            if(tails[i].x == this.x && tails[i].y == this.y) {
                for(var iB = i; iB<lev; iB++) {
                    tails = tails.splice(0, iB);
                }
                lev = i;
                console.log('cazz, megg magnat a cor');
                break;
            }
        }
        this.tails = tails;
        this.level = lev;
        
        return false;
    }

    this.score = function() {
        document.getElementById('score').innerHTML = 'Score: '+this.level;
    }

    this.dir = function(xSpeed, ySpeed) {
        if(xSpeed*this.xSpeed == 0 || this.level==0) {
            this.xSpeed = xSpeed;
        }
        if(ySpeed*this.ySpeed == 0 || this.level==0) {
            this.ySpeed = ySpeed;   
        }
    }
}
