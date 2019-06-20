var pattern;
var pattlen;
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
      let nameo = ts.indexOf('//');
      if (nameo != -1) {
        pattnames[patt] = ts.substring(nameo+2).trim();
      }
      if (ts.startsWith('B')) {
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
    pattlen = parseInt(pattnames[pattern].slice(-2));
  }
}

function getPatternName(patt) {
  return pattnames[patt];
}

function setup() {
  let c = createCanvas(800, 600);

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
    }),
    new TextButton("SAVE", 16 * 16 + 24, 408, () => {
      savePatternData();
    })
  ]

  for (let i = 0; i < 16; i++) {
    let id = ("0" + i).slice(-2)
    pattnames.push("pattern " + id + " 16");
    globalButtons.push(new VariableTextButton(()=>getPatternName(i), 550, i * 24 + 50, 160, ()=>setCurrentPattern(i)));
    for (let j = 0; j < 16; j++) {
      patterns.push(new Array(16).fill(0));
    }
  }

  for (let i = 0; i < 16 * 8; i++) {
    globalButtons.push(new StepButton((int)(i / 16), i & 15, querySequence, setSequence));
  }


  this.step = 0;
  this.tempo = 120;

  this.playing = false;
  this.nextStepTime = 0;

  setCurrentPattern(0);
};

function draw() {
  if (this.playing && millis() >= this.nextStepTime) {
    this.nextStepTime = millis() + 15000 / this.tempo;

    step = (step + 1) % pattlen;
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

  tellButtons((x) => { x.draw(); })

  stroke(1);
  strokeWeight(1);
  for (let i = 0; i < 16; ++i) {
    fill(0,40 + (i == pattern ? 200 : 0),0);
    ellipse(720, i * 24 + 60, 10, 10);
  }
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

function savePatternData () {
  let strings = []
  strings.push("const unsigned char pattern[256] PROGMEM = {");
  for (let patt = 0; patt < 16; ++patt) {
    strings.push("");
    for (let step = 0; step < 16; ++step) {
      var name = '';
      if (step == 0) { 
        name  = '\t\t// ' + pattnames[patt];
      }

      strings.push( 'B' + ('00000000' + (patterns[patt][step] >>> 0).toString(2)).slice(-8) + ',' + name );
    }
  }
  strings.push("};");
  saveStrings(strings, "patterns.txt");
}
