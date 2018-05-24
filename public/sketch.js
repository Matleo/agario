var socket;
var blob;
var blobs = [];
var zoom = 1;

var constrainX;
var constrainY;

function setup() {
  createCanvas(600, 600);
  c = 16;
  constrainX = width/c;
  constrainY = height/c;

  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:4000');

  var w = random(constrainX-25);//parameter does not effect outcome
  var h = random(constrainY-25);
  blob = new Blob(true, null, w , h, random(8, 24));// its me

  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r
  };
  socket.emit('start', data);

  socket.on('heartbeat',
    function(data) {
      blobs = [];
      for(i = 0; i<data.length;i++){
        blobs.push(new Blob(false, data[i].id, data[i].x,data[i].y,data[i].r));// not me
      }
    }
  );


}

function draw() {
  if(blob.id == null){
    blob.id = socket.id;
  }

  background(0);
  translate(width / 2, height / 2);

  var newzoom = 64 / blob.r;
  zoom = lerp(zoom, newzoom, 0.1);
  scale(zoom);

  translate(-blob.pos.x, -blob.pos.y); //make world move i think



  for (i = blobs.length - 1; i >= 0; i--) {
    var id = blobs[i].id;
    if (id !== socket.id) {
      blobs[i].show();
    }
    //TODO:
    // if (blob.eats(blobs[i])) {
    //   blobs.splice(i, 1);
    // }
  }



  blob.show();
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
