function KeyboardInputManager() {
    this.events = {};

    if (window.navigator.msPointerEnabled) {
        //Internet Explorer 10 style
        this.eventTouchstart = "MSPointerDown";
        this.eventTouchmove = "MSPointerMove";
        this.eventTouchend = "MSPointerUp";
    } else {
        this.eventTouchstart = "touchstart";
        this.eventTouchmove = "touchmove";
        this.eventTouchend = "touchend";
    }

    this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(data);
        });
    }
};

KeyboardInputManager.prototype.listen = function () {
    var self = this;

    var map = {
        38: 0, // Up
        39: 1, // Right
        40: 2, // Down
        37: 3, // Left
        75: 0, // Vim up
        76: 1, // Vim right
        74: 2, // Vim down
        72: 3, // Vim left
        87: 0, // W
        68: 1, // D
        83: 2, // S
        65: 3 // A
    };
    const Commands = {
        Up: 'up',
        Down: 'down',
        Left: 'left',
        Right: 'right',
        Reset: 'reset',
        Restart: 'restart',
        New: 'new',
        Score: 'score',
        Best: 'best',
        Scores: 'scores',
        Won: 'won',
        Over: 'over',
        Lost: 'lost',
        Win: 'win',
        Keep: 'keep',
        Undo: 'undo',
        ABC: 'ABC',
        Chemistry: 'chemistry'
    };

    function parse(e) {
        if (e.final === true) {
            var listext = (e.text).split(" ");
            var num = 1;
            var numtwo = 0
            var numlis = [];
            for (var i = 0; i < listext.length; i++) {
                if (/^\d+(\.\d+)?/.exec(listext[i])) {
                    numtwo += parseInt(listext[i]);
                    numlis.push(listext[i]);
                }
            }
            num = Math.max(num, numtwo);

            var text = listext.filter(function (x) {
                return numlis.indexOf(x) < 0;
            });
            for (var i = 0; i < num; i++) {
                for (var x = 0; x < text.length; x++) {
                    if (text[x] === Commands.Up) {
                        var mapped = map[38];
                    }

                    if (text[x] === Commands.Down) {
                        var mapped = map[40];
                    }

                    if (text[x] === Commands.Left) {
                        var mapped = map[37];
                    }

                    if (text[x] === Commands.Right) {
                        var mapped = map[39];
                    }

                    if (text[x] === Commands.Undo) {
                        self.undo.call(self);
                    }

                    if (text[x] === Commands.ABC) {
                        window.open("../abc.html");
                    }
                    if (text[x] === Commands.Chemistry) {
                        window.open("../chem.html");
                    }

                    if (mapped !== undefined) {
                        event.preventDefault();
                        self.emit("move", mapped);
                    }

                    if ((text[x] === Commands.Reset) || (text[x] === Commands.Restart) || (text[x] === Commands.New)) {
                        self.restart.call(self);
                    }

                    if (text[x] === Commands.Best) {
                        var bestscore = (document.querySelector(".best-container").innerText).split("\n")[0];
                        alanBtnInstance.setVisualState({
                            best: bestscore
                        });
                    }
                    if ((text[x] === Commands.Score) && (text[x - 1] !== Commands.Best)) {
                        var score = (document.querySelector(".score-container").innerText).split("\n")[0];
                        alanBtnInstance.setVisualState({
                            score: score
                        });
                    }
                    if (text[x] === Commands.Scores) {
                        var bestscore = (document.querySelector(".best-container").innerText).split("\n")[0];
                        var score = (document.querySelector(".score-container").innerText).split("\n")[0];
                        alanBtnInstance.setVisualState({
                            best: bestscore,
                            score: score
                        });
                    }
                    if ((text[x] === Commands.Won) || (text[x] === Commands.Over) || (text[x] === Commands.Lost) || (text[x] === Commands.Win)) {
                        var wonorlostornot = ((document.querySelector(".game-message").innerText).split("\n")[0]).length
                        alanBtnInstance.setVisualState({
                            gamestate: wonorlostornot
                        });

                    }
                }


            }
        }
    }


    var alanBtnInstance = alanBtn({
        key: "786a5d421303434775722133d426a2be2e956eca572e1d8b807a3e2338fdd0dc/stage",
        onEvent: function (e) {
            parse(e);
        },
        rootEl: document.getElementById("alan-btn"),
    });



    // Respond to direction keys
    document.addEventListener("keydown", function (event) {
        var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
            event.shiftKey;
        var mapped = map[event.which];
        if (self.targetIsInput(event)) return;

        if (!modifiers) {
            if (mapped !== undefined) {
                event.preventDefault();
                self.emit("move", mapped);
            }
        }

        // R key restarts the game
        if (!modifiers && event.which === 82) {
            self.restart.call(self, event);
        }

        // Changes www.nitinpathak.esy.es U key undo the game
        else if (!modifiers && event.which === 85) {
            self.undo.call(self, event);
        }
    });

    // Respond to button presses
    this.bindButtonPress(".retry-button", this.restart);
    this.bindButtonPress(".restart-button", this.restart);
    this.bindButtonPress(".keep-playing-button", this.keepPlaying);
    // Changes www.nitinpathak.esy.es
    this.bindButtonPress(".undo-button", this.undo);

    // Respond to swipe events
    var touchStartClientX, touchStartClientY;
    var gameContainer = document.getElementsByClassName("game-container")[0];

    gameContainer.addEventListener(this.eventTouchstart, function (event) {
        if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
            event.targetTouches > 1 ||
            self.targetIsInput(event)) {
            return; // Ignore if touching with more than 1 finger or touching input
        }

        if (window.navigator.msPointerEnabled) {
            touchStartClientX = event.pageX;
            touchStartClientY = event.pageY;
        } else {
            touchStartClientX = event.touches[0].clientX;
            touchStartClientY = event.touches[0].clientY;
        }

        event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchmove, function (event) {
        event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, function (event) {
        if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
            event.targetTouches > 0 ||
            self.targetIsInput(event)) {
            return; // Ignore if still touching with one or more fingers or input
        }

        var touchEndClientX, touchEndClientY;

        if (window.navigator.msPointerEnabled) {
            touchEndClientX = event.pageX;
            touchEndClientY = event.pageY;
        } else {
            touchEndClientX = event.changedTouches[0].clientX;
            touchEndClientY = event.changedTouches[0].clientY;
        }

        var dx = touchEndClientX - touchStartClientX;
        var absDx = Math.abs(dx);

        var dy = touchEndClientY - touchStartClientY;
        var absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 10) {
            // (right : left) : (down : up)
            self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
        }
    });
};

KeyboardInputManager.prototype.restart = function (event) {
    this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
    event.preventDefault();
    this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
    var button = document.querySelector(selector);
    button.addEventListener("click", fn.bind(this));
    button.addEventListener(this.eventTouchend, fn.bind(this));
};

KeyboardInputManager.prototype.targetIsInput = function (event) {
    return event.target.tagName.toLowerCase() === "input";
};


// Changes www.nitinpathak.esy.es
KeyboardInputManager.prototype.undo = function (event) {
    this.emit("undo");
};
