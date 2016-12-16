function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.level = 0;
    this.tails = [];
    
    this.scrollingCamera = function(){
        translate(-this.x+(width/2), -this.y+(height/2));   
    }

    this.pauseModal = function(x, y) {
        if(paused) {
            fill('rgba(255,255,255, 0.5)');
            
            rect(x-(width/2), y-(height/2), width, height);
            fill(0,255, 0);
            textSize(30);
            textAlign(LEFT);
            text("Game is paused", x-(width/2)+30, y+(height/2)-30);
        }
    }
    
    this.update = function() {
        for(var i=this.level; i>0; i--) {
            this.tails[i] = this.tails[i-1];
        }
        this.tails[0] = { x: this.x, y: this.y };
        
        var newX = this.x + this.xSpeed;
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
        
        var newY = this.y + this.ySpeed;
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
                    fill(100,0,100);
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

    this.dir = function(xSpeed, ySpeed) {
        if(xSpeed*this.xSpeed == 0 || this.level==0) {
            this.xSpeed = xSpeed;
        }
        if(ySpeed*this.ySpeed == 0 || this.level==0) {
            this.ySpeed = ySpeed;   
        }
    }
}
