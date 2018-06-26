var socket;

var blob; //me
var blobs = []; //enemys+me (from server)
var food = [];
var bots = [];

var totalFoodValue;
var foodShape; //make food look different
var initialSize = 10;

var zoom = 1;
var initiated = false; //gets set to true, after first heartbeat

var constrainX;
var constrainY;


function preload(){
      background_music = loadSound('assets/background_music.mp3');
      pop_sound = loadSound('assets/pop_sound.mp3');
      eaten_enemy = loadSound("assets/eaten_enemy.mp3")
      schnatz_sound = loadSound("assets/schnatz_sound.mp3");

      background_image = loadImage("assets/sky-background.jpg");
}

function setup() {
  setupSocket();
  var canvas = createCanvas(1800, 900);
  canvas.parent('canvas_container'); //put canvas in its html div container

  c = 8;
  constrainX = width/c;
  constrainY = height/c;
  totalFoodValue = 3000/(c*c);
  foodShape = random(0,4000);
  //set food:
  setFood();

  background_music.loop(0,1,0.1);//start music
}


function draw() {
  if(socket == undefined){
    return;
  }

  //if blobs arrived by heartbeat, now initialize me
  if(initiated != null && initiated){
    initialiseMyself();
  }

  //if blobs are here, and
  if(initiated == null){
    if(blob.id == null){
      blob.id = socket.id;
    }

    background(background_image);
    translate(width / 2, height / 2);

    var newzoom = 64 / blob.r;
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);

    translate(-blob.pos.x, -blob.pos.y); //make world move i think

    showFoodAndBlobsAndBots();

    setFood(); //set food, so that always same amount of food available

    blob.show(); //me
    if (mouseIsPressed) {
      blob.update();
    }


    //send all bots that i have ownership of
    var myBots = [];
    for(i=0; i<bots.length;i++){
      if(bots[i].owner){
        var myBot = bots[i];
        myBots.push({
                    id:myBot.id,
                    x:myBot.pos.x,
                    y:myBot.pos.y,
                    directionX:myBot.direction.x,
                    directionY:myBot.direction.y});
      }
    }
    var maybeBotCoordinates = [getNonCollidingCoordinates(10),getNonCollidingCoordinates(10),getNonCollidingCoordinates(10)];  //new coordinates, that could be used  for a bot
    var data = {
      x: blob.pos.x,
      y: blob.pos.y,
      r: blob.r,
      myBots: myBots,
      botCoordinates: maybeBotCoordinates
    };
    socket.emit('update', data);
  }
}
