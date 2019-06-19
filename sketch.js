var sequence = [];
var globalButtons = [];
let instruments = [];

function rect_t(x, y, w, h) {
  this.x = x
  this.y = y,
  this.w = w,
  this.h = h
};

function preload() {
  soundFormats('wav');
  instruments[0] = loadSound('assets/KICK');
  instruments[1] = loadSound('assets/SD1');
  instruments[2] = loadSound('assets/SYM1');
  instruments[3] = loadSound('assets/RIM');
  instruments[4] = loadSound('assets/TAMB');
  instruments[5] = loadSound('assets/QUIHA');
  instruments[6] = loadSound('assets/MARC');
  instruments[7] = loadSound('assets/COW');
};

function filedropped(dropped) {
  if (dropped.type === 'text') {
    let strings = dropped.data;

  }
};



function querySequence(inst, step) {
  return sequence[inst * 16 + step];
}

function setSequence(inst, step, value) {
  sequence[inst * 16 + step] = value;
}


function setup() {
  let c = createCanvas(740, 600);

  c.drop(filedropped)

  noSmooth();
  
  sequence = [];
  globalButtons = [
    new TextButton("CLEAR", 24, 408, () => {  
      sequence = [];
      for (let i = 0; i < 16 * 8; i++) {
        sequence.push(0);
      }
    }),
    new TextButton("PLAY", 6 * 16 + 24, 408, () => {  
      this.playing = true;
      this.step = 15;
      this.nextStepTime = millis() - 1;
    }),
    new TextButton("STOP", 11 * 16 + 24, 408, () => {
      this.playing = false;
    })
  ]

  for (let i = 0; i < 16 * 8; i++) {
    globalButtons.push(new StepButton((int)(i / 16), i & 15, querySequence, setSequence));
    sequence.push(0);
  }

  this.tempo = 120;
  this.nextStepTime = 0;
  this.playing = false;
};

function draw() {
  if (this.playing && millis() >= this.nextStepTime) {
    this.nextStepTime = millis() + 15000 / this.tempo;

    step = (step + 1) & 15;
    for (let inst = 0; inst < 8; ++inst) {
      if (sequence[step + 16 * inst] == 1) {
        instruments[inst].play();
      }
    }
  }

  background(128);

  if (this.playing) {
    fill(color(240,240,20));
    noStroke();
    rect(this.step * 32 + 20, 46, 24, 8 * 32 + 8)
  }

  fill(0);
  noStroke();

  tellButtons((x) => { x.draw(); })
};

function tellButtons(thingToDo) {
  for (let x of globalButtons) {
    thingToDo(x);
  }
}

function mouseClicked() {
  tellButtons((x) => { x.mouseClicked(); })
};

function doubleClicked() {
  tellButtons((x) => { x.doubleClicked(); })
};

function mouseMoved() {
  tellButtons((x) => { x.mouseMoved(); })
}

function mouseDragged() {
  tellButtons((x) => { x.mouseDragged(); })
};

function mousePressed() {
  tellButtons((x) => { x.mousePressed(); })
};
