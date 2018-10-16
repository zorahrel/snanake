var foods = [];
var foodOnStage = 10;

var foodTypes = ['normal', 'speed'];

function getRandomFoodType() {
    return foodTypes[Math.floor(Math.random() * foodTypes.length)];
}

function generateFood() {
    do {
        foodPos = randomPos();
    } while(collideSnake(foodPos, s));
    foods.push({
        type: getRandomFoodType(),
        position: foodPos
    });
}

function generateFoods() {
    for(var i = 0; i<foodOnStage; i++) {
        generateFood();
    }
}

function showFood() {
    foods.forEach(function(food) {
        switch(food.type) {
            default:
            case 'normal':
                fill(205, 133, 0);
                rect(food.position.x, food.position.y, pixelUnit, pixelUnit);
            break;
            case 'speed':
                fill(0, 255, 0);
                rect(food.position.x, food.position.y, pixelUnit, pixelUnit);
                fill(0);
                textAlign(CENTER);
                textSize(30);
                text('s', food.position.x+15, food.position.y+15+7.5);
            break;
        }
    }, this);
}