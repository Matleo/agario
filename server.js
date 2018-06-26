var blobs = [];
var bots = [];
function Blob(id, x, y, r) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
}
function Bot(botID,x, y, type, owner) {
  this.id = botID;
  this.x = x;
  this.y = y;
  this.type = type;
  this.owner = owner;

  this.directionX = 0.9;
  this.directionY = 0.8;
}
var counter=0;
function addBot(type, coordinates, socketId){
  var x = coordinates[0];
  var y = coordinates[1];
  var botID = socketId + "_"+type+"-"+counter++;
  bots.push(new Bot(botID,x,y,type,socketId));
}

// Using express: http://expressjs.com/
var express = require('express');

// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var port = process.env.PORT;
if(port == undefined){
  port = 4000;
}

var server = app.listen(port,'0.0.0.0', listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 66); //call the function every n miliseconds

function heartbeat() {
  var data = {blobs:blobs,bots:bots};
  io.sockets.emit('heartbeat', data);
}



// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);


    socket.on('start',
      function(data) {
        var blob = new Blob(socket.id, data.x, data.y, data.r);
        blobs.push(blob);
      }
    );

    socket.on('update',
      function(data) {
        //update blob
        var blob;
        for (var i = 0; i < blobs.length; i++) {
          if (socket.id == blobs[i].id) {
            blob = blobs[i]; //set pointer
          }
        }
        if(blob != null){//might be null, due to asynchronous clientEaten callback
          blob.x = data.x;
          blob.y = data.y;
          blob.r = data.r;
        }
        //if this is first
        if(bots.length == 0){
          addBot("schnatz", data.botCoordinates[0],socket.id);
        }
      }
    );

    socket.on('clientEaten',
      function(id) {
        console.log("Server:"+id+" has gotten eaten. Game Over!");
        for(i=0; i<blobs.length;i++){
          if(blobs[i].id == id){
            blobs.splice(i,1);
          }
        }
        io.sockets.emit('gameOver', id);
      }
    );

    socket.on('botEaten',
      function(id) {
        console.log("Server: Bot ("+id+") got eaten.");
        for(i=0; i<bots.length;i++){
          if(bots[i].id == id){
            bots.splice(i,1);
          }
        }
        io.sockets.emit('botEaten', id);
      }
    );



    socket.on('disconnect', function() {
      for (var i = 0; i < blobs.length; i++) {
        if (socket.id == blobs[i].id) {
          blobs.splice(i,1);
        }
      }
      //if no players here, delete bots
      if(blobs.length==0){
        bots = [];
      }
      console.log("Client "+socket.id+" has disconnected");
    });
  }
);
