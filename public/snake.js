function Snake(x, y, t, v) {
    this.x = x;
    this.y = y;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.initialSpeed = v;
    this.speed = this.initialSpeed;
    this.level = t;
    this.tails = [];
    
    this.update = function() {
        for(var i=this.level; i>0; i--) {
            this.tails[i] = this.tails[i-1];
        }
        this.tails[0] = { x: this.x, y: this.y };

        var newX = this.x + (this.xSpeed*this.speed);
        if(newX < gameWidth && newX > -pixelUnit) {
            this.x = newX;
        } else {
            if(newX < 0) {
                this.x = gameWidth-pixelUnit;
            }
            if(newX+pixelUnit > gameWidth) {
                this.x = 0;
            }
        }
        
        var newY = this.y + (this.ySpeed*this.speed);
        if(newY < gameHeight && newY > -pixelUnit) {
            this.y = newY;
        } else {
            if(newY < 0) {
                this.y = gameHeight-pixelUnit;
            }
            if(newY+pixelUnit > gameHeight) {
                this.y = 0;
            }
        }
        
    }

    this.show = function() {
        fill(255);
        var that = this;
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
            
            // Body draw
            switch(type) {
                case 'head':
                    fill(255,0,0);
                break;
                case 'body':
                case 'tail':
                    fill(100,0,100);
                break;
                case 'one':
                    fill(255,255,0);
                break;
            }
            rect(tail.x, tail.y, pixelUnit, pixelUnit);
            
            // Eyes draw
            if (type === 'head' || type === 'one') {
                var leftEyeOffset = {};
                var rightEyeOffset = {};
                
                leftEyeOffset.y = that.ySpeed > 0 ? 2/3 : 1/3;
                rightEyeOffset.y = that.ySpeed >= 0 ? 2/3 : 1/3;
                leftEyeOffset.x = that.xSpeed > 0 ? 2/3 : 1/3;
                rightEyeOffset.x = that.xSpeed >= 0 ? 2/3 : 1/3;

                fill(0);
                ellipse(tail.x + pixelUnit*leftEyeOffset.x, tail.y + pixelUnit*leftEyeOffset.y, 3, 3);
                ellipse(tail.x + pixelUnit*rightEyeOffset.x, tail.y + pixelUnit*rightEyeOffset.y, 3, 3);
            }
        });
        this.tails = tails;
    }
    /*
    this.eat = function() {
        pos = { x: this.x, y: this.y };
        lev = this.level;
        var snake = this;
        foods.forEach(function(food, index) {
            if(food.position.x == pos.x && food.position.y == pos.y) {
                console.log(food.type);
                switch(food.type) {
                    case 'normal':
                        lev = lev+1;
                    break;
                    case 'speed':
                        frameRate(gamespeed*=1.5);
                        setTimeout(function() {
                            frameRate(gamespeed/=1.5);
                        }, 4000)
                    break;
                }
                foods.splice(index, 1);
                generateFood();
            }
        });
        this.setLevel(lev);
        return false;
    }

    this.setLevel = function(level) {
        s.level = level;
        bestScore = (bestScore>level)?bestScore:level;
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
        document.getElementById('bestscore').innerHTML = 'Best Score: '+bestScore;
    }
    */
    this.dir = function(xSpeed, ySpeed) {
        if(xSpeed*this.xSpeed == 0 || this.level==0) {
            this.xSpeed = xSpeed;
        }
        if(ySpeed*this.ySpeed == 0 || this.level==0) {
            this.ySpeed = ySpeed;   
        }
    }
}
