var globalButtons = [];


function rect_t(x, y, w, h) {
  this.x = x
  this.y = y,
  this.w = w,
  this.h = h
};

function preload() {
};

function filedropped(dropped) {
  if (dropped.type === 'text') {
    let strings = dropped.data;

    
  }
};


var sequence = [];

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

  globalButtons = [
    new TextButton("CLEAR", 24, 408, () => {  
      sequence = [];
      for (let i = 0; i < 16 * 8; i++) {
        sequence.push(0);
      }
    }),
    new TextButton("PLAY", 6 * 16 + 24, 408, () => {  }),
    new TextButton("STOP", 11 * 16 + 24, 408, () => {  })
  ]

  for (let i = 0; i < 16 * 8; i++) {
    globalButtons.push(new StepButton((int)(i / 16), i & 15, querySequence, setSequence));
    sequence.push(0);
  }
};

function draw() {
  background(128);

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
