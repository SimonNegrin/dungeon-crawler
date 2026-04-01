import Vec2 from "../../src/lib/Vec2"

export default class VisionSystem {
  private walls = new Set<string>() // Almacena posiciones de paredes como "x,y"

  constructor(
    private mapWidth: number,
    private mapHeight: number,
    private visionDistance: number,
  ) {}

  // Agregar una pared
  addWall(position: Vec2): void {
    this.walls.add(position.toString())
  }

  // Verificar si una celda es pared
  isWall(position: Vec2): boolean {
    return this.walls.has(position.toString())
  }

  // Algoritmo principal de visión
  getVisibleTiles(position: Vec2): Map<string, Vec2> {
    const visible = new Map<string, Vec2>()

    // Añadir la posición del jugador siempre visible
    visible.set(position.toString(), position)

    // Ray casting en todas las direcciones
    const radius = this.visionDistance

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const targetX = position.x + dx
        const targetY = position.y + dy

        // Verificar límites del mapa
        if (
          targetX < 0 ||
          targetX >= this.mapWidth ||
          targetY < 0 ||
          targetY >= this.mapHeight
        ) {
          continue
        }

        // Verificar distancia
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > this.visionDistance) continue

        // Trazar línea desde el jugador hasta el objetivo
        if (this.hasLineOfSight(position.x, position.y, targetX, targetY)) {
          const coords = new Vec2(targetX, targetY)
          visible.set(coords.toString(), coords)
        }
      }
    }

    return visible
  }

  // Algoritmo de línea de visión usando Bresenham
  hasLineOfSight(x0: number, y0: number, x1: number, y1: number): boolean {
    let dx = Math.abs(x1 - x0)
    let dy = Math.abs(y1 - y0)
    let sx = x0 < x1 ? 1 : -1
    let sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    let x = x0
    let y = y0

    while (!(x === x1 && y === y1)) {
      // Si encontramos una pared (excepto el origen), no hay línea de visión
      if ((x !== x0 || y !== y0) && this.isWall(new Vec2(x, y))) {
        return false
      }

      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }

    return true
  }
}
