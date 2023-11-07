let handpose;
let video;
let hands = [];
let staticCircles = []; // Contain all the sprites

let block;
let blocks = [];
let blockW = 300, blockH = 20;
let ball;
let balls = [];
let ballD = 30;

let osc;
let midi = [60, 62, 64, 65, 67] // C4, D4, E4, F4, G4

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  handpose = ml5.handpose(video, modelReady);
  handpose.on("hand", results => {
    hands = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
  // Create an array to store the landmarks of one hand
  for (i = 0; i < 21; i++) {
    staticCircles.push(new Sprite(0,0,50,"static"));
  }


  // randomSeed(100);
  rectMode(CENTER);

  // Create 5 blocks
  push();
  translate(width/2, height/2);
  for (i = 0; i < 5; i++) {
    blocks.push(new Sprite(random(100, width - 100), random(100, height - 100), blockW, blockH));
  }
  pop();
  
  // Create 10 balls
  for (i = 0; i < 10; i++) {
    ball = new Sprite(random(30, width-30), random(-100,-50), ballD);
    ball.bounciness = 1;
    balls.push(ball);
  }

  // A triangle oscillator
  osc = new p5.TriOsc();
  // Start silent
  osc.start();
  osc.amp(0);
}

function modelReady() {
  console.log("Model ready!");
}

function blockUpdate() {
  for (i=0; i<blocks.length; i++) {
    block = blocks[i];
    if (block.x < 100 || block.x > width - 100 || block.y < 100 || block.y > height - 100) {
      blocks = blocks.toSpliced(i,1);
      blocks.push(new Sprite(random(100, width - 100), random(100, height - 100), blockW, blockH));
    }
  }  
}

// A function to play a note
function playNote(note, duration) {
  osc.freq(midiToFreq(note));
  // Fade it in
  osc.fade(0.5,0.2);

  // Fade it out  
  setTimeout(function() {
    osc.fade(0,0.2);
  }, duration-50);
}

function draw() {
  // image(video, 0, 0, width, height);
  background(0);
  drawHand();
  // We can call both functions to draw all keypoints and the skeletons
  
  // Update the balls positions
  for (i = 0; i < balls.length; i++) {
    if (balls[i].y > width) {    
      balls[i] = new Sprite(random(30, width-30), -100, ballD);
    }
  }

  // Update the blocks
  blockUpdate();
  print(blocks.length);

  for (i = 0; i < balls.length; i++) {
    for (j = 0; j < blocks.length; j++) {
      if (balls[i].collided(blocks[j])) {    
        // Play midi note
        playNote(midi[j]);
      }
    }    
  }  
}

// A function to draw ellipses over the detected keypoints
function drawHand() {
  if (hands.length != 0) { // If there is at least one hand
    const hand = hands[0]; // use the first hand in the array
    for (let j = 1; j < hand.landmarks.length; j += 4) {
      const keypoint1 = hand.landmarks[j];
      const keypoint2 = hand.landmarks[j+1];
      const keypoint3 = hand.landmarks[j+2];
      const keypoint4 = hand.landmarks[j+3];
      fill(255);
      stroke(255);
      strokeWeight(10);
      // ellipse(keypoint[0], keypoint[1], 30, 30);
      let keypoint1X = map(keypoint1[0], 0, video.width, width, 0);
      let keypoint1Y = map(keypoint1[1], 0, video.height, 0, height);
      let keypoint2X = map(keypoint2[0], 0, video.width, width, 0);
      let keypoint2Y = map(keypoint2[1], 0, video.height, 0, height);
      let keypoint3X = map(keypoint3[0], 0, video.width, width, 0);
      let keypoint3Y = map(keypoint3[1], 0, video.height, 0, height);
      let keypoint4X = map(keypoint4[0], 0, video.width, width, 0);
      let keypoint4Y = map(keypoint4[1], 0, video.height, 0, height);
      line(keypoint1X, keypoint1Y, keypoint2X, keypoint2Y);
      line(keypoint2X, keypoint2Y, keypoint3X, keypoint3Y);
      line(keypoint3X, keypoint3Y, keypoint4X, keypoint4Y);
      noStroke();
      // ellipse(keypoint1X, keypoint1Y, 30);
      // ellipse(keypoint2X, keypoint2Y, 30);
      // ellipse(keypoint3X, keypoint3Y, 30);
      staticCircles[j+3].x = keypoint4X;
      staticCircles[j+3].y = keypoint4Y;
    }
  }
  else { // If there is no hand, put all the static circles outside of the canvas
    for (let j = 0; j < staticCircles.length; j += 1) {
      // ellipse(keypoint[0], keypoint[1], 30, 30);
      staticCircles[j].x = width + 30;
      staticCircles[j].y = height + 30;
    }
  }  
}

function keyPressed() {
  if (key == 's') {    
    for (i = 0; i < blocks.length; i++) {
      block = blocks[i];
      block.collider = 's';
    }    
    world.gravity.y = 9.8;
  }
  if (key == 'p') {    
    world.gravity.y = 0;
    for (i = 0; i < blocks.length; i++) {
      block = blocks[i];
      block.collider = 'd';
    }  
  }
}