//Utilities
class Util {
  //Random int between min inclusive and max exclusive.
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  //Change rgb int to rgb hexadecimal string.
  static rgb2hex(num: number) {
    let s: string = "000000" + num.toString(16);
    return "#" + s.substr(s.length - 6);
  }

  static int2hex(num: number) {
    let s: string = "00" + num.toString(16);
    return s.substr(s.length - 2);
  }

  //Average vitality of Person in colony.
  static avarage(numbers: Person[]): number {
    let sum: number = 0;
    for (let i: number = 0; i < numbers.length; i++) {
      sum += numbers[i].vitality;
    }
    return sum / numbers.length;
  }

  //Maximum vitality of Person in colony.
  static maxVitality(numbers: Person[]): number {
    let max: number = 0;
    for (let i: number = 0; i < numbers.length; i++) {
      if (numbers[i].vitality > max) {
        max = numbers[i].vitality;
      }
    }
    return max;
  }

  static maxNumber(...args: number[]) {
    let max: number = 0;
    for (let arg of args) {
      if (arg > max) {
        max = arg;
      }
    }
    return max;
  }

  static maxSaturation(imageData): Uint8ClampedArray {
    let temp: number;
    for (let i: number = 0; i < imageData.length; i += 4) {
      temp = Util.maxNumber(imageData[i], imageData[i + 1], imageData[i + 2]);
      for (let j: number = 0; j < 3; j++) {
        if (imageData[i + j] == temp) {
          imageData[i + j] = 255;
        } else {
          imageData[i + j] = 0;
        }
      }
    }
    return imageData;
  }
}

//Board
class Board {
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
    this.context = canvas.getContext("2d");
    let imageData = this.context.getImageData(0, 0, this._width, this._height)
      .data;

    //#1a315c
    let x, y, color;
    this.map = [];
    for (let i = 0; i < this._width; i++) {
      this.map[i] = [];
    }
    for (let i = 0; i < imageData.length; i += 4) {
      let color: string =
        "#" +
        Util.int2hex(imageData[i]) +
        Util.int2hex(imageData[i + 1]) +
        Util.int2hex(imageData[i + 2]);
      if (color == this.game.getColour(this.game.GRASSCOLOUR)) {
        x = (i / 4) % this._width;
        y = Math.floor(i / 4 / this._width);
        this.map[x][y] = this.game.GRASSTILE;
      }
      if (color == this.game.getColour(this.game.WATERCOLOUR)) {
        x = (i / 4) % this._width;
        y = Math.floor(i / 4 / this._width);
        this.map[x][y] = this.game.WATERTILE;
      }
    }
    console.log("map size", this._width, this._height);
    this.createColonies();
  }

  //Check whether x and y are in board's bounds.
  isInBounds(x: number, y: number): boolean {
    //console.log("is in bounds", x, y, this._width, this._height, x >= 0 && x < this._width && y >= 0 && y < this._height);
    return x >= 0 && x < this._width && y >= 0 && y < this._height;
  }

  //Returns object at (x, y).
  getObj(x: number, y: number): Tile {
    if (this.map[x] == null) return null;
    return this.map[x][y];
  }

  //Sets object at (x, y).
  setObj(x: number, y: number, obj: Tile): void {
    this.map[x][y] = obj;
    this.context.fillStyle = this.game.getColour(obj.colour);
    this.context.fillRect(x, y, 1, 1);
  }

  //Kills Person at position.
  killPerson(x: number, y: number, killer: Person): void {
    (<Person>this.map[x][y]).kill();
    this.setObj(x, y, killer);
  }

  //Create colonies.
  createColonies() {
    let x,
      y,
      offset = 10,
      x2,
      y2,
      test;
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      while (true) {
        x = Util.randomInt(0, this._width - 1);
        y = Util.randomInt(0, this._height - 1);
        if (this.map[x][y].colour == this.game.GRASSCOLOUR) {
          break;
        }
      }
      console.log("x: " + x + " y: " + y);
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
            this.setObj(
              x2,
              y2,
              new Person(
                this.game,
                this,
                x2,
                y2,
                0,
                Util.randomInt(0, 100),
                i,
                Util.randomInt(0, 100)
              )
            );
            break;
          }
        }
      }
    }
  }
}

//Tile
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

//Person
class Person extends Tile {
  private x: number;
  private y: number;
  private dead: boolean = false;
  private age: number;
  private reproductionValue: number;
  private diseased: boolean = false;
  private _vitality: number;
  private map: Board;
  private game: Game;

