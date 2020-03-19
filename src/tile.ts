export default class Tile {
  constructor(protected _colour: number) {}

  get colour(): number {
    return this._colour;
  }

  set colour(colour: number) {
    this._colour = colour;
  }
}
