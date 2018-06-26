class Bot {
  constructor(id, x, y, type, constrainX, constrainY, owner, directionX, directionY){
    this.id = id;
    this.type = type;
    this.pos = createVector(x, y);
    this.direction = createVector(directionX, directionY); //is always between [-1,-0.25] or [0.25,1]
    if(this.type=="schnatz"){
      this.r = 5;
      this.speed = 3.5;
    }else if(this.type=="default"){
      this.r = 4; //will be displayed with double size
      this.sizeIncrease=2;
      this.speed = 1;
    }
    this.constrainX = constrainX;
    this.constrainY = constrainY
    this.owner = owner; //am i the owner?
  }

  move() {
    var newvel = this.direction.copy();
    newvel.normalize();
    newvel.mult(this.speed);
    this.pos.add(newvel);
  }


  //when bot hits boundaries, change direction
  constrain() {
    if(this.pos.x + this.r > this.constrainX){ //if x_over, if right border
      this.pos.x = this.constrainX - this.r;
      // this.direction = createVector(-newX,this.direction.y);//change direction to not get stuck on wall
      if(this.direction.y > 0){//if going down
        this.direction.rotate(HALF_PI);
      }else{
        this.direction.rotate(-HALF_PI);
      }
    }else if(this.pos.x - this.r < -this.constrainX){ //if x_under, if left border
      this.pos.x = -this.constrainX + this.r;
      // this.direction = createVector(newX,this.direction.y);//change direction to not get stuck on wall
      if(this.direction.y > 0 ){//if going down
        this.direction.rotate(-HALF_PI);
      }else{
        this.direction.rotate(HALF_PI);
      }
    }

    if(this.pos.y + this.r > this.constrainY){//if y_over, if bottom border
      this.pos.y = this.constrainY - this.r;
      // this.direction = createVector(this.direction.x,-newY);//change direction to not get stuck on wall
      if(this.direction.x < 0){//if going left
        this.direction.rotate(HALF_PI);
      }else{
        this.direction.rotate(-HALF_PI);
      }
    }else if(this.pos.y - this.r < -this.constrainY){//if y_under, if top border
      this.pos.y = -this.constrainY + this.r;
      // this.direction = createVector(this.direction.y,newY);//change direction to not get stuck on wall
      if(this.direction.x < 0){//if going left
        this.direction.rotate(-HALF_PI);
      }else{
        this.direction.rotate(HALF_PI);
      }
    }
  }

  update() {
    this.constrain();
    this.move();
    stroke("black");
    if(this.type=="schnatz"){
      fill("yellow");
      ellipse(this.pos.x, this.pos.y, this.r*2);
    }else if(this.type=="default"){
      fill("#a7a7a7");
      ellipse(this.pos.x, this.pos.y, this.r*2*this.sizeIncrease);
    }
  }

}
