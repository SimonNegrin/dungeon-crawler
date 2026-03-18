export default class Vec2 {
  constructor(
    public x: number,
    public y: number,
  ) {}

  add(vec2: Vec2): Vec2 {
    return new Vec2(this.x + vec2.x, this.y + vec2.y)
  }
}
