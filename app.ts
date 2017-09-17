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
        console.log("map size", this._width, this._height);
        this.createColonies();
    }

    isInBounds(x: number, y: number): boolean {
        //console.log("is in bounds", x, y, this._width, this._height, x >= 0 && x < this._width && y >= 0 && y < this._height);
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
    }

    getObj(x: number, y: number): (Tile) {
        if (this.map[x] == null) return null;
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
        let x, y, offset = 10, x2, y2, test;
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
    private diseased: boolean = false;
    private _vitality: number;
    private map: Map;
    private game: Game;


    constructor(game: Game, map: Map, x: number, y: number, age: number = 0, reproductionValue: number = 0,
        colour: number = 0, vitality: number = Util.randomInt(20, 70)) {
        super(colour);
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

    shouldDie(): boolean {
        return this._vitality < this.age;
        //return randomInt(0, 100) <= this.mortality();
    }

    cripple(): void {
        if (this.diseased) {
            /*
            this._vitality *= 2;
            this.diseased = false;
            */
            return;
        }
        if (Math.random() < 0.5) return;
        this._vitality /= 2;
        this.diseased = true;
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
                this.cripple();
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
    reproductiveThreshold: number;

    intervalPointer;

    image = new Image();
    map: Map;
    canvas: HTMLCanvasElement;

    coloniesLabels;

    peopleCount = 0;

    speed: number;

    lastTime;

    timer = 0;

    constructor(canvas: HTMLCanvasElement, image: string, coloniesNumber: number, speed: number, reproductive_threshold) {
        this.canvas = canvas;
        this.speed = speed;
        this.coloniesNumber = coloniesNumber;
        this.reproductiveThreshold = reproductive_threshold;
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
        /*
        if (this.canvas.height > this.canvas.width) {
            this.canvas.style.height = "75%";
        } else {
            this.canvas.style.width = "75%";
        }
        */
        this.canvas.getContext('2d').drawImage(this.image, 0, 0);
        for (let i: number = 0; i < this.coloniesColours; i++) {
            this.colonies[i] = [];
        }
        this.map = new Map(this, <HTMLCanvasElement>this.canvas, this.coloniesNumber)
        this.intervalPointer = setInterval(this.play.bind(this), this.speed);
        test.innerHTML = "";
        for (let i: number = 0; i < this.coloniesNumber; i++) {
            test.innerHTML += '<span></span><br/>';
        }
        this.coloniesLabels = test.getElementsByTagName("span");
    }

    play(): void {
        this.lastTime = Date.now();
        for (let i: number = 0; i < this.colonies.length; i++) {
            for (let j: number = 0; j < this.colonies[i].length; j++) {
                this.colonies[i][j].move();
            }
            this.coloniesLabels[i].innerHTML = "Colony " + (i + 1) + ": " + this.colonies[i].length
                + " Avg Vit : " + Util.avarage(this.colonies[i]).toFixed(2);
        }
        age.innerHTML = "Age: " + this.ageCount++;
        this.timer += Date.now() - this.lastTime;
        //console.log(this.timer);
        if (this.timer > 250) {
            fps.innerHTML = "FPS: " + (1000 / (Date.now() - this.lastTime)).toFixed(0);
            this.timer = 0;
        }
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

    stop(): void {
        clearInterval(this.intervalPointer);
    }

    test(x, y) {
        return this.map.isInBounds(x, y);
    }

}


let age: HTMLElement;
let test: HTMLElement
let game: Game;
let level_map;
let time_interval: HTMLInputElement;
let number_of_colonies: HTMLInputElement;
let reproductive_threshold: HTMLInputElement;
let fps;
let canvas: any;

window.onload = () => {
    fps = document.querySelector("#fps");
    time_interval = <HTMLInputElement> document.querySelector("#time_interval");
    number_of_colonies = <HTMLInputElement> document.querySelector("#number_of_colonies");
    reproductive_threshold = <HTMLInputElement> document.querySelector("#reproductive_threshold");
    level_map = <HTMLSelectElement> document.querySelector("#level_map");
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
    game = new Game(canvas, "images/" + level_map.options[level_map.selectedIndex].value, parseInt(number_of_colonies.value), parseInt(time_interval.value), parseInt(reproductive_threshold.value));
}