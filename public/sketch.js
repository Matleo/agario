var socket;
var port;

var blob;
var blobs = [];
var food = [];

var totalFoodValue = 75;
var initialSize = 12;
var marginToBeEaten = 0.8;

var zoom = 1;
var initiated = false; //gets set to true, after first heartbeat

var constrainX;
var constrainY;

function preload(){
      background_music = loadSound('assets/background_music.mp3');
      pop_sound = loadSound('assets/pop_sound.mp3');
      eaten_enemy = loadSound("assets/eaten_enemy.mp3")
}

function setup() {
  port = readPort();
  var canvas = createCanvas(900, 600);
  canvas.parent('canvas_container'); //put canvas in its html div container

  c = 4;
  constrainX = width/c;
  constrainY = height/c;
  //set food:
  setFood();

  background_music.loop(0,1,0.1);//start music
}

function setupSocket(){
    // Start a socket connection to the server
    socket = io.connect('https://stormy-cove-42139.herokuapp.com/:'+port);


    socket.on('heartbeat',
      function(data) {
        blobs = [];
        for(i = 0; i<data.length;i++){
          blobs.push(new Blob(false, data[i].id, data[i].x,data[i].y,data[i].r));// not me
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

    background(0);
    translate(width / 2, height / 2);

    var newzoom = 64 / blob.r;
    zoom = lerp(zoom, newzoom, 0.1);
    scale(zoom);

    translate(-blob.pos.x, -blob.pos.y); //make world move i think

    showFoodAndBlobs();

    setFood(); //set food, so that always same amount of food available

    blob.show(); //me
    if (mouseIsPressed) {
      blob.update();
    }
    blob.constrain(constrainX, constrainY);

    var data = {
      x: blob.pos.x,
      y: blob.pos.y,
      r: blob.r
    };
    socket.emit('update', data);
  }
}
