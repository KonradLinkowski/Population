import Game from "./game";
import Util from "./util";

export default class HTMLConnector {
  public game: Game;
  public $canvas: HTMLCanvasElement;
  public $statisticsPanel: HTMLElement;
  public $ageLabel: HTMLElement;
  public $fpsLabel: HTMLElement;
  public $mapSelect: HTMLSelectElement;
  public $numberOfColonies: HTMLInputElement;
  public $timeInterval: HTMLInputElement;
  public $reproductiveThreshold: HTMLInputElement;
  public $addMap: HTMLInputElement;
  public $startGame: HTMLButtonElement;
  public $allowGWChanging: HTMLButtonElement;

  public landWaterColours: boolean = false;

  constructor() {
    this.$canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.$statisticsPanel = document.getElementById("test");
    this.$ageLabel = document.querySelector("#age");
    this.$fpsLabel = document.querySelector("#fps");
    this.$mapSelect = document.querySelector("#level_map");
    this.$mapSelect.addEventListener("change", () => {
      this.getPreview();
    });
    this.$numberOfColonies = document.querySelector("#number_of_colonies");
    this.$timeInterval = document.querySelector("#time_interval");
    this.$reproductiveThreshold = document.querySelector(
      "#reproductive_threshold",
    );
    this.$addMap = document.querySelector("#add_map");
    this.$addMap.addEventListener("change", () => {
      this.updateMapList();
    });
    this.$startGame = document.querySelector("#start_game");
    this.$startGame.addEventListener("click", () => {
      this.startGame();
    });

    this.$allowGWChanging = document.querySelector("#allow_gw_colours");
    this.$allowGWChanging.addEventListener("click", () => {
      this.allowGWColourChanging();
    });

    this.getPreview();
  }

  // Start Game.
  public startGame() {
    if (this.game) {
      this.game.stop();
    }
    this.game = new Game(
      this,
      this.$canvas,
      (this.$mapSelect.options[
        this.$mapSelect.selectedIndex
      ] as HTMLOptionElement).value,
      parseInt(this.$numberOfColonies.value, 10),
      parseInt(this.$timeInterval.value, 10),
      parseInt(this.$reproductiveThreshold.value, 10),
    );
  }

  public getPreview(): void {
    const canvas: HTMLCanvasElement = document.querySelector("canvas.preview");
    const image: HTMLImageElement = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
    };
    image.onerror = () => {
      window.alert("loading preview failed");
    };
    image.src = (this.$mapSelect.options[
      this.$mapSelect.selectedIndex
    ] as HTMLOptionElement).value;
  }

  // Update map list after uploading new map.
  public updateMapList(): void {
    this.$mapSelect.innerHTML +=
      '<option value="' +
      window.URL.createObjectURL(this.$addMap.files[0]) +
      '" >' +
      this.$addMap.files[0].name +
      "</option>";
  }

  // Allow grass and water colours changing.
  public allowGWColourChanging(): void {
    const canvas: HTMLCanvasElement = document.querySelector("canvas.preview");
    if (this.landWaterColours) {
      this.landWaterColours = false;
      (document.querySelector(".colorGWPick") as HTMLElement).style.display =
        "none";
      canvas.removeEventListener("mousemove", this.pick);
    } else {
      this.landWaterColours = true;
      (document.querySelector(".colorGWPick") as HTMLElement).style.display =
        "block";
      canvas.addEventListener("mousemove", this.pick);
    }
  }

  // Pick colours.
  public pick(event: MouseEvent): void {
    const x = event.clientX;
    const y = event.clientY;
    const pixel = (event.target as HTMLCanvasElement)
      .getContext("2d")
      .getImageData(x, y, 1, 1);
    const data = pixel.data;
    const hex =
      "#" +
      Util.int2hex(data[0]) +
      Util.int2hex(data[1]) +
      Util.int2hex(data[2]);
    (document.querySelector(
      ".colorGWPick",
    ) as HTMLElement).style.background = hex;
    (document.querySelector(".colorGWPick") as HTMLElement).textContent = hex;
  }
}
