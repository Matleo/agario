class Blob {
  constructor(type, id, x, y, r, foodRandomNumber, image){
    this.type = type; //is it the user's Blob or some other from server.  false true
    this.id = id;
    this.vel = createVector(0, 0);
    this.pos = createVector(x, y);
    this.r = r;
    this.image = image;

    this.counter = 0;
    this.wobble = [this.r*2,this.r*2]; //store wobble sizes here
    this.wobbleStrength = 0.003; //how much wobble
    this.wobbleCount = 0; //how long to wobble

    this.scribble = new Scribble();
    this.foodRandomNumber = foodRandomNumber;//to make food look different each game

    this.marginToBeEaten = 0.8;

  }

  update() {
    var newvel = createVector(mouseX - width / 2, mouseY - height / 2);
    newvel.div(100);
    //newvel.setMag(3);
    newvel.limit(3);
    this.vel.lerp(newvel, 0.2); //grow slowly (0.2) to the newvel
    this.pos.add(this.vel);
  }


  //dont allow blobs to run out of boundaries
  constrain(constrainX, constrainY) {
    if(this.pos.x + this.r > constrainX){ //if x_over
      this.pos.x = constrainX - this.r;
    }else if(this.pos.x - this.r < -constrainX){ //if x_under
      this.pos.x = -constrainX + this.r;
    }

    if(this.pos.y + this.r > constrainY){//if y_over
        this.pos.y = constrainY - this.r;
    }else if(this.pos.y - this.r < -constrainY){//if y_under
        this.pos.y = -constrainY + this.r;
    }

  }

  show() {


    if(this.type =="me"){
      this.counter++;
      if(this.wobbleCount>0 && this.counter % 3 ==0){ //only wobble every nth time
        this.wobble = this.doWobbling(this.r*2);
        this.wobbleCount--;
      }else{
        this.wobble = [this.r*2,this.r*2];
      }

      fill(255);
      stroke("red");
      /*imageMode(CENTER);
      image(this.image,this.pos.x, this.pos.y, this.wobble[0],this.wobble[1]);
      imageMode(CORNER);*/
      ellipse(this.pos.x, this.pos.y, this.wobble[0],this.wobble[1]);

      noStroke();
      fill(0);
      textAlign(CENTER);
      textSize(this.r / 3);
      var r = parseFloat(this.r).toFixed(2);
      text(r, this.pos.x, this.pos.y+this.r/12);
    }else if(this.type == "food"){//if food
      fill(0,255,0);
      noStroke();
      randomSeed(this.foodRandomNumber);
      this.scribble.scribbleEllipse(this.pos.x, this.pos.y, this.r*2,this.r*2);
    }else{//if enemy
      fill(0, 0, 255);
      stroke("red");
      ellipse(this.pos.x, this.pos.y, this.r*2,this.r*2);

      noStroke();
      fill(255);
      textAlign(CENTER);
      textSize(4);
      text(this.id, this.pos.x, this.pos.y + this.r);
    }
  }

  //otherBlob has to be off a margin smaller, to be eaten
  eats(otherBlob){
    var distance = p5.Vector.dist(this.pos, otherBlob.pos);
    if(distance < this.r + otherBlob.r){//if they collided
      if(this.r * this.marginToBeEaten > otherBlob.r){//if me is big enough
        if(otherBlob.r >= initialSize){//if was enemy
          eaten_enemy.play();
        }else{
          pop_sound.play(0,1,3); //play sound
          this.wobbleCount = 20;
        }
        //A = pi * r^2
        //r = sqrt(A/pi)
        var myArea = PI * this.r * this.r;
        var otherArea = PI * otherBlob.r * otherBlob.r;
        this.r = sqrt((myArea+otherArea) / PI);
        return true;
      }else{//block each other off
        var moveBack = p5.Vector.sub( this.pos,otherBlob.pos);
        moveBack.div(3);
        moveBack.limit(3);
        this.vel.lerp(moveBack, 0.2); //grow slowly  to the vector "moveBack"
        this.pos.add(this.vel);
      }
    }
    return false;
  }

  doWobbling(d){
    randomSeed(new Date().getTime());
    var wobbleBy = random(2,30); //values do grow in size, after modBy iterations, it repeats
    var rndSplit = random(0,1); //decides wheter to grow in width or height
    var wobbleSize = wobbleBy * (this.wobbleStrength*this.r);
    if(rndSplit <= 0.5){
      var wid = d + wobbleSize;;
      var hei = d - wobbleSize;
    }else{
      var wid = d - wobbleSize;
      var hei = d + wobbleSize;
    }
    return([wid,hei]);
  }
}
