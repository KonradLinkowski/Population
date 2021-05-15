import Board from "./board";
import { Colony } from "./colony";
import { RGBColor } from './color';
import { GUI } from './gui';

export class Game {
  public iterations = 0;
  public colors: RGBColor[] = [
    new RGBColor(255, 0, 0),
    new RGBColor(255, 255, 0),
    new RGBColor(255, 0, 255),
    new RGBColor(0, 255, 0),
    new RGBColor(0, 255, 255),
    new RGBColor(0, 0, 255),
    new RGBColor(128, 64, 64),
    new RGBColor(64, 64, 128),
    new RGBColor(0, 0, 0),
    new RGBColor(64, 128, 64)
  ];
  public colonies: Colony[] = [];
  public intervalPointer: number;
  public paused: boolean = false;

  private board: Board;

  constructor(
    private gui: GUI,
    private options: {
      coloniesNumber: number,
      speed: number,
      reproductiveThreshold: number,
    }
  ) {
    for (let i: number = 0; i < options.coloniesNumber; i++) {
      this.colonies.push(new Colony({
        initialSize: 50,
        maxDistance: 10,
        color: this.colors[i]
      }))
    }

    this.board = new Board()
  }

  public setMap(imageData: ImageData) {
    this.board.setImage(imageData)
    this.board.spawnColonies(this.colonies)
  }

  public start() {
    this.intervalPointer = setInterval(this.update.bind(this), this.options.speed);
    requestAnimationFrame(this.render.bind(this))
  }

  private render(): void {
    this.gui.updateData({
      colonies: this.colonies
    })
    this.gui.draw(this.board.getImageData());
    requestAnimationFrame(this.render.bind(this))
  }

  private update(): void {
    // console.time('update')
    for (const colony of this.colonies) {
      // console.log(colony.people.length)
      if (colony.dead) {
        continue;
      }
      for (const person of colony.people) {
        person.move();
      }
    }

    // console.timeEnd('update')
  }

  public stop(): void {
    clearInterval(this.intervalPointer);
  }

  public pause(): void {
    this.paused = true;
    this.stop();
  }

  public unpause(): void {
    this.paused = false;
    this.intervalPointer = setInterval(this.update.bind(this), this.options.speed);
  }
}
