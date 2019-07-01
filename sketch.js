var pattern;
var pattlen;
var patterns = [];
var pattnames = [];
var instruments = [];
var insNames = [];
var pcopybuffer = [];
var globalButtons = [];

const HT_0 = "Copy the selected pattern to the copy buffer";
const HT_1 = "Clear the selected pattern";
const HT_2 = "Paste the copy buffer to the selected pattern";
const HT_3 = "Play the sequence";
const HT_4 = "Stop playing";
const HT_5 = "Save the patterns, excluding workspaces, for inclusion in O2 source";
const HT_6 = "Select this pattern|(+SHIFT) OR this pattern into selected|(+ALT) XOR this pattern into selected";
const HT_65 = "Select this pattern|(+SHIFT) OR this pattern into selected|(+ALT) XOR this pattern into selected|Note: Workspace slots are not saved or loaded!";
const HT_7 = "Toggle instrument for the step position";
const HT_8 = "Tempo adjust by click and drag up/down";

function preload() {
  soundFormats('wav');
  insNames.push("QUIHA");
  instruments[0] = loadSound('assets/01');
  insNames.push("SNARE");
  instruments[1] = loadSound('assets/02');
  insNames.push("MARACA");
  instruments[2] = loadSound('assets/03');
  insNames.push("COWBELL");
  instruments[3] = loadSound('assets/04');
  insNames.push("CLOSEDHH");
  instruments[4] = loadSound('assets/05');
  insNames.push("KICK");
  instruments[5] = loadSound('assets/06');
  insNames.push("OPENHH");
  instruments[6] = loadSound('assets/07');
  insNames.push("GUIRO");
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
  } else if (keyIsDown(ALT)) {
    // XOR the new pattern into the current
    for(let step = 0; step < 16; ++step) {
      patterns[pattern][step] ^= patterns[patt][step];
    }
  } else {
    pattern = patt;
    pattlen = parseInt(pattnames[pattern].slice(-2));

    console.log(pattlen);
    if (isNaN(pattlen))
      pattlen = 16;
    console.log(pattlen);
    }
}

function getPatternName(patt) {
  return pattnames[patt];
}

function getSelectedPattern() {
  return pattern;
}

function startPlaying() {
  this.playing = true;
  this.step = 15;
  this.nextStepTime = millis() - 1;
}

function setup() {
  let c = createCanvas(800, 600);

  c.drop(filedropped)

  noSmooth();

  globalButtons = [
    new TextButton("COPY", 75 + (0 * 96), 338, HT_0, () => { pcopybuffer = [...patterns[pattern]]; }),
    new TextButton("CLEAR", 75 + (1 * 96), 338, HT_1, () => { patterns[pattern] = new Array(16).fill(0); }),
    new TextButton("PASTE", 75 + (2 * 96), 338, HT_2, () => { patterns[pattern] = [...pcopybuffer]; }),
    new TextButton("PLAY", 75 + (0 * 96), 338 + 24, HT_3, () => { startPlaying(); }),
    new TextButton("STOP", 75 + (1 * 96), 338 + 24, HT_4, () => { this.playing = false; }),
    new TextButton("SAVE", 75 + (2 * 96), 338 + 24, HT_5, () => { savePatternData(); })
  ]

  var ypos = 50;
  for (let i = 0; i < 16; i++) {
    let id = ("0" + i).slice(-2)
    pattnames.push("pattern " + id + " 16");
    globalButtons.push(new PatternButton(i, 640, ypos, HT_6));
    ypos += 24;

    patterns.push(new Array(16).fill(0));
  }

  ypos = 338;
  for (let i = 0; i < 4; i++) {
    let id = ("0" + i).slice(-2)
    pattnames.push("w/space " + id + " 16");
    globalButtons.push(new PatternButton(i + 16, 500, ypos, HT_65));
    ypos += 24;
    patterns.push(new Array(16).fill(0));
  }

  for (let i = 0; i < 16 * 8; i++) {
    globalButtons.push(new StepButton((int)(i / 16), i & 15, HT_7, querySequence, setSequence));
  }

  globalButtons.push(new AbletonButton(400, 354, 30, 60, 180, HT_8, (val)=>{tempo = val}));

  this.step = 0;
  this.tempo = 120;

  this.playing = false;
  this.nextStepTime = 0;

  setCurrentPattern(0);
};

function draw() {
  let millisNow = millis();

  if (this.playing && millisNow >= this.nextStepTime) {
    this.nextStepTime += int(floor(15000 / this.tempo));

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
    rect(this.step * 32 + 71, 44, 24, 8 * 32)
  }

  tellButtons((x) => { x.draw(); })

  textAlign(RIGHT, CENTER);
  for (let i = 0; i < insNames.length; i++) {
    text(insNames[i], 0, 32 * i + 50, 75, 16);
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
