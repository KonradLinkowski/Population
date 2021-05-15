import { Colony } from './colony';
import { RGBColor } from './color';
import { Tile } from './tile';

export class GUI {
  private timer = 0;
  private maxTime = 250;
  private lastTime = 0;

  private $canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private $fpsLabel: HTMLElement;
  private $mapSelect: HTMLSelectElement;

  constructor() {
    this.$canvas = document.querySelector('#canvas')
    this.ctx = this.$canvas.getContext('2d')
    this.$fpsLabel = document.querySelector("#fps");
    this.$mapSelect = document.querySelector("#level_map");
  }

  draw(imageData: ImageData) {
    this.ctx.putImageData(imageData, 0, 0)
  }

  updateData({ colonies }: any) {
    this.drawTable(colonies)
    this.updateFPS()
  }

  getMapPath() {
    const selectedImage = this.$mapSelect.options[this.$mapSelect.selectedIndex]
    return selectedImage.value
  }

  private updateFPS() {
    const now = Date.now()
    this.timer += now - this.lastTime;
    if (this.timer > this.maxTime) {
      this.$fpsLabel.textContent = (1000 / (Date.now() - this.lastTime)).toFixed(0);
      this.timer = 0;
    }
    this.lastTime = now
  }

  private drawTable(colonies: Colony) {
    // let tableBody = "";
    // for (let i = 0; i < this.coloniesNumber; i++) {
    //   tableBody += `<tr class="colony-table__row colony-table__accent" data-team-color="${this.colours[i]}"></tr>`;
    // }

    // this.htmlConnector.$statisticsPanel.innerHTML = `<table class="colony-table">
    // <thead>
    //   <tr>
    //     <td></td>
    //     <td>Colony</td>
    //     <td>Population</td>
    //     <td>Avg Vit</td>
    //     <td>Max Vit</td>
    //   </tr>
    // </thead>
    // ${tableBody}
    // </table>`;
    // this.coloniesLabels = this.htmlConnector.$statisticsPanel.querySelectorAll(
    //   ".colony-table__row"
    // );

    // this.coloniesLabels[i].innerHTML = `
    //   <td class="colony-table__team" style="background-color:${this.coloniesLabels[
    //     i
    //   ].getAttribute("data-team-color")}"></td>
    //   <td>${i + 1}</td>
    //   <td>${this.colonies[i].length}</td>
    //   <td>${Util.average(this.colonies[i]).toFixed(2)}</td>
    //   <td>${Util.maxVitality(this.colonies[i]).toFixed(2)}</td>`;
  }
}
