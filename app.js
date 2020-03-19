var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//Utilities
var Util = /** @class */ (function () {
    function Util() {
    }
    //Random int between min inclusive and max exclusive.
    Util.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    //Change rgb int to rgb hexadecimal string.
    Util.rgb2hex = function (num) {
        var s = "000000" + num.toString(16);
        return "#" + s.substr(s.length - 6);
    };
    Util.int2hex = function (num) {
        var s = "00" + num.toString(16);
        return s.substr(s.length - 2);
    };
    //Average vitality of Person in colony.
    Util.average = function (numbers) {
        var sum = 0;
        for (var i = 0; i < numbers.length; i++) {
            sum += numbers[i].vitality;
        }
        return sum / numbers.length;
    };
    //Maximum vitality of Person in colony.
    Util.maxVitality = function (numbers) {
        var max = 0;
        for (var i = 0; i < numbers.length; i++) {
            if (numbers[i].vitality > max) {
                max = numbers[i].vitality;
            }
        }
        return max;
    };
    Util.maxSaturation = function (imageData) {
        var temp;
        for (var i = 0; i < imageData.length; i += 4) {
            temp = Math.max(imageData[i], imageData[i + 1], imageData[i + 2]);
            for (var j = 0; j < 3; j++) {
                if (imageData[i + j] == temp) {
                    imageData[i + j] = 255;
                }
                else {
                    imageData[i + j] = 0;
                }
            }
        }
        return imageData;
    };
    return Util;
}());
//Board
var Board = /** @class */ (function () {
    function Board(game, canvas, coloniesNumber) {
        this.coloniesNumber = coloniesNumber;
        this.game = game;
        this.canvas = canvas;
        this.height = canvas.height;
        this.width = canvas.width;
        this.context = canvas.getContext("2d");
        var imageData = this.context.getImageData(0, 0, this.width, this.height)
            .data;
        this.map = [];
        for (var i = 0; i < this.width; i++) {
            this.map[i] = [];
        }
        for (var i = 0; i < imageData.length; i += 4) {
            var color = "#" +
                Util.int2hex(imageData[i]) +
                Util.int2hex(imageData[i + 1]) +
                Util.int2hex(imageData[i + 2]);
            if (color == this.game.getColour(this.game.GRASS_COLOUR)) {
                var x = (i / 4) % this.width;
                var y = Math.floor(i / 4 / this.width);
                this.map[x][y] = this.game.GRASS_TILE;
            }
            if (color == this.game.getColour(this.game.WATER_COLOUR)) {
                var x = (i / 4) % this.width;
                var y = Math.floor(i / 4 / this.width);
                this.map[x][y] = this.game.WATER_TILE;
            }
        }
        console.log("map size", this.width, this.height);
        this.createColonies();
    }
    //Check whether x and y are in board's bounds.
    Board.prototype.isInBounds = function (x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    };
    //Returns object at (x, y).
    Board.prototype.getObj = function (x, y) {
        if (this.map[x] == null)
            return null;
        return this.map[x][y];
    };
    //Sets object at (x, y).
    Board.prototype.setObj = function (x, y, obj) {
        this.map[x][y] = obj;
        this.context.fillStyle = this.game.getColour(obj.colour);
        this.context.fillRect(x, y, 1, 1);
    };
    //Kills Person at position.
    Board.prototype.killPerson = function (x, y, killer) {
        this.map[x][y].kill();
        this.setObj(x, y, killer);
    };
    //Create colonies.
    Board.prototype.createColonies = function () {
        var x, y, offset = 10, x2, y2, test;
        for (var i = 0; i < this.coloniesNumber; i++) {
            while (true) {
                x = Util.randomInt(0, this.width - 1);
                y = Util.randomInt(0, this.height - 1);
                if (this.map[x][y].colour == this.game.GRASS_COLOUR) {
                    break;
                }
            }
            console.log("x: " + x + " y: " + y);
            for (var j = 0; j < 50; j++) {
                test = 0;
                while (true) {
                    test += 1;
                    do {
                        test += 0.01;
                        x2 = x + Util.randomInt(0, offset);
                        y2 = y + Util.randomInt(0, offset);
                    } while (!this.isInBounds(x2, y2));
                    if (test >= 50) {
                        break;
                    }
                    if (this.map[x2][y2].colour == this.game.GRASS_COLOUR) {
                        this.setObj(x2, y2, new Person(this.game, this, x2, y2, 0, Util.randomInt(0, 100), i, Util.randomInt(0, 100)));
                        break;
                    }
                }
            }
        }
    };
    return Board;
}());
//Tile
var Tile = /** @class */ (function () {
    function Tile(_colour) {
        this._colour = _colour;
    }
    Object.defineProperty(Tile.prototype, "colour", {
        get: function () {
            return this._colour;
        },
        set: function (colour) {
            this._colour = colour;
        },
        enumerable: true,
        configurable: true
    });
    return Tile;
}());
//Person
var Person = /** @class */ (function (_super) {
    __extends(Person, _super);
    function Person(game, map, x, y, age, reproductionValue, colour, vitality) {
        if (age === void 0) { age = 0; }
        if (reproductionValue === void 0) { reproductionValue = 0; }
        if (colour === void 0) { colour = 0; }
        if (vitality === void 0) { vitality = Util.randomInt(20, 70); }
        var _this = _super.call(this, colour) || this;
        _this.dead = false;
        _this.diseased = false;
        _this.game = game;
        _this.age = age;
        _this.x = x;
        _this.y = y;
        _this.reproductionValue = reproductionValue;
        _this._vitality = vitality;
        _this.map = map;
        _this.game.colonyPush(_this);
        return _this;
    }
    //Check whether Person should die.
    Person.prototype.shouldDie = function () {
        return this._vitality < this.age;
    };
    //Make Person ill or well.
    Person.prototype.cripple = function (chance) {
        var howMuch;
        if (Math.random() < 0.5)
            return;
        if (chance && this.diseased) {
            this._vitality *= howMuch;
            this.diseased = false;
            return;
        }
        this._vitality /= howMuch;
        this.diseased = true;
    };
    //Person move every age.
    Person.prototype.move = function () {
        this.age++;
        this.reproductionValue++;
        //this.cripple(true);
        var x, y;
        do {
            x = Util.randomInt(-1, 1);
            y = Util.randomInt(-1, 1);
        } while (!this.map.isInBounds(this.x + x, this.y + y) &&
            (x == 0 && y == 0));
        var tempColour = this.map.getObj(this.x + x, this.y + y) == null
            ? this.game.WATER_COLOUR
            : this.map.getObj(this.x + x, this.y + y).colour;
        switch (tempColour) {
            case this.game.GRASS_COLOUR:
                this.map.setObj(this.x, this.y, this.game.GRASS_TILE);
                this.reproduce();
                this.x += x;
                this.y += y;
                this.map.setObj(this.x, this.y, this);
                break;
            case this.game.WATER_COLOUR:
                break;
            case this.colour:
                break;
            default:
                if (this._vitality >=
                    this.map.getObj(this.x + x, this.y + y)._vitality) {
                    this.map.setObj(this.x, this.y, this.game.GRASS_TILE);
                    this.reproduce();
                    this.x += x;
                    this.y += y;
                    this.map.killPerson(this.x, this.y, this);
                }
                else {
                    this.map.setObj(this.x, this.y, this.game.GRASS_TILE);
                    this.kill();
                }
                break;
        }
        if (this.shouldDie()) {
            this.map.setObj(this.x, this.y, this.game.GRASS_TILE);
            this.kill();
        }
    };
    //Reproduction.
    Person.prototype.reproduce = function () {
        if (this.reproductionValue < this.game.reproductiveThreshold) {
            return;
        }
        this.reproductionValue = 0;
        var variable = Util.randomInt(-5, 5);
        this.map.setObj(this.x, this.y, new Person(this.game, this.map, this.x, this.y, 0, Util.randomInt(0, 100), this.colour, this._vitality + variable));
    };
    Person.prototype.kill = function () {
        this.dead = true;
        this.game.colonyRemove(this);
    };
    Object.defineProperty(Person.prototype, "vitality", {
        get: function () {
            return this._vitality;
        },
        enumerable: true,
        configurable: true
    });
    return Person;
}(Tile));
var Game = /** @class */ (function () {
    function Game(htmlConnector, canvas, image, coloniesNumber, speed, reproductive_threshold, allowGWColours, grassColour, waterColour) {
        var _this = this;
        if (allowGWColours === void 0) { allowGWColours = false; }
        if (grassColour === void 0) { grassColour = ""; }
        if (waterColour === void 0) { waterColour = ""; }
        this.ageCount = 0;
        this.colours = [
            "#ffff00",
            "#ff00ff",
            "#ff0000",
            "#8800ff",
            "#ff8800",
            "#888888",
            "#8888ff",
            "#ff0088",
            "#000000",
            "#0088ff",
            "#00ff00",
            "#0000ff"
        ];
        this.coloniesColours = this.colours.length - 2;
        this.colonies = [];
        this.GRASS_COLOUR = this.colours.length - 2;
        this.WATER_COLOUR = this.colours.length - 1;
        this.image = new Image();
        this.peopleCount = 0;
        this.timer = 0;
        this.htmlConnector = htmlConnector;
        this.canvas = canvas;
        this.speed = speed;
        this.coloniesNumber = coloniesNumber;
        this.GRASS_TILE = new Tile(this.GRASS_COLOUR);
        this.WATER_TILE = new Tile(this.WATER_COLOUR);
        this.reproductiveThreshold = reproductive_threshold;
        this.image.onload = function () {
            _this.setup();
        };
        this.image.onerror = function () {
            window.alert("loading failed");
        };
        this.image.src = image;
    }
    Game.prototype.setup = function () {
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        /*
          if (this.canvas.height > this.canvas.width) {
            this.canvas.style.height = "75%";
          } else {
            this.canvas.style.width = "75%";
          }
        */
        this.canvas.getContext("2d").drawImage(this.image, 0, 0);
        for (var i = 0; i < this.coloniesNumber; i++) {
            this.colonies[i] = [];
        }
        this.map = new Board(this, this.canvas, this.coloniesNumber);
        this.intervalPointer = setInterval(this.play.bind(this), this.speed);
        this.htmlConnector.h_statisticsPanel.innerHTML = "";
        for (var i = 0; i < this.coloniesNumber; i++) {
            this.htmlConnector.h_statisticsPanel.innerHTML +=
                '<span style="color:' + this.colours[i] + '"></span><br/>';
        }
        this.coloniesLabels = this.htmlConnector.h_statisticsPanel.querySelectorAll("span");
    };
    Game.prototype.play = function () {
        this.lastTime = Date.now();
        for (var i = 0; i < this.coloniesNumber; i++) {
            if (this.colonies[i] == null) {
                continue;
            }
            for (var j = 0; j < this.colonies[i].length; j++) {
                this.colonies[i][j].move();
            }
            if (this.colonies[i].length == 0) {
                this.coloniesLabels[i].innerHTML =
                    "<del>Colony " +
                        (i + 1) +
                        ": " +
                        this.colonies[i].length +
                        " Avg Vit : " +
                        Util.average(this.colonies[i]).toFixed(2) +
                        " Max Vit: " +
                        Util.maxVitality(this.colonies[i]).toFixed(2) +
                        "</del>";
                this.colonies[i] = null;
                continue;
            }
            this.coloniesLabels[i].innerHTML =
                "Colony " +
                    (i + 1) +
                    ": " +
                    this.colonies[i].length +
                    " Avg Vit : " +
                    Util.average(this.colonies[i]).toFixed(2) +
                    " Max Vit: " +
                    Util.maxVitality(this.colonies[i]).toFixed(2);
        }
        this.htmlConnector.h_ageLabel.innerHTML = "Age: " + this.ageCount++;
        this.timer += Date.now() - this.lastTime;
        if (this.timer > 250) {
            this.htmlConnector.h_fpsLabel.innerHTML =
                "FPS: " + (1000 / (Date.now() - this.lastTime)).toFixed(0);
            this.timer = 0;
        }
    };
    Game.prototype.getColour = function (index) {
        return this.colours[index];
    };
    Game.prototype.colonyPush = function (obj) {
        this.colonies[obj.colour].push(obj);
        this.peopleCount++;
    };
    Game.prototype.colonyRemove = function (obj) {
        var index = this.colonies[obj.colour].indexOf(obj, 0);
        if (index > -1) {
            this.colonies[obj.colour].splice(index, 1);
        }
        this.peopleCount--;
    };
    Game.prototype.stop = function () {
        clearInterval(this.intervalPointer);
    };
    return Game;
}());
var HTMLConnector = /** @class */ (function () {
    function HTMLConnector() {
        this.land_water_colours = false;
        this.h_canvas = document.getElementById("canvas");
        this.h_statisticsPanel = document.getElementById("test");
        this.h_ageLabel = document.querySelector("#age");
        this.h_fpsLabel = document.querySelector("#fps");
        this.h_mapSelect = document.querySelector("#level_map");
        this.h_number_of_colonies = document.querySelector("#number_of_colonies");
        this.h_time_interval = document.querySelector("#time_interval");
        this.h_reproductive_threshold = document.querySelector("#reproductive_threshold");
        this.h_add_map = document.querySelector("#add_map");
        this.getPreview();
    }
    //Start Game.
    HTMLConnector.prototype.startGame = function () {
        if (this.game != null) {
            this.game.stop();
        }
        this.game = new Game(this, this.h_canvas, this.h_mapSelect.options[this.h_mapSelect.selectedIndex].value, parseInt(this.h_number_of_colonies.value), parseInt(this.h_time_interval.value), parseInt(this.h_reproductive_threshold.value));
    };
    HTMLConnector.prototype.getPreview = function () {
        var canvas = document.querySelector("canvas.preview");
        var image = new Image();
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext("2d").drawImage(image, 0, 0);
        };
        image.onerror = function () {
            window.alert("loading preview failed");
        };
        image.src = this.h_mapSelect.options[this.h_mapSelect.selectedIndex].value;
    };
    //Update map list after uploading new map.
    HTMLConnector.prototype.updateMapList = function () {
        this.h_mapSelect.innerHTML +=
            '<option value="' +
                window.URL.createObjectURL(this.h_add_map.files[0]) +
                '" >' +
                this.h_add_map.files[0].name +
                "</option>";
    };
    //Allow grass and water colours changing.
    HTMLConnector.prototype.allowGWColourChanging = function () {
        var canvas = document.querySelector("canvas.preview");
        if (this.land_water_colours) {
            this.land_water_colours = false;
            document.querySelector(".colorGWPick").style.display =
                "none";
            canvas.removeEventListener("mousemove", this.pick);
        }
        else {
            this.land_water_colours = true;
            document.querySelector(".colorGWPick").style.display =
                "block";
            canvas.addEventListener("mousemove", this.pick);
        }
    };
    //Pick colours.
    HTMLConnector.prototype.pick = function (event) {
        var x = event.clientX;
        var y = event.clientY;
        var pixel = event.target
            .getContext("2d")
            .getImageData(x, y, 1, 1);
        var data = pixel.data;
        var hex = "#" +
            Util.int2hex(data[0]) +
            Util.int2hex(data[1]) +
            Util.int2hex(data[2]);
        document.querySelector(".colorGWPick").style.background = hex;
        document.querySelector(".colorGWPick").textContent = hex;
    };
    return HTMLConnector;
}());
var htCon;
window.onload = function () {
    htCon = new HTMLConnector();
    htCon.startGame();
};
//# sourceMappingURL=app.js.map