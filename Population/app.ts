enum Colours {
    GRASS = 255 << 8,
    WATER = 255,
    RED = 255 << 16,
    PURPLE = (180 << 16) | 255,
    YELLOW = (255 << 8) | 230,
    MAGENTA = (255 << 16) | 255
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

class Map {
    private canvas: HTMLCanvasElement;
    private context;
    private map: (Tile)[][];
    private _height: number;
    private _width: number;
    private coloniesNumber;

    constructor(canvas: HTMLCanvasElement, coloniesNumber: number = 2) {
        this.coloniesNumber = coloniesNumber;
        this.canvas = canvas;
        this._height = canvas.height;
        this._width = canvas.width;
        this.context = canvas.getContext('2d');
        let imageData = this.context.getImageData(0, 0, this._width, this._height).data;
        //#1a315c
        let x, y, color;
        this.map = [];
        for (let i = 0; i < this._width; i++) {
            this.map[i] = [];
        }
        for (let i = 0; i < imageData.length; i += 4) {
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

    get height(): number {
        return this._height;
    }

    get width(): number {
        return this._width;
    }

    getObj(x: number, y: number): (Tile) {
        return this.map[x][y];
    }

    setObj(x: number, y: number, obj: Tile): void {
        this.map[x][y] = obj;
        //this.context.fillStyle = "rgb(" + (ID & (255 << 16)) + ", " + (ID & (255 << 8)) + ", " + (ID & 255) + ")";
        this.context.fillStyle = "#" + obj.colour.toString(16);
        //window.alert("#" + obj.colour.toString(16));
        this.context.fillRect(x, y, 1, 1);
    }

    killPerson(x: number, y: number, killer: Person): void {
        (<Person>this.map[x][y]).kill();
        this.setObj(x, y, killer);
    }

    createColonies() {
        let x, y, offset = 6, x2, y2;
        for (let i: number = 0; i < this.coloniesNumber; i++) {
            while (true) {
                x = randomInt(0, this._width);
                y = randomInt(0, this._height);
                if (this.map[x][y].colour == Colours.GRASS) {
                    break;
                }
            } 
            for (let j: number = 0; j < 40; j++) {
                while (true) {
                    x2 = x + randomInt(0, offset);
                    y2 = y + randomInt(0, offset);
                    //window.alert("i " + i + " j " + j + " x " + x + " y " + y + " x2 " + x2 + " y2 " + y2);
                    if (this.map[x2][y2].colour == Colours.GRASS) {
                        this.setObj(x2, y2, new Person (this, x2, y2, 0, randomInt(0, 100), coloniesColours[i], randomInt(0, 100)));
                        break;
                    }
                }
            }
        }
    }

}

class Tile {
    protected _colour: number;

    constructor(colour: number) {
        this._colour = colour;
    }

    get colour(): number {
        return this._colour;
    }

    set colour(colour: number) {
        this._colour = colour;
    }
}

class Person extends Tile {
    public static list: Array<Person> = [];
    private x: number;
    private y: number;
    private dead: boolean = true;
    private age: number;
    private reproductionValue: number;
    private vitality: number;
    private map: Map;

    constructor(map: Map, x: number, y: number, age: number = randomInt(20, 70), reproductionValue: number = randomInt(20, 70),
        colour: number = coloniesColours[randomInt(0, coloniesColours.length)], vitality: number = randomInt(20, 70)) {
        super(colour);
        this.x = x;
        this.y = y;
        this.age = age;
        this.reproductionValue = reproductionValue;
        this.vitality = vitality;
        this.map = map;
        Person.list.push(this);
    }

    mortality(): number {
        if (this.age < 30) {
            return (-1 / 2) * this.age + 30;
        } else {
            return this.age;
        }
    }

    shouldDie(): boolean {
        return randomInt(0, 100) <= this.mortality();
    }

    public move(): void {
        //console.log(this.colour);
        this.age++;
        let x = Math.random() < 0.5 ? -1 : 1;
        let y = Math.random() < 0.5 ? -1 : 1;
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
                if (this.vitality >= (<Person>this.map.getObj(this.x + x, this.y + y)).vitality) {
                    this.map.setObj(this.x, this.y, GRASSTILE);
                    this.reproduce();
                    this.x += x;
                    this.y += y;
                    this.map.killPerson(this.x, this.y, this);
                } else {
                    this.map.setObj(x, y, GRASSTILE);
                }
                break;
        }
        if (this.shouldDie()) {
            this.map.setObj(this.x, this.y, GRASSTILE);
            this.kill();
        }
    }

    reproduce(): void {
        if (this.reproductionValue > randomInt(0, this.reproductionValue)) {
            return;
        }
        this.map.setObj(this.x, this.y, new Person(this.map, this.x, this.y, 0, randomInt(0, 100), this.colour, this.vitality));
    }

    kill(): void {
        this.dead = true;
    }
}

function game(): void {
    //console.log(Person.list.length);
    for (let i: number = 0; i < Person.list.length; i++) {
        //console.log(Person.list[i]);
        Person.list[i].move();
    }
    testSpan.innerHTML = 'People: ' + Person.list.length;
    age.innerHTML = "Age: " + ageCount++;
}

let ageCount: number = 0;
let testSpan: HTMLElement;
let age: HTMLElement;
let test: HTMLElement
let coloniesColours = [Colours.MAGENTA, Colours.PURPLE, Colours.RED, Colours.YELLOW];
let colonies: Array<Person> = [];
const GRASSTILE = new Tile(Colours.GRASS);
const WATERTILE = new Tile(Colours.WATER);

let image = new Image();
image.src = "mapa.png";
//console.log(Colours.PURPLE);
window.onload = () => {
   // console.log(Colours.PURPLE.toString(16));
    test = document.getElementById('test');
    let canvas: any = document.getElementById('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    let map = new Map(<HTMLCanvasElement>canvas);

    test.innerHTML += '<span id="testSpan">People: ' + Person.list.length + '</span>';
    testSpan = document.getElementById('testSpan');
    age = document.getElementById('age');
    setInterval(game, 100);
};