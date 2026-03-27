export default class Vec2 {
  constructor(
    public x: number,
    public y: number,
  ) {}

  toString(): string {
    return `${this.x},${this.y}`
  }

  up(): Vec2 {
    return new Vec2(this.x, this.y - 1)
  }

  add(vec2: Vec2): Vec2 {
    return new Vec2(this.x + vec2.x, this.y + vec2.y)
  }

  magnitude(): number {
    return Math.hypot(this.x, this.y)
  }

  angle(): number {
    return Math.atan2(this.y, this.x)
  }

  isEqual(vec2: Vec2): boolean {
    return this.x === vec2.x && this.y === vec2.y
  }

  isAdjacent(vec2: Vec2): boolean {
    const xdist = Math.abs(this.x - vec2.x)
    const ydist = Math.abs(this.y - vec2.y)
    return xdist <= 1 && ydist <= 1
  }

  isRectAdjacent(vec2: Vec2): boolean {
    const xdist = Math.abs(this.x - vec2.x)
    const ydist = Math.abs(this.y - vec2.y)
    return (xdist === 1 && ydist === 0) || (xdist === 0 && ydist === 1)
  }
}
