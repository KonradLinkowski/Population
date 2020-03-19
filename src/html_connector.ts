import Util from './util';
import Game from './game';

export default class HTMLConnector {
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
