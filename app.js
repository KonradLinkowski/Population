//getColour dziala na koloniach, a kolory na enumie, bo przesz jest jeszcze grass i water
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Util = (function () {
    function Util() {
    }
    Util.randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    Util.toColour = function (num) {
        var s = "000000" + num.toString(16);
        return "#" + s.substr(s.length - 6);
    };
    Util.avarage = function (numbers) {
        var sum = 0;
        for (var i = 0; i < numbers.length; i++) {
            sum += numbers[i].vitality;
        }
        return sum / numbers.length;
    };
    Util.max = function (numbers) {
        var max = 0;
        for (var i = 0; i < numbers.length; i++) {
            if (numbers[i].vitality > max) {
                max = numbers[i].vitality;
            }
        }
        return max;
    };
    return Util;
}());
var Map = (function () {
    function Map(game, canvas, coloniesNumber) {
        this.coloniesNumber = coloniesNumber;
        this.game = game;
        this.canvas = canvas;
        this._height = canvas.height;
        this._width = canvas.width;
        this.context = canvas.getContext('2d');
        var imageData = this.context.getImageData(0, 0, this._width, this._height).data;
        //#1a315c
        var x, y, color;
        this.map = [];
        for (var i = 0; i < this._width; i++) {
            this.map[i] = [];
        }
        for (var i = 0; i < imageData.length; i += 4) {
            var color_1 = Util.toColour((imageData[i] << 16) | (imageData[i + 1] << 8) | (imageData[i + 2]));
            if (color_1 == this.game.getColour(this.game.GRASSCOLOUR)) {
                x = (i / 4) % this._width;
                y = Math.floor((i / 4) / this._width);
                this.map[x][y] = this.game.GRASSTILE;
            }
            if (color_1 == this.game.getColour(this.game.WATERCOLOUR)) {
                x = (i / 4) % this._width;
                y = Math.floor((i / 4) / this._width);
                this.map[x][y] = this.game.WATERTILE;
            }
        }
        console.log("map size", this._width, this._height);
        this.createColonies();
    }
    Map.prototype.isInBounds = function (x, y) {
        //console.log("is in bounds", x, y, this._width, this._height, x >= 0 && x < this._width && y >= 0 && y < this._height);
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
    };
    Map.prototype.getObj = function (x, y) {
        if (this.map[x] == null)
            return null;
        return this.map[x][y];
    };
    Map.prototype.setObj = function (x, y, obj) {
        this.map[x][y] = obj;
        this.context.fillStyle = (this.game.getColour(obj.colour));
        this.context.fillRect(x, y, 1, 1);
    };
    Map.prototype.killPerson = function (x, y, killer) {
        this.map[x][y].kill();
        this.setObj(x, y, killer);
    };
    Map.prototype.createColonies = function () {
        var x, y, offset = 10, x2, y2, test;
        for (var i = 0; i < this.coloniesNumber; i++) {
            while (true) {
                x = Util.randomInt(0, this._width - 1);
                y = Util.randomInt(0, this._height - 1);
                console.log("x: " + x + " y: " + y);
                if (this.map[x][y].colour == this.game.GRASSCOLOUR) {
                    break;
                }
            }
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
                    if (this.map[x2][y2].colour == this.game.GRASSCOLOUR) {
                        this.setObj(x2, y2, new Person(game, this, x2, y2, 0, Util.randomInt(0, 100), i, Util.randomInt(0, 100)));
                        break;
                    }
                }
            }
        }
    };
    return Map;
}());
var Tile = (function () {
    function Tile(colour) {
        this._colour = colour;
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
var Person = (function (_super) {
    __extends(Person, _super);
    function Person(game, map, x, y, age, reproductionValue, colour, vitality) {
        if (age === void 0) { age = 0; }
        if (reproductionValue === void 0) { reproductionValue = 0; }
        if (colour === void 0) { colour = 0; }
        if (vitality === void 0) { vitality = Util.randomInt(20, 70); }
        _super.call(this, colour);
        this.dead = false;
        this.diseased = false;
        this.game = game;
        this.age = age;
        this.x = x;
        this.y = y;
        this.reproductionValue = reproductionValue;
        //this.reproductionValue = 0;
        this._vitality = vitality;
        this.map = map;
        this.game.colonyPush(this);
    }
    Person.prototype.shouldDie = function () {
        return this._vitality < this.age;
        //return randomInt(0, 100) <= this.mortality();
    };
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
    Person.prototype.move = function () {
        this.age++;
        this.reproductionValue++;
        //this.cripple(true);
        var x, y;
        do {
            x = Util.randomInt(-1, 1);
            y = Util.randomInt(-1, 1);
        } while (!this.map.isInBounds(this.x + x, this.y + y) && (x == 0 && y == 0));
        var tempColour = this.map.getObj(this.x + x, this.y + y) == null ? game.WATERCOLOUR : this.map.getObj(this.x + x, this.y + y).colour;
        switch (tempColour) {
            case this.game.GRASSCOLOUR:
                this.map.setObj(this.x, this.y, this.game.GRASSTILE);
                this.reproduce();
                this.x += x;
                this.y += y;
                this.map.setObj(this.x, this.y, this);
                break;
            case this.game.WATERCOLOUR:
                //this.vitality *= 1.2;
                break;
            case this.colour:
                //this.age *= 0.8;
                //this.cripple(false);
                break;
            default:
                if (this._vitality >= this.map.getObj(this.x + x, this.y + y)._vitality) {
                    this.map.setObj(this.x, this.y, this.game.GRASSTILE);
                    this.reproduce();
                    this.x += x;
                    this.y += y;
                    this.map.killPerson(this.x, this.y, this);
                }
                else {
                    this.map.setObj(this.x, this.y, this.game.GRASSTILE);
                    this.kill();
                }
                break;
        }
        if (this.shouldDie()) {
            this.map.setObj(this.x, this.y, this.game.GRASSTILE);
            this.kill();
        }
    };
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
var Game = (function () {
    function Game(canvas, image, coloniesNumber, speed, reproductive_threshold) {
        var _this = this;
        this.ageCount = 0;
        this.colours = ["#ffff00", "#ff00ff", "#ff0000", "#8800ff", "#ff8800", "#888888", "#8800ff", "#ff0088", "#000000", "#0088ff",
            "#00ff00", "#0000ff"];
        //coloniesColours = [Colours.YELLOW, Colours.MAGENTA, Colours.RED, Colours.PURPLE];
        this.coloniesColours = this.colours.length - 2;
        this.colonies = [];
        this.GRASSCOLOUR = this.colours.length - 2;
        this.WATERCOLOUR = this.colours.length - 1;
        this.GRASSTILE = new Tile(this.GRASSCOLOUR);
        this.WATERTILE = new Tile(this.WATERCOLOUR);
        this.image = new Image();
        this.peopleCount = 0;
        this.timer = 0;
        this.canvas = canvas;
        this.speed = speed;
        this.coloniesNumber = coloniesNumber;
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
        this.canvas.getContext('2d').drawImage(this.image, 0, 0);
        for (var i = 0; i < this.coloniesNumber; i++) {
            this.colonies[i] = [];
        }
        this.map = new Map(this, this.canvas, this.coloniesNumber);
        this.intervalPointer = setInterval(this.play.bind(this), this.speed);
        test.innerHTML = "";
        for (var i = 0; i < this.coloniesNumber; i++) {
            test.innerHTML += '<span style="color:' + this.colours[i] + '"></span><br/>';
        }
        this.coloniesLabels = test.getElementsByTagName("span");
    };
    Game.prototype.play = function () {
        this.lastTime = Date.now();
        for (var i = 0; i < this.coloniesNumber; i++) {
            for (var j = 0; j < this.colonies[i].length; j++) {
                this.colonies[i][j].move();
            }
            this.coloniesLabels[i].innerHTML = "Colony " + (i + 1) + ": " + this.colonies[i].length
                + " Avg Vit : " + Util.avarage(this.colonies[i]).toFixed(2) + " Max Vit: " + Util.max(this.colonies[i]).toFixed(2);
        }
        age.innerHTML = "Age: " + this.ageCount++;
        this.timer += Date.now() - this.lastTime;
        //console.log(this.timer);
        if (this.timer > 250) {
            fps.innerHTML = "FPS: " + (1000 / (Date.now() - this.lastTime)).toFixed(0);
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
    Game.prototype.test = function (x, y) {
        return this.map.isInBounds(x, y);
    };
    return Game;
}());
var age;
var test;
var game;
var level_map;
var time_interval;
var number_of_colonies;
var reproductive_threshold;
var add_map;
var fps;
var canvas;
window.onload = function () {
    fps = document.querySelector("#fps");
    time_interval = document.querySelector("#time_interval");
    number_of_colonies = document.querySelector("#number_of_colonies");
    reproductive_threshold = document.querySelector("#reproductive_threshold");
    level_map = document.querySelector("#level_map");
    add_map = document.querySelector("#add_map");
    test = document.getElementById('test');
    canvas = document.getElementById('canvas');
    canvas.getContext('2d').webkitImageSmoothingEnabled = false;
    canvas.getContext('2d').mozImageSmoothingEnabled = false;
    canvas.getContext('2d').imageSmoothingEnabled = false; /// future
    age = document.getElementById('age');
    startGame();
};
function startGame() {
    if (game != null) {
        game.stop();
    }
    game = new Game(canvas, level_map.options[level_map.selectedIndex].value, parseInt(number_of_colonies.value), parseInt(time_interval.value), parseInt(reproductive_threshold.value));
}
function updateMapList() {
    level_map.innerHTML += '<option value="' + window.URL.createObjectURL(add_map.files[0]) + '" >'
        + add_map.files[0].name + '</option>';
}
//# sourceMappingURL=app.js.map