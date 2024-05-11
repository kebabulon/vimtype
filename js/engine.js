const EditMode = createEnum(["Normal", "Insert", "Visual"])

class Engine {
    constructor() {
        this.maxHeight = 10;
        this.maxWidth = 50;

        this.buffer = Array(this.maxHeight).fill(Array());
        this.bufferEl = document.getElementById("buffer");

        this.cursorEl = document.getElementById("cursor");
        this.cursorX = 0;
        this.cursorY = 0;

        this.lastCursorY = 0;
        this.lastCursorX = 0;
        this.savedCursorX = 0;

        this.mode = EditMode.Normal;

        this.currentKeys = "";
        this.currentTree;
        this.currentMotion = "";
        this.currentCommand = "";
        this.currentCount = "";
    }

    init() {
        this.vim = new Vim();
        document.fonts.ready.then((fontFaceSet) => {
            this.resetBlinkAnimation();
            this.calcCursorWidth();
            this.buffer[0] = this.buffer[0].concat("a = '234'".split(''));
            this.buffer[1] = this.buffer[1].concat("welcome test test amazing".split(''));
            this.render();
            this.handleInput();
        });
    }

    handleInput() {
        document.addEventListener('keydown', (event) => {
            if(event.key == "Escape") {
                this.mode = EditMode.Normal;
            }
            if(this.mode == EditMode.Insert) {
                let buf = this.buffer[this.cursorY];
                if(event.key == "Backspace") {
                    // TODO: limit cursorXY 
                    buf.splice(this.cursorX-1, 1);
                    this.cursorX -= 1;
                }
                else {
                    buf.splice(this.cursorX, 0, event.key);
                    this.cursorX += 1;
                }
            }
            else if(this.mode == EditMode.Normal) {
                this.currentKeys += event.key;
                if(this.currentTree == undefined) {
                    this.currentTree = this.vim.actionTree;
                }
                let tree = this.currentTree[event.key];
                if (!(isObjectEmpty(tree) || tree == undefined)) {
                    this.currentTree = tree;
                }
                else {
                    let action = this.vim.actions[this.currentKeys];
                    if(action != undefined) {
                        action = new action();
                        if(action.type == ActionType.Command) {
                            if(action.instant == true) {
                                action.action();
                                this.resetCurrentKeys();
                            }
                        }
                        if(action.type == ActionType.Motion) {
                            action.action();
                            this.resetCurrentKeys();
                        }
                    }
                    else {
                        this.resetCurrentKeys();
                    }
                }

            }
            this.fixCursorPosition();
            this.render();
            this.resetBlinkAnimation();
        });
    }

    fixCursorPosition() {
        // Y
        if(this.cursorY < 0) {
            this.cursorY = 0;
        }

        let bufs = this.buffer.length-1;
        if(this.cursorY > bufs) {
            this.cursorY = bufs;
        }

        // X
        if(this.cursorX < 0) {
            this.cursorX = 0;
        }

        if(this.lastCursorY != this.cursorY) {
            this.cursorX = this.savedCursorX;
        }
        let bufLen = this.buffer[this.cursorY].length-1;
        if (bufLen == -1) {
            bufLen = 0;
        }
        if(this.cursorX > bufLen) {
            this.savedCursorX = this.cursorX;
            this.cursorX = bufLen;
        }
        if(this.lastCursorY == this.cursorY && this.lastCursorX != this.cursorX) {
            this.savedCursorX = this.cursorX;
        }

        this.lastCursorX = this.cursorX;
        this.lastCursorY = this.cursorY;
    }

    resetCurrentKeys() {
        this.currentTree = this.vim.actionTree;
        this.currentKeys = "";
        this.currentMotion = "";
        this.currentCommand = "";
        this.currentCount = "";
    }

    resetBlinkAnimation() {
        document.getAnimations().forEach((anim) => {
            anim.cancel();
            anim.play();
        });
    }

    calcCursorWidth() {
        let char = document.createElement("span");
        char.innerHTML = "a";
        char.style.position = "absolute";
        char.style.top = -1000;
        char.style.overflow = "hidden";
        char.style.fontSize = "1.5em";
        document.body.appendChild(char);

        this.cursorWidth = char.getBoundingClientRect().width;
        this.cursorHeight = char.getBoundingClientRect().height;

        this.cursorEl.style.width = this.cursorWidth.toString() + "px";
        this.cursorEl.style.height = this.cursorHeight.toString() + "px";

        char.remove();
    }

    render() {
        let text = "";
        for(let y = 0; y < this.maxHeight; y++) {
            for(let x = 0; x < this.buffer[y].length; x++) {
                let char = this.buffer[y][x];
                if(x == this.cursorX && y == this.cursorY) {
                    char = '<span class="inverted">' + char + '</span>';
                }
                text += char;
            }
            text += "\n";
        }
        this.bufferEl.innerHTML = text;

        this.cursorEl.style.top = (this.cursorHeight * (1 + this.cursorY)).toString() + "px";
        this.cursorEl.style.left = (this.cursorWidth * this.cursorX).toString() + "px";
    }
}