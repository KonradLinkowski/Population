//getColour dziala na koloniach, a kolory na enumie, bo przesz jest jeszcze grass i water

class Util {

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    static toColour(num: number) {
        let s: string = "000000" + num.toString(16);
        return "#" + s.substr(s.length - 6);
    }

    static avarage(numbers: Person[]): number {
        let sum: number = 0;
        for (let i: number = 0; i < numbers.length; i++) {
            sum += numbers[i].vitality;
        }
        return sum / numbers.length;
    }

}

class Map {
    private canvas: HTMLCanvasElement;
    private context;
    private map: (Tile)[][];
    private _height: number;
    private _width: number;
    private coloniesNumber;
    private game: Game;

    constructor(game: Game, canvas: HTMLCanvasElement, coloniesNumber: number) {
        this.coloniesNumber = coloniesNumber;
        this.game = game;
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
            let color: string = Util.toColour((imageData[i] << 16) | (imageData[i + 1] << 8) | (imageData[i + 2]));
            if (color == this.game.getColour(this.game.GRASSCOLOUR)) {
                x = (i / 4) % this._width;
                y = Math.floor((i / 4) / this._width);
                this.map[x][y] = this.game.GRASSTILE;
            }
            if (color == this.game.getColour(this.game.WATERCOLOUR)) {
                x = (i / 4) % this._width;
                y = Math.floor((i / 4) / this._width);
                this.map[x][y] = this.game.WATERTILE;
            }
        }
        this.createColonies();
    }

    isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
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
        this.context.fillStyle = (this.game.getColour(obj.colour));
        this.context.fillRect(x, y, 1, 1);
    }

    killPerson(x: number, y: number, killer: Person): void {
        (<Person>this.map[x][y]).kill();
        this.setObj(x, y, killer);
    }

    createColonies() {
        let x, y, offset = 10, x2, y2;
        for (let i: number = 0; i < this.coloniesNumber; i++) {
            while (true) {
                x = Util.randomInt(0, this._width - 1);
                y = Util.randomInt(0, this._height - 1);
                console.log("x: " + x + " y: " + y);
                if (this.map[x][y].colour == this.game.GRASSCOLOUR) {
                    break;
                }
            }
            for (let j: number = 0; j < 50; j++) {
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
    private x: number;
    private y: number;
    private dead: boolean = false;
    private age: number;
    private reproductionValue: number;
    private _vitality: number;
    private map: Map;
    private game: Game;

    constructor(game: Game, map: Map, x: number, y: number, age: number = 0, reproductionValue: number = 0,
        colour: number = 0, vitality: number = Util.randomInt(20, 70)) {
        super(colour);
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

    shouldDie(): boolean {
        return this._vitality < this.age;
        //return randomInt(0, 100) <= this.mortality();
    }

    public move(): void {
        this.age++;
        this.reproductionValue++;
        //let x = Math.random() < 0.5 ? -1 : 1;
        //let y = Math.random() < 0.5 ? -1 : 1;
        let x, y;
        do {
            x = Util.randomInt(-1, 1);
            y = Util.randomInt(-1, 1);
        } while (!this.map.isInBounds(this.x + x, this.y + y) && (x == 0 && y == 0));
        let tempColour: number = this.map.getObj(this.x + x, this.y + y) == null ? game.WATERCOLOUR : this.map.getObj(this.x + x, this.y + y).colour;
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
                break;
            default:
                if (this._vitality >= (<Person>this.map.getObj(this.x + x, this.y + y))._vitality) {
                    this.map.setObj(this.x, this.y, this.game.GRASSTILE);
                    this.reproduce();
                    this.x += x;
                    this.y += y;
                    this.map.killPerson(this.x, this.y, this);
                } else {
                    this.map.setObj(this.x, this.y, this.game.GRASSTILE);
                    this.kill();
                }
                break;
        }
        if (this.shouldDie()) {
            this.map.setObj(this.x, this.y, this.game.GRASSTILE);
            this.kill();
        }
    }

    reproduce(): void {
        if (this.reproductionValue < this.game.reproductiveThreshold) {
            return;
        }
        this.reproductionValue = 0;
        let variable: number = Util.randomInt(-5, 5);
        this.map.setObj(this.x, this.y, new Person(this.game, this.map, this.x, this.y, 0, Util.randomInt(0, 100), this.colour, this._vitality + variable));
    }

    kill(): void {
        this.dead = true;
        this.game.colonyRemove(this);
    }

    get vitality(): number {
        return this._vitality;
    }
}

class Game {

    ageCount: number = 0;
    colours: string[] = ["#ffff00", "#ff00ff", "#ff0000", "#bb00ff", "#00ff00", "#0000ff"];
    //coloniesColours = [Colours.YELLOW, Colours.MAGENTA, Colours.RED, Colours.PURPLE];
    coloniesColours: number = this.colours.length - 2;
    colonies: Array<Person[]> = [];

    coloniesNumber: number;

    GRASSCOLOUR = this.colours.length - 2;
    WATERCOLOUR = this.colours.length - 1;

    GRASSTILE = new Tile(this.GRASSCOLOUR);
    WATERTILE = new Tile(this.WATERCOLOUR);
    reproductiveThreshold = 20;

    image = new Image();
    map: Map;
    canvas: HTMLCanvasElement;

    coloniesLabels;

    peopleCount = 0;

    speed: number;

    constructor(canvas: HTMLCanvasElement, coloniesNumber: number, image: string, speed: number) {
        this.canvas = canvas;
        this.speed = speed;
        this.coloniesNumber = coloniesNumber;
        this.image.onload = () => {
            this.setup();
        };
        this.image.onerror = () => {
            window.alert("loading failed");
        };
        this.image.src = image;
    }

    setup(): void {
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        this.canvas.getContext('2d').drawImage(this.image, 0, 0);
        for (let i: number = 0; i < this.coloniesColours; i++) {
            this.colonies[i] = [];
        }
        this.map = new Map(this, <HTMLCanvasElement>this.canvas, this.coloniesNumber)
        setInterval(this.play.bind(this), this.speed);
        for (let i: number = 0; i < this.coloniesNumber; i++) {
            test.innerHTML += '<span></span><br/>';
        }
        this.coloniesLabels = test.getElementsByTagName("span");
    }

    play(): void {
        for (let i: number = 0; i < this.colonies.length; i++) {
            for (let j: number = 0; j < this.colonies[i].length; j++) {
                this.colonies[i][j].move();
            }
            this.coloniesLabels[i].innerHTML = "Colony " + (i + 1) + ": " + this.colonies[i].length
                + " Avg Vit : " + Util.avarage(this.colonies[i]).toFixed(2);
        }
        age.innerHTML = "Age: " + this.ageCount++;
    }

    getColour(index: number): string {
        return this.colours[index];
    }

    colonyPush(obj: Person): void {
        this.colonies[obj.colour].push(obj);
        this.peopleCount++;
    }

    colonyRemove(obj: Person): void {
        let index = this.colonies[obj.colour].indexOf(obj, 0);
        if (index > -1) {
            this.colonies[obj.colour].splice(index, 1);
        }
        this.peopleCount--;
    }

}


let age: HTMLElement;
let test: HTMLElement
let game: Game;

window.onload = () => {
    test = document.getElementById('test');
    let canvas: any = document.getElementById('canvas');

    canvas.getContext('2d').webkitImageSmoothingEnabled = false;
    canvas.getContext('2d').mozImageSmoothingEnabled = false;
    canvas.getContext('2d').imageSmoothingEnabled = false; /// future

    game = new Game(canvas, 4, "mapa5.png", 1);
    age = document.getElementById('age');

};