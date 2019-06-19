var pattern;
var patterns = [];
var pattnames = [];

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
    console.log(strings);
  }
};



function querySequence(inst, step) {
  let column = patterns[pattern][step];
  return (column & (1 << inst)) != 0 ? 1 : 0;
}

function setSequence(inst, step, value) {
  if (value) {
    patterns[pattern][step] |= (1 << inst);
  } else {
    patterns[pattern][step] &= ~(1 << inst);
  }
  console.log(patterns[pattern]);
}

function setPattern(patt) {
  pattern = patt;
}


function setup() {
  let c = createCanvas(740, 600);

  c.drop(filedropped)

  noSmooth();

  globalButtons = [
    new TextButton("CLEAR", 24, 408, () => {  
      patterns[pattern] = new Array(16).fill(0);
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

  pattern = 0;

  this.step = 0;
  for (let i = 0; i < 16; i++) {
    let name = "pattern " + i;
    globalButtons.push(new TextButton(name, 550, i * 24 + 50, () => {
      setPattern(i);
    }));
    pattnames.push(name);
    for (let j = 0; j < 16; j++) {
      patterns.push(new Array(16).fill(0));
    }
  }

  for (let i = 0; i < 16 * 8; i++) {
    globalButtons.push(new StepButton((int)(i / 16), i & 15, querySequence, setSequence));
  }

  this.playing = false;

  this.tempo = 120;
  this.nextStepTime = 0;
};

function draw() {
  if (this.playing && millis() >= this.nextStepTime) {
    this.nextStepTime = millis() + 15000 / this.tempo;

    step = (step + 1) & 15;
    let col = patterns[pattern][step];
    for (let inst = 0; inst < 8; ++inst) {
      if ((col & (1 << inst)) != 0) {
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
