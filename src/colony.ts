import Board from './board';
import { RGBColor } from './color';
import { Person } from './person';
import { Tile } from './tile';

export class Colony {
  people: Person[] = [];
  dead = false;

  constructor(
    public options: {
    initialSize: number,
    color: RGBColor,
    maxDistance: number
  }) {
    for (let i = 0; i < options.initialSize; i += 1) {
      this.add(new Person(null, this));
    }
  }

  add(person: Person) {
    this.people.push(person)
  }

  kill(person: Person) {
    const index = this.people.indexOf(person)
    this.people.splice(index, 1)
    if (this.people.length === 0) {
      this.dead = true
    }
  }
}
