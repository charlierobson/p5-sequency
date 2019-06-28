const Buttonx = function (x, y, w, h, toolTip) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.state = 0
    this.toolTip = toolTip;
}

Buttonx.prototype.mouseWithin = function () {
    return mouseX >= this.x &&
        mouseX < this.x + this.w &&
        mouseY >= this.y &&
        mouseY < this.y + this.h
}

Buttonx.prototype.showHilite = function () {
    strokeWeight(2);
    noFill();
    stroke(color(0, 255, 0));
    rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
    textAlign(LEFT, TOP);
    fill(0);
    noStroke();
    let texts = this.toolTip.split('|');
    for (let i = 0; i < texts.length; ++i) {
        text(texts[i], 24, 500 + 16 * i);
    }
}

Buttonx.prototype.draw = function () {
}

Buttonx.prototype.mouseMoved = function () {
    switch (this.state) {
        case 0: { // not active
            if (this.mouseWithin()) {
                // become active
                this.state = 1
            }
        }
        break;

        case 1: { // active
            if (!this.mouseWithin()) {
                // become inactive
                this.state = 0
            }
        }
        break;
    }
}

Buttonx.prototype.mouseDragged = function () {
}

Buttonx.prototype.mouseClicked = function () {
}

Buttonx.prototype.mousePressed = function () {
}

Buttonx.prototype.doubleClicked = function () {
}

// ----------------------------------------------------------------------------------------

const TextButton = function (text, x, y, toolTip, thingToDo) {
    Buttonx.call(this, x, y, 80, 16, toolTip);
    this.text = text;
    this.thingToDo = thingToDo;
}

TextButton.prototype = Object.create(Buttonx.prototype);

TextButton.prototype.draw = function () {
    fill(200);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y, this.w, this.h);
    if (this.state == 1) {
        this.showHilite();
    }
}

TextButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.thingToDo();
    }
}

// ----------------------------------------------------------------------------------------

const VariableTextButton = function (textfn, x, y, w, toolTip, thingToDo) {
    Buttonx.call(this, x, y, w, 16, toolTip);
    this.thingToDo = thingToDo;
    this.textfn = textfn;
}

VariableTextButton.prototype = Object.create(Buttonx.prototype);

VariableTextButton.prototype.draw = function () {
    fill(200);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    textAlign(CENTER, CENTER);
    text(this.textfn(), this.x, this.y, this.w, this.h);
    if (this.state == 1) {
        this.showHilite();
    }
}

VariableTextButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.thingToDo();
    }
}

// ----------------------------------------------------------------------------------------

const StepButton = function (inst, step, toolTip, querySeq, updateSeq) {
    Buttonx.call(this, step * 32 + 75, inst * 32 + 50, 16, 16, toolTip);
    this.step = step;
    this.inst = inst;
    this.querySeq = querySeq;
    this.updateSeq = updateSeq;
}

StepButton.prototype = Object.create(Buttonx.prototype);

StepButton.prototype.draw = function () {
    if (this.querySeq(this.inst, this.step) == 1) {
        fill(240,20,20);
    }
    else {
        fill(255);
    }
    stroke(0);
    strokeWeight(1);
    rect(this.x, this.y, 16, 16);
    if (this.state == 1) {
        this.showHilite();
    }
}

StepButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.updateSeq(this.inst, this.step, 1 - this.querySeq(this.inst, this.step));
    }
}

// ----------------------------------------------------------------------------------------


const AbletonButton = function (x, y, r, minv, maxv, toolTip, onChangeFN) {
    Buttonx.call(this, x, y, r, r, toolTip);
    this.r = r;
    this.minv = minv;
    this.maxv = maxv;
    this.rt = PI;
    this.lastY = y;
    this.onChangeFN = onChangeFN;
    this.val = int(map(this.rt, (2*PI)/12, 11*(2*PI)/12, this.minv, this.maxv));
}

AbletonButton.prototype = Object.create(Buttonx.prototype);

AbletonButton.prototype.draw = function () {
    push();
    translate(this.x,this.y);

    fill(255);

    stroke(0);
    if (this.state == 1) {
        stroke(color(0, 128, 0));
    }
    ellipse(0, 0, this.r, this.r);

    rotate(this.rt);
    stroke(0);
    line(0,0,0,this.r/2);
    pop();

    fill(0);
    textAlign(CENTER, CENTER);
    text(this.val, this.x - 100, this.y + 16, 200, 32);  
}

AbletonButton.prototype.mouseWithin = function () {
    return dist(mouseX, mouseY, this.x, this.y) < this.r;
}

AbletonButton.prototype.mouseDragged = function () {
    if (this.state != 1) return;

    dy = mouseY - this.lastY;
    this.lastY = mouseY;
    this.rt -= 0.1 * dy;

    if (this.rt < (2*PI)/12) this.rt = (2*PI)/12;
    if (this.rt > (11*(2*PI)/12)) this.rt = 11*(2*PI)/12;

    this.val = int(map(this.rt, (2*PI)/12, 11*(2*PI)/12, this.minv, this.maxv));
    this.onChangeFN(this.val);
}
