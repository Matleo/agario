class Blob {
  constructor(me, id, x, y, r){
    this.me = me; //is it the user's Blob or some other from server
    this.id = id;
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);
  }

  update() {
    var newvel = createVector(mouseX - width / 2, mouseY - height / 2);
    newvel.div(50);
    //newvel.setMag(3);
    newvel.limit(3);
    this.vel.lerp(newvel, 0.2); //grow slowly (0.2) to the newvel
    this.pos.add(this.vel);
  }

  eats(other) {
    var d = p5.Vector.dist(this.pos, other.pos);
    if (d < this.r + other.r) { //if distance is smaller then sum of both radiuses
      var area = PI * this.r * this.r + PI * other.r * other.r; //grow by area of other blob
      this.r = sqrt(area / PI); //eat other
      return true;
    } else {
      return false;
    }
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
    }else{
        fill(0, 0, 255);
    }
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);

    if(this.id != null){
      fill(255);
      textAlign(CENTER);
      textSize(4);
      text(this.id, this.pos.x, this.pos.y + this.r);
    }
  }
}
