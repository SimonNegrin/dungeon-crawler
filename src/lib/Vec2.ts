export default class Vec2 {
  constructor(
    public x: number,
    public y: number,
  ) {}

  add(vec2: Vec2): Vec2 {
    return new Vec2(this.x + vec2.x, this.y + vec2.y)
  }

  isSame(vec2: Vec2): boolean {
    return this.x === vec2.x && this.y === vec2.y
  }

  isAdjacent(vec2: Vec2): boolean {
    const xdist = Math.abs(this.x - vec2.x)
    const ydist = Math.abs(this.y - vec2.y)
    return xdist <= 1 && ydist <= 1
  }
}
