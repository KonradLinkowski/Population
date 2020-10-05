import Person from "./person";

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
}
