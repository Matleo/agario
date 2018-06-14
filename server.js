var blobs = [];
var bots = [];
function Blob(id, x, y, r) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
}
function Bot(id, x, y, type) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.type = type;
}
function addBot(botId,coordinates,type){
  var x = coordinates[0];
  var y = coordinates[1];
  bots.push(new Bot(botId,x,y,type));
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
        console.log(socket.id + ": " + data.x + " " + data.y + " " + data.r);
        var blob = new Blob(socket.id, data.x, data.y, data.r);
        blobs.push(blob);

        var botType = "default";
        var botId = socket.id + "-"+botType;
        addBot(botId, botType, data.botCoordinates);
      }
    );

    socket.on('update',
      function(data) {
        //console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
        var blob;
        for (var i = 0; i < blobs.length; i++) {
          if (socket.id == blobs[i].id) {
            blob = blobs[i];
          }
        }
        if(blob != null){//might be null, due to asynchronous clientEaten callback
          blob.x = data.x;
          blob.y = data.y;
          blob.r = data.r;
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



    socket.on('disconnect', function() {
      for (var i = 0; i < blobs.length; i++) {
        if (socket.id == blobs[i].id) {
          blobs.splice(i,1);
        }
      }
      console.log("Client "+socket.id+" has disconnected");
    });
  }
);
