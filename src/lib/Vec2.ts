export default class Vec2 {
  constructor(
    public x: number,
    public y: number,
  ) {}

  toString(): string {
    return `${this.x},${this.y}`
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y)
  }

  up(): Vec2 {
    return new Vec2(this.x, this.y - 1)
  }

  add(vec2: Vec2): Vec2 {
    return new Vec2(this.x + vec2.x, this.y + vec2.y)
  }

  sub(vec2: Vec2): Vec2 {
    return new Vec2(this.x - vec2.x, this.y - vec2.y)
  }

  distanceTo(vec2: Vec2): number {
    return Math.hypot(Math.abs(this.x - vec2.x), Math.abs(this.y - vec2.y))
  }

  multiply(factor: number): Vec2 {
    return new Vec2(this.x * factor, this.y * factor)
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

  isUp(pos: Vec2): boolean {
    const up = this.add(new Vec2(0, -1))
    return up.isEqual(pos)
  }

  isDown(pos: Vec2): boolean {
    const down = this.add(new Vec2(0, 1))
    return down.isEqual(pos)
  }

  isLeft(pos: Vec2): boolean {
    const left = this.add(new Vec2(-1, 0))
    return left.isEqual(pos)
  }

  isRight(pos: Vec2): boolean {
    const right = this.add(new Vec2(1, 0))
    return right.isEqual(pos)
  }
}
