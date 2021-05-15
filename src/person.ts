import { Colony } from './colony';
import { Tile } from './tile';
import { getRandomInt, getRandomIntTo } from './utils';

export class Person {
  age = 0;
  reproductionValue = 0
  reproductiveThreshold = 20
  kc = 0
  constructor(
    public tile: Tile,
    public colony: Colony,
    public vitality = getRandomInt(20, 70)
  ) {}

  // Check whether Person should die.
  public shouldDie(): boolean {
    return this.vitality < this.age;
  }

  // Person move every age.
  public move(): void {
    this.age++;
    this.reproductionValue++;
    const neighbours = this.tile.getNeighbours(this.tile.x, this.tile.y, 1.5)
    const nextTile = neighbours[getRandomIntTo(neighbours.length)];
    if (this.shouldDie()) {
      this.kill();
      return
    }
    if (nextTile.person !== null) {
      if (nextTile.person.colony === this.colony) {
        // todo
        return
      } else if (this.vitality > nextTile.person.vitality) {
        nextTile.person.kill()
        nextTile.person = this
        this.tile.person = null
        this.tile = nextTile
      } else {
        this.kill()
        return
      }
    } else if (nextTile.isLand) {
      this.tile.person = null
      this.tile = nextTile
      nextTile.person = this
    }

    if (this.reproductionValue >= this.reproductiveThreshold) {
      this.reproduce()
      this.reproductionValue = 0
    }
  }

  public reproduce(): void {
    const neighbours = this.tile.getNeighbours(this.tile.x, this.tile.y, 5)
    let tile = null
    while (true) {
      if (!neighbours.length) return
      const index = getRandomIntTo(neighbours.length)
      tile = neighbours[index]
      if (!tile.person) break
      neighbours.splice(index, 1)
    }
    const person = new Person(tile, this.colony, this.vitality + getRandomInt(-5, 5))
    this.colony.add(person)
    tile.person = person
  }

  public kill() {
    this.kc += 1
    this.tile.person = null
    this.tile = null
    this.colony.kill(this)
  }
}
