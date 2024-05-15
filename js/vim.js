const ActionType = createEnum(["Command", "Motion"]);
const StopChars = createEnum([
    // ' ',
    '.',
    ',',
    '-',
    ';',
    ':',
    '"',
    "'",

    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',

    '-',
    '+',
    '=',
    '/',
    '?',
]);

class Vim {
    constructor() {
        this.initActions();
        this.generateActionTree();
    }

    initActions() {
        let engine = app.engine;
        this.actions = {
            "h": class {
                constructor() {
                    this.type = ActionType.Motion; 
                }
                action() {
                    engine.cursorX -= 1;
                }
                select() {
                    // return 1 char
                }
            },

            "j": class {
                constructor() {
                    this.type = ActionType.Motion; 
                }
                action() {
                    engine.cursorY += 1;
                }
                select() {
                    // return 1 char
                }
            },

            "k": class {
                constructor() {
                    this.type = ActionType.Motion; 
                }
                action() {
                    engine.cursorY -= 1;
                }
                select() {
                    // return 1 char
                }
            },

            "l": class {
                constructor() {
                    this.type = ActionType.Motion; 
                }
                action() {
                    engine.cursorX += 1;
                }
                select() {
                    // return 1 char
                }
            },

            "i": class {
                constructor() {
                    this.type = ActionType.Command;
                    this.instant = true;
                }
                action() {
                    app.engine.mode = EditMode.Insert;
                }
            },

            "w": class {
                constructor() {
                    this.type = ActionType.Motion; 
                }
                action() {
                    let buf = engine.buffer[engine.cursorY];
                    let done = false;
                    let onStop = false;
                    let waitForStop = false;
                    if(StopChars[buf[engine.cursorX]] != undefined) {
                        onStop = true;
                    }
                    for(let i=engine.cursorX+1; i < buf.length; i++) {
                        let char = buf[i];
                        if(!waitForStop) {
                            if(char == ' ') {
                                waitForStop = true;
                            }
                            if(onStop && StopChars[char] == undefined) {
                                waitForStop = true;
                            }
                            if(!onStop && StopChars[char] != undefined) {
                                waitForStop = true;
                            }
                        }
                        if(waitForStop && char != ' ') {
                            engine.cursorX = i;
                            done = true;
                            break
                        }
                    }
                    if(!done) {
                        engine.cursorX = 0;
                        engine.savedCursorX = engine.cursorX;
                        engine.cursorY += 1;
                    }
                }
                select() {
                    // return 1 char
                }
            },
        }
    }

    generateActionTree() {
        this.actionTree = {};
        for (const [action, value] of Object.entries(this.actions)) {
            let currentDict;
            for(let i = 0; i < action.length; i++) {
                let char = action[i];
                if(currentDict == undefined) {
                    currentDict = this.actionTree;
                }
                if(currentDict[char] == undefined) {
                    currentDict[char] = {};
                    currentDict = currentDict[char];
                }
            }
        }
    }
}