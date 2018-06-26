//searches for spawn coordninates, minunits away from existing
function getNonCollidingCoordinates(minunits){
  randomSeed(new Date().getTime());
  var x = random(-constrainX,constrainX-1);
  var y = random(-constrainY,constrainY-1);
  for(i = 0; i<blobs.length;i++){
    var thisBlob = blobs[i];
    if(dist(thisBlob.pos.x,thisBlob.pos.y,x,y) < initialSize + thisBlob.r + minunits){ // if colliding+minunits
      x = random(-constrainX,constrainX-1);
      y = random(-constrainY,constrainY-1);
      i = -1; //repeat loop
    }
  }
  var result = [x,y];
  return result;
}

function updateBot(bot, newBot){
  bot.justUpdated--;
  if(bot.justUpdated <= 0 && (bot.direction.x != newBot.directionX | bot.direction.y != newBot.directionY)){
    bot.pos.x = newBot.x;
    bot.pos.y = newBot.y;
    bot.direction.x = newBot.directionX;
    bot.direction.y = newBot.directionY;
    bot.justUpdated = 30;
  }
  console.log(bot.justUpdated);
}

//sets the amount of Food, so that to all time, the current amount of food is near the totalFoodValue
function setFood() {
  randomSeed(new Date().getTime());
  var currentValue = 0;
  for (i = 0; i < food.length; i++) {
    var myFood = food[i];
    currentValue += myFood.r;
  }
  var iterations = totalFoodValue - currentValue; //how many new Blobs with avg of 1 will be created
  for (i = 0; i < iterations/2; i++) {
    var x = random(-constrainX,constrainX-1);
    var y = random(-constrainY,constrainY-1);
    var size = random(0.2,2);
    var newBlob = new Blob("food", null, x,y,size,foodShape);
    food.push(newBlob);
  }
}


function initialiseMyself(){
  var initialCoordinates = getNonCollidingCoordinates(3);//how far away
  var x = initialCoordinates[0];
  var y = initialCoordinates[1];
  blob = new Blob("me", null, x , y, initialSize, null, constrainX, constrainY);// its me
  initiated = null;
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r
  };
  socket.emit('start', data);
}

function showFoodAndBlobsAndBots(){
  //food:
  for (i = food.length - 1; i >= 0; i--) {
    food[i].show();
    if (blob.eats(food[i])) {
       food.splice(i, 1);
    }
  }
  //bots:
  for (i = bots.length - 1; i >= 0; i--) {
    bots[i].update();
    if (blob.eats(bots[i])) {
       bots.splice(i, 1);
    }
  }
//blobs
  for (i = blobs.length - 1; i >= 0; i--) {
    var id = blobs[i].id;
    if (id !== socket.id) {// to not show and eat myself
      blobs[i].show();
      if (blob.eats(blobs[i])) {
        socket.emit('clientEaten', blobs[i].id);
        console.log("You have eaten"+blobs[i].id);
        blobs.splice(i, 1);
      }
    }
  }
}


function setupSocket(){
    // Start a socket connection to the server
    socket = io();

    socket.on('heartbeat',
      function(data) {
        //update blobs
        blobs = [];
        for(i = 0; i<data.blobs.length;i++){
          blobs.push(new Blob("enemy", data.blobs[i].id, data.blobs[i].x,data.blobs[i].y,data.blobs[i].r));// not me
        }

        //set bots initially
        if(data.bots.length != bots.length){
          bots = [];
          for(i = 0; i<data.bots.length;i++){
            var myBot = data.bots[i];
            if(myBot.owner == socket.id){
              bots.push(new Bot(myBot.id, myBot.x, myBot.y, myBot.type, constrainX, constrainY, true, myBot.directionX, myBot.directionY));
            }else{
              bots.push(new Bot(myBot.id, myBot.x, myBot.y, myBot.type, constrainX, constrainY, false, myBot.directionX, myBot.directionY));
            }
          }
        }else{//or update bots (without deleting them)
          for(i = 0; i<data.bots.length;i++){
            var myBot = data.bots[i];
            for(j=0; j<bots.length;j++){
              //search for this bot
              if(bots[j].id == myBot.id){
                updateBot(bots[j],myBot);//set x,y and directions
                break;
              }
            }
          }
        }
        //if was initial, now is not anymore
        if(initiated != null && !initiated){
          initiated = true;
        }
      }
    );

    socket.on('gameOver',
      function(id) {
        if(id == blob.id){
          die();
      }
    }
    );
}

function die(){
  var canvas = document.getElementById('canvas_container');
  canvas.style.visibility = 'hidden';

  var score_parent = document.getElementById('score_parent');
  score_parent.style.visibility = 'visible';

  var reconnect = document.getElementById('reconnect');
  reconnect.style.visibility = 'visible';
}
