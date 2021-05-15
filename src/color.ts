export class RGBColor {
  constructor(public r: number, public g: number, public b: number) {}

  distance(color: RGBColor): number {
    return Math.sqrt(
      Math.pow(this.r - color.r, 2)
      + Math.pow(this.g - color.g, 2)
      + Math.pow(this.b - color.b, 2)
    )
  }

  toHex(): string {
    const r = this.r.toString(16).padStart(2, '0')
    const g = this.g.toString(16).padStart(2, '0')
    const b = this.b.toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }

  toArray(): [number, number, number, number] {
    return [this.r, this.g, this.b, 255]
  }
}
