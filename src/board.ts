import { Tile } from "./tile";
import { RGBColor } from "./color";
import { Colony } from './colony';
import { getDistance, getRandomIntTo } from './utils';

const cache: { [key: string]: Tile[]} = {}

const boardOptionsDefault = {
  landColor: new RGBColor(0, 255, 0),
  waterColor: new RGBColor(0, 0, 255)
}

export type BoardOptions = typeof boardOptionsDefault;

export default class Board {
  private board: Tile[];
  private height: number;
  private width: number;

  constructor(private options: BoardOptions = boardOptionsDefault) {}

  public setImage(imageData: ImageData) {
    this.width = imageData.width
    this.height = imageData.height
    this.board = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      const color = new RGBColor(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2])
      const landColorDistance = color.distance(this.options.landColor)
      const waterColorDistance = color.distance(this.options.waterColor)
      const x = (i / 4) % this.width;
      const y = Math.floor(i / 4 / this.width);
      this.board.push(new Tile(x, y, landColorDistance < waterColorDistance, this.getNeighbours.bind(this)))
    }
  }

  // Check whether x and y are in board's bounds.
  public isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public spawnColonies(colonies: Colony[]): void {
    const landTiles = this.board.filter(tile => tile.isLand)
    for (const colony of colonies) {
      const index = getRandomIntTo(landTiles.length)
      const { x, y } = landTiles[index]
      landTiles.splice(index, 1)
      const neighbours = this.getNeighbours(x, y, colony.options.maxDistance)
      for (const person of colony.people) {
        const neighbourIndex = getRandomIntTo(neighbours.length)
        const neighbour = neighbours[neighbourIndex]
        neighbour.person = person
        neighbour.person.tile = neighbour
        neighbours.splice(neighbourIndex, 1)
      }
    }
  }

  getNeighbours(x: number, y: number, distance: number): Tile[] {
    const key = `${x};${y};${distance}`
    if (key in cache) {
      return [...cache[key]];
    }
    const nei = this.board.filter(tile => tile.isLand && getDistance(tile.x, tile.y, x, y) <= distance)
    cache[key] = nei
    return nei
  }

  getImageData() {
    const array = new Uint8ClampedArray(this.board.flatMap(tile => [
      ...(tile.person ? tile.person.colony.options.color : tile.isLand ? this.options.landColor : this.options.waterColor).toArray()
    ]))
    const imageData = new ImageData(array, this.width)
    return imageData
  }
}
