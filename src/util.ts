import Person from './person';

export default class Util {
  //Random int between min inclusive and max exclusive.
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  //Change rgb int to rgb hexadecimal string.
  static rgb2hex(num: number): string {
    let s: string = "000000" + num.toString(16);
    return "#" + s.substr(s.length - 6);
  }

  static int2hex(num: number): string {
    let s: string = "00" + num.toString(16);
    return s.substr(s.length - 2);
  }

  //Average vitality of Person in colony.
  static average(numbers: Person[]): number {
    let sum: number = 0;
    for (let i: number = 0; i < numbers.length; i++) {
      sum += numbers[i].vitality;
    }
    return sum / numbers.length;
  }

  //Maximum vitality of Person in colony.
  static maxVitality(numbers: Person[]): number {
    let max: number = 0;
    for (let i: number = 0; i < numbers.length; i++) {
      if (numbers[i].vitality > max) {
        max = numbers[i].vitality;
      }
    }
    return max;
  }

  static maxSaturation(imageData: Uint8ClampedArray): Uint8ClampedArray {
    let temp: number;
    for (let i: number = 0; i < imageData.length; i += 4) {
      temp = Math.max(imageData[i], imageData[i + 1], imageData[i + 2]);
      for (let j: number = 0; j < 3; j++) {
        if (imageData[i + j] == temp) {
          imageData[i + j] = 255;
        } else {
          imageData[i + j] = 0;
        }
      }
    }
    return imageData;
  }
}
