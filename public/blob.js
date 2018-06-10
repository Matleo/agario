class Blob {
  constructor(me, id, x, y, r){
    this.me = me; //is it the user's Blob or some other from server.  false true
    this.id = id;
    this.pos = createVector(x, y);
    this.r = r;

    this.vel = createVector(0, 0);
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
    if(this.me){
        fill(255);
    }else if(this.id == null){
        fill(0,255,0);
    }else{
        fill(0, 0, 255);
    }
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);

    if(this.id != null && this.me == false){
      fill(255);
      textAlign(CENTER);
      textSize(4);
      text(this.id, this.pos.x, this.pos.y + this.r);
    }else if(this.me){
      fill(0);
      textAlign(CENTER);
      textSize(this.r / 3);
      var r = parseFloat(this.r).toFixed(2);
      text(r, this.pos.x, this.pos.y+this.r/12);
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
        }
        //A = pi * r^2
        //r = sqrt(A/pi)
        var myArea = PI * this.r * this.r;
        var otherArea = PI * otherBlob.r * otherBlob.r;
        this.r = sqrt((myArea+otherArea) / PI);
        return true;
      }else{//block each other off
        var moveBack = p5.Vector.sub( this.pos,otherBlob.pos);
        moveBack.div(4);
        moveBack.limit(3);
        this.vel.lerp(moveBack, 0.08); //grow slowly  to the vector "moveBack"
        this.pos.add(this.vel);
      }
    }
    return false;
  }
}
