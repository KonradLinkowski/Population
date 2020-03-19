import Util from './util';
import Tile from './tile'
import Game from './game'
import Board from './board'

export default class Person extends Tile {
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
