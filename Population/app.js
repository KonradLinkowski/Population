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
    function Map(canvas, test) {
        this.canvas = canvas;
        this._height = canvas.height;
        this._width = canvas.width;
        this.context = canvas.getContext('2d');
        var imageData = this.context.getImageData(0, 0, this._width, this._height).data;
        test.innerHTML += "Coś działa " + imageData.length + "<br>";
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
        this.context.fillStyle = "#" + obj.colour;
        this.context.fillRect(x, y, 1, 1);
    };
    Map.prototype.killPerson = function (x, y, killer) {
        this.map[x][y].kill();
        this.setObj(x, y, killer);
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
    function Person(map, age, reproductionValue, colour, vitality) {
        if (age === void 0) { age = randomInt(20, 70); }
        if (reproductionValue === void 0) { reproductionValue = randomInt(20, 70); }
        if (colour === void 0) { colour = colonys[randomInt(0, colonys.length)]; }
        if (vitality === void 0) { vitality = randomInt(20, 70); }
        _super.call(this, colour);
        this.reproduce = {};
        this.age = age;
        this.reproductionValue = reproductionValue;
        this.vitality = vitality;
        this.map = map;
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
        this.age++;
        var x = randomInt(-1, 1);
        var y = randomInt(-1, 1);
        switch (this.map.getObj(x, y).colour) {
            case Colours.GRASS:
                this.map.setObj(this.x, this.y, GRASSTILE);
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
                if (this.vitality >= this.map.getObj(x, y).vitality) {
                    this.map.setObj(x, y, GRASSTILE);
                    this.x += x;
                    this.y += y;
                    this.map.killPerson(this.x, this.y, this);
                }
                else {
                }
                break;
        }
        if (this.shouldDie()) {
            this.map.killPerson(this.x, this.y, this);
        }
    };
    Person.prototype.kill = function () {
        this.dead = true;
    };
    return Person;
}(Tile));
var colonys = [Colours.MAGENTA, Colours.PURPLE, Colours.RED, Colours.YELLOW];
var GRASSTILE = new Tile(Colours.GRASS);
var WATERTILE = new Tile(Colours.WATER);
var image = new Image();
image.src = "mapa.png";
console.log(Colours.PURPLE);
window.onload = function () {
    console.log(Colours.PURPLE.toString(16));
    var test = document.getElementById('test');
    var canvas = document.getElementById('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    var map = new Map(canvas, test);
};
//# sourceMappingURL=app.js.map