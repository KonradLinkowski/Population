import { Person } from './person';

export class Tile {
  person: Person = null
  constructor(public x: number, public y: number, public isLand: boolean,
    public getNeighbours: (x: number, y: number, distance: number) => Tile[]
  ) {}
}