  constructor(
    game: Game,
    map: Board,
    x: number,
    y: number,
    age: number = 0,
    reproductionValue: number = 0,
    colour: number = 0,
    vitality: number = Util.randomInt(20, 70)
  ) {
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

  //Check whether Person should die.
  shouldDie(): boolean {
    return this._vitality < this.age;
    //return randomInt(0, 100) <= this.mortality();
  }

  //Make Person ill or well.
  cripple(chance: boolean): void {
    let howMuch: number;
    if (Math.random() < 0.5) return;
    if (chance && this.diseased) {
      this._vitality *= howMuch;
      this.diseased = false;
      return;
    }
    this._vitality /= howMuch;
    this.diseased = true;
  }

  //Person move every age.
  public move(): void {
    this.age++;
    this.reproductionValue++;
    //this.cripple(true);
    let x, y;
    do {
      x = Util.randomInt(-1, 1);
      y = Util.randomInt(-1, 1);
    } while (
      !this.map.isInBounds(this.x + x, this.y + y) &&
      (x == 0 && y == 0)
    );
    let tempColour: number =
      this.map.getObj(this.x + x, this.y + y) == null
        ? this.game.WATERCOLOUR
        : this.map.getObj(this.x + x, this.y + y).colour;
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
        if (
          this._vitality >=
          (<Person>this.map.getObj(this.x + x, this.y + y))._vitality
        ) {
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

  //Reproduction.
  reproduce(): void {
    if (this.reproductionValue < this.game.reproductiveThreshold) {
      return;
    }
    this.reproductionValue = 0;
    let variable: number = Util.randomInt(-5, 5);
    this.map.setObj(
      this.x,
      this.y,
      new Person(
        this.game,
        this.map,
        this.x,
        this.y,
        0,
        Util.randomInt(0, 100),
        this.colour,
        this._vitality + variable
      )
    );
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
  colours: string[] = [
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
  //coloniesColours = [Colours.YELLOW, Colours.MAGENTA, Colours.RED, Colours.PURPLE];
  coloniesColours: number = this.colours.length - 2;
  colonies: Array<Person[]> = [];

  coloniesNumber: number;

  GRASSCOLOUR = this.colours.length - 2;
  WATERCOLOUR = this.colours.length - 1;

  GRASSTILE: Tile;
  WATERTILE: Tile;

  reproductiveThreshold: number;

  intervalPointer;

  htmlConnector: HTMLConnector;
  image = new Image();
  map: Board;
  canvas: HTMLCanvasElement;

  coloniesLabels;

  peopleCount = 0;

  speed: number;

  lastTime;

  timer = 0;

  constructor(
    htmlConnector: HTMLConnector,
    canvas: HTMLCanvasElement,
    image: string,
    coloniesNumber: number,
    speed: number,
    reproductive_threshold,
    allowGWColours: boolean = false,
    grassColour: string = "",
    waterColour: string = ""
  ) {
    this.htmlConnector = htmlConnector;
    this.canvas = canvas;
    this.speed = speed;
    this.coloniesNumber = coloniesNumber;
    if (allowGWColours) {
      /*
            this.GRASSCOLOUR = grassColour;
            this.WATERCOLOUR = waterColour;
            */
    }
    this.GRASSTILE = new Tile(this.GRASSCOLOUR);
    this.WATERTILE = new Tile(this.WATERCOLOUR);
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
    this.canvas.getContext("2d").drawImage(this.image, 0, 0);
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      this.colonies[i] = [];
    }
    this.map = new Board(
      this,
      <HTMLCanvasElement>this.canvas,
      this.coloniesNumber
    );
    this.intervalPointer = setInterval(this.play.bind(this), this.speed);
    this.htmlConnector.h_statisticsPanel.innerHTML = "";
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      this.htmlConnector.h_statisticsPanel.innerHTML +=
        '<span style="color:' + this.colours[i] + '"></span><br/>';
    }
    this.coloniesLabels = this.htmlConnector.h_statisticsPanel.getElementsByTagName(
      "span"
    );
  }

  play(): void {
    this.lastTime = Date.now();
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      if (this.colonies[i] == null) {
        continue;
      }
      for (let j: number = 0; j < this.colonies[i].length; j++) {
        this.colonies[i][j].move();
      }
      if (this.colonies[i].length == 0) {
        this.coloniesLabels[i].innerHTML =
          "<del>Colony " +
          (i + 1) +
          ": " +
          this.colonies[i].length +
          " Avg Vit : " +
          Util.avarage(this.colonies[i]).toFixed(2) +
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
        Util.avarage(this.colonies[i]).toFixed(2) +
        " Max Vit: " +
        Util.maxVitality(this.colonies[i]).toFixed(2);
    }
    this.htmlConnector.h_ageLabel.innerHTML = "Age: " + this.ageCount++;
    this.timer += Date.now() - this.lastTime;
    //console.log(this.timer);
    if (this.timer > 250) {
      this.htmlConnector.h_fpsLabel.innerHTML =
        "FPS: " + (1000 / (Date.now() - this.lastTime)).toFixed(0);
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
}

class HTMLConnector {
  game: Game;
  h_canvas: HTMLCanvasElement;
  h_statisticsPanel: HTMLElement;
  h_ageLabel: HTMLElement;
  h_fpsLabel: HTMLElement;
  h_mapSelect: HTMLSelectElement;
  h_number_of_colonies: HTMLInputElement;
  h_time_interval: HTMLInputElement;
  h_reproductive_threshold: HTMLInputElement;
  h_add_map: HTMLInputElement;

  land_water_colours: boolean = false;

  constructor() {
    this.h_canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.h_statisticsPanel = document.getElementById("test");
    this.h_ageLabel = <HTMLElement>document.querySelector("#age");
    this.h_fpsLabel = <HTMLElement>document.querySelector("#fps");
    this.h_mapSelect = <HTMLSelectElement>document.querySelector("#level_map");
    this.h_number_of_colonies = <HTMLInputElement>(
      document.querySelector("#number_of_colonies")
    );
    this.h_time_interval = <HTMLInputElement>(
      document.querySelector("#time_interval")
    );
    this.h_reproductive_threshold = <HTMLInputElement>(
      document.querySelector("#reproductive_threshold")
    );
    this.h_add_map = <HTMLInputElement>document.querySelector("#add_map");
    //this.h_canvas.getContext('2d').webkitImageSmoothingEnabled = false;
    //this.h_canvas.getContext('2d').mozImageSmoothingEnabled = false;
    //this.h_canvas.getContext('2d').imageSmoothingEnabled = false; /// future
    this.getPreview();
  }

  //Start Game.
  startGame() {
    if (this.game != null) {
      this.game.stop();
    }
    this.game = new Game(
      this,
      this.h_canvas,
      (<HTMLOptionElement>(
        this.h_mapSelect.options[this.h_mapSelect.selectedIndex]
      )).value,
      parseInt(this.h_number_of_colonies.value),
      parseInt(this.h_time_interval.value),
      parseInt(this.h_reproductive_threshold.value)
    );
  }

  getPreview() {
    let canv: HTMLCanvasElement = <HTMLCanvasElement>(
      document.querySelector("canvas.preview")
    );
    let image: HTMLImageElement = new Image();
    image.onload = () => {
      canv.width = image.width;
      canv.height = image.height;
      canv.getContext("2d").drawImage(image, 0, 0);
      //let imageData: ImageData = new ImageData(Util.maxSaturation(canv.getContext('2d').getImageData(0, 0, image.width, image.height).data),image.width, image.height);
      //canv.getContext('2d').putImageData(imageData, 0, 0);
    };
    image.onerror = () => {
      window.alert("loading preview failed");
    };
    image.src = (<HTMLOptionElement>(
      this.h_mapSelect.options[this.h_mapSelect.selectedIndex]
    )).value;
  }

  //Update map list after uploading new map.
  updateMapList(): void {
    this.h_mapSelect.innerHTML +=
      '<option value="' +
      window.URL.createObjectURL(this.h_add_map.files[0]) +
      '" >' +
      this.h_add_map.files[0].name +
      "</option>";
  }

  //Allow grass and water colours changing.
  allowGWColourChanging(): void {
    let canv: HTMLCanvasElement = <HTMLCanvasElement>(
      document.querySelector("canvas.preview")
    );
    if (this.land_water_colours) {
      this.land_water_colours = false;
      (<HTMLElement>document.querySelector(".colorGWpick")).style.display =
        "none";
      canv.removeEventListener("mousemove", this.pick);
    } else {
      this.land_water_colours = true;
      (<HTMLElement>document.querySelector(".colorGWpick")).style.display =
        "block";
      canv.addEventListener("mousemove", this.pick);
    }
  }

  //Pick colours.
  pick(event) {
    let x = event.layerX;
    let y = event.layerY;
    let pixel = event.target.getContext("2d").getImageData(x, y, 1, 1);
    let data = pixel.data;
    let hex =
      "#" +
      Util.int2hex(data[0]) +
      Util.int2hex(data[1]) +
      Util.int2hex(data[2]);
    (<HTMLElement>(
      document.querySelector(".colorGWpick")
    )).style.background = hex;
    (<HTMLElement>document.querySelector(".colorGWpick")).textContent = hex;
  }
}

let htCon: HTMLConnector;

window.onload = () => {
  htCon = new HTMLConnector();
  htCon.startGame();
};
