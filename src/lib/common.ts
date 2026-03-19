import EasyStar from "easystarjs"
import type { Spritesheet } from "./types"
import type Vec2 from "./Vec2"
import { grid } from "./state"
import { get } from "svelte/store"

/**
 * Carga los datos del mapa de un stage desde su archivo JSON
 * @param spritesheetName - Nombre del stage a cargar (ej: "Stage_1")
 * @returns Promise con los datos del mapa del juego
 * @throws Error si no se puede cargar el archivo del mapa
 */
export async function loadSpritesheet<T>(
  spritesheetName: string,
): Promise<Spritesheet<T>> {
  const response = await fetch(`/${spritesheetName}/map.json`)

  if (!response.ok) {
    throw new Error(`No se pudo cargar el stage: ${spritesheetName}`)
  }

  const spritesheet: Spritesheet<T> = await response.json()

  spritesheet.layers.forEach((layer) => {
    layer.tiles.forEach((tile) => {
      const id = Number(tile.id)
      tile.spriteX = id % 8
      tile.spriteY = Math.floor(id / 8)
    })
  })
  return spritesheet
}

export function calcDistanceBetween(a: Vec2, b: Vec2): Promise<number> {
  return new Promise((resolve) => {
    const currentGrid = get(grid)
    if (!currentGrid) {
      return resolve(0)
    }
    const easystar = new EasyStar.js()
    easystar.disableDiagonals()
    easystar.setGrid(currentGrid)
    easystar.setAcceptableTiles([0])
    easystar.findPath(a.x, a.y, b.x, b.y, (path) => {
      const distance = Math.max(0, path.length - 1)
      resolve(distance)
    })
    easystar.calculate()
  })
}

export function canWalkToPosition(position: Vec2): boolean {
  const currentGrid = get(grid)
  return currentGrid?.[position.y]?.[position.x] === 0
}
