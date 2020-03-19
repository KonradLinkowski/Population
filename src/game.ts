import Tile from './tile';
import HTMLConnector from './html_connector';
import Person from './person';
import Util from './util';
import Board from './board';

export default class Game {
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
