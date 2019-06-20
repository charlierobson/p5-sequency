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
  instruments[0] = loadSound('assets/01');
  instruments[1] = loadSound('assets/02');
  instruments[2] = loadSound('assets/03');
  instruments[3] = loadSound('assets/04');
  instruments[4] = loadSound('assets/05');
  instruments[5] = loadSound('assets/06');
  instruments[6] = loadSound('assets/07');
  instruments[7] = loadSound('assets/08');
};

function filedropped(dropped) {
  if (dropped.type === 'text') {
    var patt = 0;
    var step = 0;
    let strings = dropped.data.split('\n');
    for (let strg of strings) {
      let ts = strg.trim();
      if (ts.startsWith('//')) {
        pattnames[patt] = ts.substring(2).trim();
      } else if (ts.startsWith('B')) {
        patterns[patt][step] = parseInt(ts.substring(1,9), 2);
        ++step;
        if (step == 16) {
          ++patt;
          step = 0;
        }
      }
    }
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
}

function setCurrentPattern(patt) {
  if (keyIsDown(SHIFT)) {
    // OR the new pattern into the current
    for(let step = 0; step < 16; ++step) {
      patterns[pattern][step] |= patterns[patt][step];
    }
  } else {
    pattern = patt;
  }
}

function getPatternName(patt) {
  return pattnames[patt];
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
    pattnames.push("pattern " + i);
    globalButtons.push(new VariableTextButton(()=>getPatternName(i), 550, i * 24 + 50, 160, ()=>setCurrentPattern(i)));
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
