
//sets the amount of Food, so that to all time, the current amount of food is near the totalFoodValue
function setFood() {
  var currentValue = 0;
  for (i = 0; i < food.length; i++) {
    var myFood = food[i];
    currentValue += myFood.r;
  }
  var iterations = totalFoodValue - currentValue; //how many new Blobs with avg of 1 will be created
  for (i = 0; i < iterations/2; i++) {
    var newBlob = new Blob("food", null, random(-constrainX,constrainX-1),random(-constrainY,constrainY-1),random(1,3),foodShape);
    food.push(newBlob);
  }
}

//searches for spawn coordninates, minunits away from existing
function getNonCollidingCoordinates(minunits){
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

function initialiseMyself(){
  var initialCoordinates = getNonCollidingCoordinates(3);//how far away
  var x = initialCoordinates[0];
  var y = initialCoordinates[1];
  blob = new Blob("me", null, x , y, initialSize, null, sprite_image);// its me
  initiated = null;
  var maybeBotCoordinates = getNonCollidingCoordinates(3);  //new coordinates, that could be used  for a bot
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    botCoordinates: maybeBotCoordinates
  };
  socket.emit('start', data);
}

function showFoodAndBlobs(){
  var totalValue = 0;
  for (i = food.length - 1; i >= 0; i--) {
    food[i].show();
    totalValue+=food[i].r;
    if (blob.eats(food[i])) {
       food.splice(i, 1);
    }
  }

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
        blobs = [];
        for(i = 0; i<data.blobs.length;i++){
          blobs.push(new Blob("enemy", data.blobs[i].id, data.blobs[i].x,data.blobs[i].y,data.blobs[i].r));// not me
        }
        bots = [];
        for(i = 0; i<data.bots.length;i++){
          var myBot = data.bots[i];
          bots.push(new Bot(myBot.id, myBot.x, myBot.y,myBot.type));
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
          var canvas = document.getElementById('canvas_container');
          canvas.style.visibility = 'hidden';
      }
    }
    );
}
