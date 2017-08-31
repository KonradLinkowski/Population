var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Colours;
(function (Colours) {
    Colours[Colours["GRASS"] = 65280] = "GRASS";
    Colours[Colours["WATER"] = 255] = "WATER";
    Colours[Colours["RED"] = 16711680] = "RED";
    Colours[Colours["PURPLE"] = 11796735] = "PURPLE";
    Colours[Colours["YELLOW"] = 65510] = "YELLOW";
    Colours[Colours["MAGENTA"] = 16711935] = "MAGENTA";
})(Colours || (Colours = {}));
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
var Map = (function () {
    function Map(canvas, coloniesNumber) {
        if (coloniesNumber === void 0) { coloniesNumber = 2; }
        this.coloniesNumber = coloniesNumber;
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
            color = (imageData[i] << 16) | (imageData[i + 1] << 8) | (imageData[i + 2]);
            if (color == Colours.GRASS) {
                x = (i / 4) % this._width;
                y = Math.floor((i / 4) / this._width);
                this.map[x][y] = GRASSTILE;
            }
            if (color == Colours.WATER) {
                x = (i / 4) % this._width;
                y = Math.floor((i / 4) / this._width);
                this.map[x][y] = WATERTILE;
            }
        }
        this.createColonies();
    }
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
        //this.context.fillStyle = "rgb(" + (ID & (255 << 16)) + ", " + (ID & (255 << 8)) + ", " + (ID & 255) + ")";
        this.context.fillStyle = "#" + obj.colour.toString(16);
        //window.alert("#" + obj.colour.toString(16));
        this.context.fillRect(x, y, 1, 1);
    };
    Map.prototype.killPerson = function (x, y, killer) {
        this.map[x][y].kill();
        this.setObj(x, y, killer);
    };
    Map.prototype.createColonies = function () {
        var x, y, offset = 6, x2, y2;
        for (var i = 0; i < this.coloniesNumber; i++) {
            while (true) {
                x = randomInt(0, this._width);
                y = randomInt(0, this._height);
                if (this.map[x][y].colour == Colours.GRASS) {
                    break;
                }
            }
            for (var j = 0; j < 40; j++) {
                while (true) {
                    x2 = x + randomInt(0, offset);
                    y2 = y + randomInt(0, offset);
                    //window.alert("i " + i + " j " + j + " x " + x + " y " + y + " x2 " + x2 + " y2 " + y2);
                    if (this.map[x2][y2].colour == Colours.GRASS) {
                        this.setObj(x2, y2, new Person(this, x2, y2, 0, randomInt(0, 100), coloniesColours[i], randomInt(0, 100)));
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
    function Person(map, x, y, age, reproductionValue, colour, vitality) {
        if (age === void 0) { age = randomInt(20, 70); }
        if (reproductionValue === void 0) { reproductionValue = randomInt(20, 70); }
        if (colour === void 0) { colour = coloniesColours[randomInt(0, coloniesColours.length)]; }
        if (vitality === void 0) { vitality = randomInt(20, 70); }
        _super.call(this, colour);
        this.dead = true;
        this.x = x;
        this.y = y;
        this.age = age;
        this.reproductionValue = reproductionValue;
        this.vitality = vitality;
        this.map = map;
        Person.list.push(this);
    }
    Person.prototype.mortality = function () {
        if (this.age < 30) {
            return (-1 / 2) * this.age + 30;
        }
        else {
            return this.age;
        }
    };
    Person.prototype.shouldDie = function () {
        return randomInt(0, 100) <= this.mortality();
    };
    Person.prototype.move = function () {
        //console.log(this.colour);
        this.age++;
        var x = Math.random() < 0.5 ? -1 : 1;
        var y = Math.random() < 0.5 ? -1 : 1;
        switch (this.map.getObj(this.x + x, this.y + y).colour) {
            case Colours.GRASS:
                this.map.setObj(this.x, this.y, GRASSTILE);
                this.reproduce();
                this.x += x;
                this.y += y;
                this.map.setObj(this.x, this.y, this);
                break;
            case Colours.WATER:
                this.vitality *= 1.2;
                break;
            case this.colour:
                this.age *= 0.8;
                break;
            default:
                if (this.vitality >= this.map.getObj(this.x + x, this.y + y).vitality) {
                    this.map.setObj(this.x, this.y, GRASSTILE);
                    this.reproduce();
                    this.x += x;
                    this.y += y;
                    this.map.killPerson(this.x, this.y, this);
                }
                else {
                    this.map.setObj(x, y, GRASSTILE);
                }
                break;
        }
        if (this.shouldDie()) {
            this.map.setObj(this.x, this.y, GRASSTILE);
            this.kill();
        }
    };
    Person.prototype.reproduce = function () {
        if (this.reproductionValue > randomInt(0, this.reproductionValue)) {
            return;
        }
        this.map.setObj(this.x, this.y, new Person(this.map, this.x, this.y, 0, randomInt(0, 100), this.colour, this.vitality));
    };
    Person.prototype.kill = function () {
        this.dead = true;
    };
    Person.list = [];
    return Person;
}(Tile));
function game() {
    //console.log(Person.list.length);
    for (var i = 0; i < Person.list.length; i++) {
        //console.log(Person.list[i]);
        Person.list[i].move();
    }
    testSpan.innerHTML = 'People: ' + Person.list.length;
    age.innerHTML = "Age: " + ageCount++;
}
var ageCount = 0;
var testSpan;
var age;
var test;
var coloniesColours = [Colours.MAGENTA, Colours.PURPLE, Colours.RED, Colours.YELLOW];
var colonies = [];
var GRASSTILE = new Tile(Colours.GRASS);
var WATERTILE = new Tile(Colours.WATER);
var image = new Image();
image.src = "mapa.png";
//console.log(Colours.PURPLE);
window.onload = function () {
    // console.log(Colours.PURPLE.toString(16));
    test = document.getElementById('test');
    var canvas = document.getElementById('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    var map = new Map(canvas);
    test.innerHTML += '<span id="testSpan">People: ' + Person.list.length + '</span>';
    testSpan = document.getElementById('testSpan');
    age = document.getElementById('age');
    setInterval(game, 100);
};
//# sourceMappingURL=app.js.map