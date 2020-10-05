import Board from "./board";
import Game from "./game";
import Tile from "./tile";
import Util from "./util";

export default class Person extends Tile {
  private dead = false;
  private diseased = false;

  constructor(
    private game: Game,
    private map: Board,
    private x: number,
    private y: number,
    private age = 0,
    private reproductionValue = 0,
    public colour = 0,
    public vitality = Util.randomInt(20, 70),
    public index = -1
  ) {
    super(colour);
    this.game.colonyPush(this);
  }

  // Check whether Person should die.
  public shouldDie(): boolean {
    return this.vitality < this.age;
  }

  // Make Person ill or well.
  public cripple(chance: boolean): void {
    const howMuch = 2; // I don't remember how big number should it be, but it makes linting problems
    if (Math.random() < 0.5) { return; }
    if (chance && this.diseased) {
      this.vitality *= howMuch;
      this.diseased = false;
      return;
    }
    this.vitality /= howMuch;
    this.diseased = true;
  }

  // Person move every age.
  public move(): void {
    this.age++;
    this.reproductionValue++;
    // this.cripple(true);
    let x;
    let y;
    do {
      x = Util.randomInt(-1, 1);
      y = Util.randomInt(-1, 1);
    } while (
      !this.map.isInBounds(this.x + x, this.y + y) &&
      (x === 0 && y === 0)
    );
    const obj = this.map.getObj(this.x + x, this.y + y);
    const tempColour: number = obj ? obj.colour : this.game.WATER_COLOUR;
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
          this.vitality >=
          (this.map.getObj(this.x + x, this.y + y) as Person).vitality
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

  // Reproduction.
  public reproduce(): void {
    if (this.reproductionValue < this.game.reproductiveThreshold) {
      return;
    }
    this.reproductionValue = 0;
    const variable: number = Util.randomInt(-5, 5);
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
        this.vitality + variable,
      ),
    );
  }

  public kill(): void {
    this.dead = true;
    this.game.colonyRemove(this);
  }
}
