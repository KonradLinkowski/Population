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
        this.createColonies();
    }
    Map.prototype.isInBounds = function (x, y) {
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
    };
    Object.defineProperty(Map.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Map.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Map.prototype.getObj = function (x, y) {
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
        var x, y, offset = 10, x2, y2;
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
                while (true) {
                    do {
                        x2 = x + Util.randomInt(0, offset);
                        y2 = y + Util.randomInt(0, offset);
                    } while (!this.isInBounds(x, y));
                    //window.alert("i " + i + " j " + j + " x " + x + " y " + y + " x2 " + x2 + " y2 " + y2);
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
        this.x = x;
        this.y = y;
        this.age = age;
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
    Person.prototype.cripple = function () {
        if (this.diseased) {
            /*
            this._vitality *= 2;
            this.diseased = false;
            */
            return;
        }
        if (Math.random() < 0.5)
            return;
        this._vitality /= 2;
        this.diseased = true;
    };
    Person.prototype.move = function () {
        this.age++;
        this.reproductionValue++;
        //let x = Math.random() < 0.5 ? -1 : 1;
        //let y = Math.random() < 0.5 ? -1 : 1;
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
                this.cripple();
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
    function Game(canvas, coloniesNumber, image, speed) {
        var _this = this;
        this.ageCount = 0;
        this.colours = ["#ffff00", "#ff00ff", "#ff0000", "#bb00ff", "#00ff00", "#0000ff"];
        //coloniesColours = [Colours.YELLOW, Colours.MAGENTA, Colours.RED, Colours.PURPLE];
        this.coloniesColours = this.colours.length - 2;
        this.colonies = [];
        this.GRASSCOLOUR = this.colours.length - 2;
        this.WATERCOLOUR = this.colours.length - 1;
        this.GRASSTILE = new Tile(this.GRASSCOLOUR);
        this.WATERTILE = new Tile(this.WATERCOLOUR);
        this.reproductiveThreshold = 5;
        this.image = new Image();
        this.peopleCount = 0;
        this.canvas = canvas;
        this.speed = speed;
        this.coloniesNumber = coloniesNumber;
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
        this.canvas.getContext('2d').drawImage(this.image, 0, 0);
        for (var i = 0; i < this.coloniesColours; i++) {
            this.colonies[i] = [];
        }
        this.map = new Map(this, this.canvas, this.coloniesNumber);
        setInterval(this.play.bind(this), this.speed);
        for (var i = 0; i < this.coloniesNumber; i++) {
            test.innerHTML += '<span></span><br/>';
        }
        this.coloniesLabels = test.getElementsByTagName("span");
    };
    Game.prototype.play = function () {
        for (var i = 0; i < this.colonies.length; i++) {
            for (var j = 0; j < this.colonies[i].length; j++) {
                this.colonies[i][j].move();
            }
            this.coloniesLabels[i].innerHTML = "Colony " + (i + 1) + ": " + this.colonies[i].length
                + " Avg Vit : " + Util.avarage(this.colonies[i]).toFixed(2);
        }
        age.innerHTML = "Age: " + this.ageCount++;
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
    return Game;
}());
var age;
var test;
var game;
window.onload = function () {
    test = document.getElementById('test');
    var canvas = document.getElementById('canvas');
    canvas.getContext('2d').webkitImageSmoothingEnabled = false;
    canvas.getContext('2d').mozImageSmoothingEnabled = false;
    canvas.getContext('2d').imageSmoothingEnabled = false; /// future
    game = new Game(canvas, 4, "europe3.png", 5);
    age = document.getElementById('age');
};
//# sourceMappingURL=app.js.map