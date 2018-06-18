class Bot {
  constructor(id, x, y, type, constrainX, constrainY, owner, directionX, directionY){
    this.id = id;
    this.type = type;
    this.pos = createVector(x, y);
    this.direction = createVector(directionX, directionY); //is always between [-1,-0.25] or [0.25,1]
    this.r = 5;
    this.constrainX = constrainX;
    this.constrainY = constrainY;
    this.owner = owner; //am i the owner?
  }

  move() {
    var newvel = Object.assign(this.direction);
    newvel.mult(2.5);
    newvel.limit(3.5);
    this.pos.add(newvel);
  }


  //dont allow blobs to run out of boundaries
  constrain() {
    var newX = Math.random()*2-1;
    var newY = Math.random()*2-1;
    if(newX<0.25&&newX>=0){newX+=0.25;}
    if(newX>-0.25&&newX<0){newX-=0.25;}
    if(newY<0.25&&newY>=0){newY+=0.25;}
    if(newY>-0.25&&newY<0){newY-=0.25;}
    if(this.pos.x + this.r > this.constrainX){ //if x_over
      this.pos.x = this.constrainX - this.r;
      this.direction = createVector(newX,newY);//change direction to not get stuck on wall
    }else if(this.pos.x - this.r < -this.constrainX){ //if x_under
      this.pos.x = -this.constrainX + this.r;
      this.direction = createVector(newX,newY);//change direction to not get stuck on wall
    }

    if(this.pos.y + this.r > this.constrainY){//if y_over
      this.pos.y = this.constrainY - this.r;
      this.direction = createVector(newX,newY);//change direction to not get stuck on wall
    }else if(this.pos.y - this.r < -this.constrainY){//if y_under
      this.pos.y = -this.constrainY + this.r;
      this.direction = createVector(newX,newY);//change direction to not get stuck on wall
    }

  }

  update() {
    this.constrain();
    this.move();
    stroke("black");
    fill("yellow");
    ellipse(this.pos.x, this.pos.y, this.r*2);
  }

}
