//Utilities
class Util {
  //Random int between min inclusive and max exclusive.
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  //Change rgb int to rgb hexadecimal string.
  static rgb2hex(num: number): string {
    let s: string = "000000" + num.toString(16);
    return "#" + s.substr(s.length - 6);
  }

  static int2hex(num: number): string {
    let s: string = "00" + num.toString(16);
    return s.substr(s.length - 2);
  }

  //Average vitality of Person in colony.
  static average(numbers: Person[]): number {
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

  static maxSaturation(imageData: Uint8ClampedArray): Uint8ClampedArray {
    let temp: number;
    for (let i: number = 0; i < imageData.length; i += 4) {
      temp = Math.max(imageData[i], imageData[i + 1], imageData[i + 2]);
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
  private context: CanvasRenderingContext2D;
  private map: (Tile)[][];
  private height: number;
  private width: number;
  private coloniesNumber: number;
  private game: Game;

  constructor(game: Game, canvas: HTMLCanvasElement, coloniesNumber: number) {
    this.coloniesNumber = coloniesNumber;
    this.game = game;
    this.canvas = canvas;
    this.height = canvas.height;
    this.width = canvas.width;
    this.context = canvas.getContext("2d");
    let imageData = this.context.getImageData(0, 0, this.width, this.height)
      .data;

    this.map = [];
    for (let i = 0; i < this.width; i++) {
      this.map[i] = [];
    }
    for (let i = 0; i < imageData.length; i += 4) {
      let color: string =
        "#" +
        Util.int2hex(imageData[i]) +
        Util.int2hex(imageData[i + 1]) +
        Util.int2hex(imageData[i + 2]);
      if (color == this.game.getColour(this.game.GRASS_COLOUR)) {
        let x = (i / 4) % this.width;
        let y = Math.floor(i / 4 / this.width);
        this.map[x][y] = this.game.GRASS_TILE;
      }
      if (color == this.game.getColour(this.game.WATER_COLOUR)) {
        let x = (i / 4) % this.width;
        let y = Math.floor(i / 4 / this.width);
        this.map[x][y] = this.game.WATER_TILE;
      }
    }
    console.log("map size", this.width, this.height);
    this.createColonies();
  }

  //Check whether x and y are in board's bounds.
  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
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
    (this.map[x][y] as Person).kill();
    this.setObj(x, y, killer);
  }

  //Create colonies.
  createColonies(): void {
    let x,
      y,
      offset = 10,
      x2,
      y2,
      test;
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      while (true) {
        x = Util.randomInt(0, this.width - 1);
        y = Util.randomInt(0, this.height - 1);
        if (this.map[x][y].colour == this.game.GRASS_COLOUR) {
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
          if (this.map[x2][y2].colour == this.game.GRASS_COLOUR) {
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
  constructor(protected _colour: number) {}

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
  private dead = false;
  private age: number;
  private reproductionValue: number;
  private diseased = false;
  private _vitality: number;
  private map: Board;
  private game: Game;

  constructor(
    game: Game,
    map: Board,
    x: number,
    y: number,
    age = 0,
    reproductionValue = 0,
    colour = 0,
    vitality = Util.randomInt(20, 70)
  ) {
    super(colour);
    this.game = game;
    this.age = age;
    this.x = x;
    this.y = y;
    this.reproductionValue = reproductionValue;
    this._vitality = vitality;
    this.map = map;
    this.game.colonyPush(this);
  }

  //Check whether Person should die.
  shouldDie(): boolean {
    return this._vitality < this.age;
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
        if (
          this._vitality >=
          (this.map.getObj(this.x + x, this.y + y) as Person)._vitality
        ) {
          this.map.setObj(this.x, this.y, this.game.GRASS_TILE);
          this.reproduce();
          this.x += x;
          this.y += y;
          this.map.killPerson(this.x, this.y, this);
        } else {
          this.map.setObj(this.x, this.y, this.game.GRASS_TILE);
          this.kill();
        }
        break;
    }
    if (this.shouldDie()) {
      this.map.setObj(this.x, this.y, this.game.GRASS_TILE);
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
  ageCount = 0;
  colours = [
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
  coloniesColours: number = this.colours.length - 2;
  colonies: Person[][] = [];

  coloniesNumber: number;

  GRASS_COLOUR = this.colours.length - 2;
  WATER_COLOUR = this.colours.length - 1;

  GRASS_TILE: Tile;
  WATER_TILE: Tile;

  reproductiveThreshold: number;

  intervalPointer: number;

  htmlConnector: HTMLConnector;
  image = new Image();
  map: Board;
  canvas: HTMLCanvasElement;

  coloniesLabels: NodeListOf<HTMLSpanElement>;

  peopleCount = 0;

  speed: number;

  lastTime: number;

  timer = 0;

  constructor(
    htmlConnector: HTMLConnector,
    canvas: HTMLCanvasElement,
    image: string,
    coloniesNumber: number,
    speed: number,
    reproductive_threshold: number,
    allowGWColours: boolean = false,
    grassColour = "",
    waterColour = ""
  ) {
    this.htmlConnector = htmlConnector;
    this.canvas = canvas;
    this.speed = speed;
    this.coloniesNumber = coloniesNumber;
    this.GRASS_TILE = new Tile(this.GRASS_COLOUR);
    this.WATER_TILE = new Tile(this.WATER_COLOUR);
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
      this.canvas as HTMLCanvasElement,
      this.coloniesNumber
    );
    this.intervalPointer = setInterval(this.play.bind(this), this.speed);
    this.htmlConnector.h_statisticsPanel.innerHTML = "";
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      this.htmlConnector.h_statisticsPanel.innerHTML +=
        '<span style="color:' + this.colours[i] + '"></span><br/>';
    }
    this.coloniesLabels = this.htmlConnector.h_statisticsPanel.querySelectorAll(
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
    this.h_canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.h_statisticsPanel = document.getElementById("test");
    this.h_ageLabel = document.querySelector("#age");
    this.h_fpsLabel = document.querySelector("#fps");
    this.h_mapSelect = document.querySelector("#level_map");
    this.h_number_of_colonies = document.querySelector("#number_of_colonies");
    this.h_time_interval = document.querySelector("#time_interval");
    this.h_reproductive_threshold = document.querySelector(
      "#reproductive_threshold"
    );
    this.h_add_map = document.querySelector("#add_map");
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
      (this.h_mapSelect.options[
        this.h_mapSelect.selectedIndex
      ] as HTMLOptionElement).value,
      parseInt(this.h_number_of_colonies.value),
      parseInt(this.h_time_interval.value),
      parseInt(this.h_reproductive_threshold.value)
    );
  }

  getPreview(): void {
    let canvas: HTMLCanvasElement = document.querySelector("canvas.preview");
    let image: HTMLImageElement = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
    };
    image.onerror = () => {
      window.alert("loading preview failed");
    };
    image.src = (this.h_mapSelect.options[
      this.h_mapSelect.selectedIndex
    ] as HTMLOptionElement).value;
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
    let canvas: HTMLCanvasElement = document.querySelector("canvas.preview");
    if (this.land_water_colours) {
      this.land_water_colours = false;
      (document.querySelector(".colorGWPick") as HTMLElement).style.display =
        "none";
      canvas.removeEventListener("mousemove", this.pick);
    } else {
      this.land_water_colours = true;
      (document.querySelector(".colorGWPick") as HTMLElement).style.display =
        "block";
      canvas.addEventListener("mousemove", this.pick);
    }
  }

  //Pick colours.
  pick(event: MouseEvent): void {
    let x = event.clientX;
    let y = event.clientY;
    let pixel = (event.target as HTMLCanvasElement)
      .getContext("2d")
      .getImageData(x, y, 1, 1);
    let data = pixel.data;
    let hex =
      "#" +
      Util.int2hex(data[0]) +
      Util.int2hex(data[1]) +
      Util.int2hex(data[2]);
    (document.querySelector(
      ".colorGWPick"
    ) as HTMLElement).style.background = hex;
    (document.querySelector(".colorGWPick") as HTMLElement).textContent = hex;
  }
}

let htCon: HTMLConnector;

window.onload = () => {
  htCon = new HTMLConnector();
  htCon.startGame();
};
