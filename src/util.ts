import Person from "./person";
import { HSLColor } from "./hsl_color";

const ONE_SIXTH = 1 / 6;
const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;

export default class Util {
  // Random int between min inclusive and max exclusive.
  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Change rgb int to rgb hexadecimal string.
  public static rgb2hex(num: number): string {
    const s: string = "000000" + num.toString(16);
    return "#" + s.substr(s.length - 6);
  }

  public static int2hex(num: number): string {
    const s: string = "00" + num.toString(16);
    return s.substr(s.length - 2);
  }

  // Average vitality of Person in colony.
  public static average(persons: Person[]): number {
    let sum = 0;
    let count = 0;
    for (const person of persons) {
      if (person !== null) {
        count++;
        sum += person.vitality;
      }
    }
    return sum / count;
  }

  // Maximum vitality of Person in colony.
  public static maxVitality(persons: Person[]): number {
    let max = 0;
    for (const person of persons) {
      if (person !== null && person.vitality > max) {
        max = person.vitality;
      }
    }
    return max;
  }

  public static maxSaturation(imageData: Uint8ClampedArray): Uint8ClampedArray {
    let temp: number;
    for (let i: number = 0; i < imageData.length; i += 4) {
      temp = Math.max(imageData[i], imageData[i + 1], imageData[i + 2]);
      for (let j: number = 0; j < 3; j++) {
        if (imageData[i + j] === temp) {
          imageData[i + j] = 255;
        } else {
          imageData[i + j] = 0;
        }
      }
    }
    return imageData;
  }

  private static hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < ONE_SIXTH) {
      return p + (q - p) * 6 * t;
    }
    if (t < 0.5) {
      return q;
    }
    if (t < TWO_THIRDS) {
      return p + (q - p) * (TWO_THIRDS - t) * 6;
    }
    return p;
  }

  public static hsl2rgb(col: HSLColor): number[] {
    const [h, s, l] = col;
    if (s === 0) {
      return [l, l, l];
    }
    const q = l < 0.5 ? l * s + l : l + s - l * s;
    const p = 2 * l - q;
    return [
      this.hue2rgb(p, q, h + ONE_THIRD),
      this.hue2rgb(p, q, h),
      this.hue2rgb(p, q, h - ONE_THIRD),
    ];
  }

  public static rgb2hsl(r: number, g: number, b: number): HSLColor {
    (r /= 255), (g /= 255), (b /= 255);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = (max + min) / 2;
    let s = (max + min) / 2;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return new HSLColor(h, s, l);
  }
}
