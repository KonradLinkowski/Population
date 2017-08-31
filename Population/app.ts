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

    constructor(canvas: HTMLCanvasElement) {
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
        this.context.fillStyle = "#" + obj.colour;
        this.context.fillRect(x, y, 1, 1);
    }

    killPerson(x: number, y: number, killer: Person): void {
        (<Person>this.map[x][y]).kill();
        this.setObj(x, y, killer);
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
    public static list: Array<Person>;
    private x: number;
    private y: number;
    private dead: boolean;
    private age: number;
    private reproductionValue: number;
    private vitality: number;
    private map: Map;

    constructor(map: Map, age: number = randomInt(20, 70), reproductionValue: number = randomInt(20, 70),
        colour: number = colonys[randomInt(0, colonys.length)], vitality: number = randomInt(20, 70)) {
        super(colour);
        this.age = age;
        this.reproductionValue = reproductionValue;
        this.vitality = vitality;
        this.map = map;
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

    move(): void {
        this.age++;
        let x = Math.random() < 0.5 ? -1 : 1;
        let y = Math.random() < 0.5 ? -1 : 1;
        switch (this.map.getObj(x, y).colour) {
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
                if (this.vitality >= (<Person>this.map.getObj(x, y)).vitality) {
                    this.map.setObj(x, y, GRASSTILE);
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
            this.map.setObj(x, y, GRASSTILE);
            this.kill();
        }
    }

    reproduce(): void {
        if (this.reproductionValue > randomInt(0, this.reproductionValue)) {
            return;
        }
        this.map.setObj(this.x, this.y, new Person(this.map, 0, randomInt(0, 100), this.colour, this.vitality));
    }

    kill(): void {
        this.dead = true;
    }
}

let colonys = [Colours.MAGENTA, Colours.PURPLE, Colours.RED, Colours.YELLOW];
const GRASSTILE = new Tile(Colours.GRASS);
const WATERTILE = new Tile(Colours.WATER);

let image = new Image();
image.src = "mapa.png";
console.log(Colours.PURPLE);
window.onload = () => {
    console.log(Colours.PURPLE.toString(16));
    let test: HTMLElement = document.getElementById('test');
    let canvas: any = document.getElementById('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    let map = new Map(<HTMLCanvasElement> canvas);
};