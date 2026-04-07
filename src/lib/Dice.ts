export default class Dice {
  constructor(public readonly faces: number) {}

  roll(): number {
    return 1 + Math.floor(this.faces * Math.random())
  }
}
