import Board from "./board";
import HTMLConnector from "./html_connector";
import Person from "./person";
import Tile from "./tile";
import Util from "./util";

export default class Game {
  public ageCount = 0;
  public colours = [
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
    "#0000ff",
  ];
  public coloniesColours: number = this.colours.length - 2;
  public colonies: Person[][] = [];

  public coloniesNumber: number;

  public GRASS_COLOUR = this.colours.length - 2;
  public WATER_COLOUR = this.colours.length - 1;

  public GRASS_TILE: Tile;
  public WATER_TILE: Tile;

  public reproductiveThreshold: number;

  public intervalPointer: number;

  public htmlConnector: HTMLConnector;
  public image = new Image();
  public map: Board;
  public canvas: HTMLCanvasElement;

  public coloniesLabels: NodeListOf<HTMLSpanElement>;

  public peopleCount = 0;

  public speed: number;

  public lastTime: number;

  public timer = 0;

  constructor(
    htmlConnector: HTMLConnector,
    canvas: HTMLCanvasElement,
    image: string,
    coloniesNumber: number,
    speed: number,
    reproductiveThreshold: number,
    allowGWColours: boolean = false,
    grassColour = "",
    waterColour = "",
  ) {
    this.htmlConnector = htmlConnector;
    this.canvas = canvas;
    this.speed = speed;
    this.coloniesNumber = coloniesNumber;
    this.GRASS_TILE = new Tile(this.GRASS_COLOUR);
    this.WATER_TILE = new Tile(this.WATER_COLOUR);
    this.reproductiveThreshold = reproductiveThreshold;
    this.image.onload = () => {
      this.setup();
    };
    this.image.onerror = () => {
      window.alert("loading failed");
    };
    this.image.src = image;
  }

  public setup(): void {
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
      this.coloniesNumber,
    );
    this.intervalPointer = setInterval(this.play.bind(this), this.speed);
    this.htmlConnector.$statisticsPanel.innerHTML = "";
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      this.htmlConnector.$statisticsPanel.innerHTML +=
        '<span style="color:' + this.colours[i] + '"></span><br>';
    }
    this.coloniesLabels = this.htmlConnector.$statisticsPanel.querySelectorAll(
      "span",
    );
  }

  public play(): void {
    this.lastTime = Date.now();
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      if (this.colonies[i] === null) {
        continue;
      }
      for (const person of this.colonies[i]) {
        if (person !== null) {
          person.move();
        }
      }
      if (this.colonies[i].length === 0) {
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
    for (let i: number = 0; i < this.coloniesNumber; i++) {
      if (this.colonies[i] === null) {
        continue;
      }
      this.colonies[i] = this.colonies[i].filter(person => person !== null);
      this.colonies[i].forEach((person, index) => {
        person.index = index;
      });
    }
    this.map.redraw();
    this.htmlConnector.$ageLabel.innerHTML = "Age: " + this.ageCount++;
    this.timer += Date.now() - this.lastTime;
    if (this.timer > 250) {
      this.htmlConnector.$fpsLabel.innerHTML =
        "FPS: " + (1000 / (Date.now() - this.lastTime)).toFixed(0);
      this.timer = 0;
    }
  }

  public getColour(index: number): string {
    return this.colours[index];
  }

  public colonyPush(obj: Person): void {
    obj.index = this.colonies[obj.colour].length;
    this.colonies[obj.colour].push(obj);
    this.peopleCount++;
  }

  public colonyRemove(obj: Person): void {
    this.colonies[obj.colour][obj.index] = null;
    this.peopleCount--;
  }

  public stop(): void {
    clearInterval(this.intervalPointer);
  }
}
