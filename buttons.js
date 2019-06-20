const Buttonx = function (x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.state = 0
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

const TextButton = function (text, x, y, thingToDo, enableTestFn = function(){return true}) {
    Buttonx.call(this, x, y, 80, 16);
    this.text = text;
    this.thingToDo = thingToDo;
    this.enabled = enableTestFn;
}

TextButton.prototype = Object.create(Buttonx.prototype);

TextButton.prototype.draw = function () {
    fill(200);
    noStroke();
    rect(this.x, this.y, this.w, this.h);
    fill(0);
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y, this.w, this.h);
    if (this.state == 1 && this.enabled()) {
        this.showHilite();
    }
}

TextButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.thingToDo();
    }
}

// ----------------------------------------------------------------------------------------

const VariableTextButton = function (textfn, x, y, w, thingToDo) {
    Buttonx.call(this, x, y, w, 16);
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

const StepButton = function (inst, step, querySeq, updateSeq) {
    Buttonx.call(this, step * 32 + 24, inst * 32 + 50, 16, 16);
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
}

StepButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.updateSeq(this.inst, this.step, 1 - this.querySeq(this.inst, this.step));
    }
}
