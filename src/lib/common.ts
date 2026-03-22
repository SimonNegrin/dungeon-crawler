import EasyStar from "easystarjs"
import type {
  Character,
  Grid,
  MapTileAttributes,
  Spritesheet,
  Tile,
} from "./types"
import Vec2 from "./Vec2"
import { gameState } from "./state.svelte"

export const TILE_SIZE = 32
export const TILE_FLOOR = 0
export const TILE_BLOCK = 1

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

  spritesheet.spritesheetUrl = `/${spritesheetName}/spritesheet.png`

  spritesheet.layers.forEach((layer) => {
    layer.tiles = layer.tiles.map((tile: any): Tile<T> => {
      const id = Number(tile.id)
      const spriteX = id % 8
      const spriteY = Math.floor(id / 8)
      return {
        id: tile.id,
        position: new Vec2(tile.x, tile.y),
        sprite: new Vec2(spriteX, spriteY),
        attributes: tile.attributes,
      }
    })
  })
  return spritesheet
}

export function getCharacterPathTo(
  character: Character,
  target: Vec2,
): Promise<Vec2[] | null> {
  return new Promise((resolve) => {
    const grid = createGrid(character)
    if (!grid) {
      return resolve(null)
    }
    const easystar = new EasyStar.js()
    easystar.disableDiagonals()
    easystar.setGrid(grid)
    easystar.setAcceptableTiles(0)
    easystar.findPath(
      character.position.x,
      character.position.y,
      target.x,
      target.y,
      (path) => {
        if (!Array.isArray(path)) {
          return resolve(null)
        }
        resolve(path.map((c) => new Vec2(c.x, c.y)))
      },
    )
    easystar.calculate()
  })
}

export function calcCharacterDistanceBetween(
  character: Character,
  a: Vec2,
  b: Vec2,
): Promise<number | null> {
  return new Promise((resolve) => {
    const grid = createGrid(character)
    if (!grid) {
      return resolve(null)
    }
    const easystar = new EasyStar.js()
    easystar.disableDiagonals()
    easystar.setGrid(grid)
    easystar.setAcceptableTiles(0)
    easystar.findPath(a.x, a.y, b.x, b.y, (path) => {
      if (!Array.isArray(path)) {
        return resolve(null)
      }
      const distance = Math.max(0, path.length - 1)
      resolve(distance)
    })
    easystar.calculate()
  })
}

export function isEthereal(character: Character): boolean {
  if (!character.items) {
    return false
  }
  return character.items.some((item) => {
    return item.ethereal === true
  })
}

export function isInsideGameboard(position: Vec2): boolean {
  if (!gameState.stage) {
    return false
  }
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x < gameState.stage.mapWidth &&
    position.y < gameState.stage.mapHeight
  )
}

export function tileIsFog(position: Vec2): boolean {
  if (!gameState.stage || !isInsideGameboard(position)) {
    return false
  }
  return gameState.stage.layers.some((layer) => {
    if (!layer.name.startsWith("fog")) {
      return false
    }
    return layer.tiles.some((tile) => {
      return tile.position.isSame(position)
    })
  })
}

export async function removeFog(position: Vec2): Promise<void> {
  // First check if we have stage and the point is inside the gameboard
  if (!gameState.stage || !isInsideGameboard(position)) {
    return
  }

  const fogLayers = gameState.stage.layers.filter((layer) => {
    return layer.name.startsWith("fog")
  })

  // Find the adjacent fog layer to the point
  const adjacentFogLayers = fogLayers.filter((layer) => {
    return layer.tiles.some((tile) => {
      return tile.position.isAdjacent(position)
    })
  })

  if (!adjacentFogLayers.length) {
    return
  }

  // If we match two layers it means we can remove al tiles from them
  if (adjacentFogLayers.length === 2) {
    adjacentFogLayers.forEach((layer) => {
      layer.tiles = []
    })
    return
  }

  // We have only one adjacent layer
  const [adjacentFogLayer] = adjacentFogLayers

  // Get all overlaping fog layers with the adjacent one
  // This is because maybe we have to remove fog partially
  // from other layers
  const overlapingFogLayers = fogLayers.filter((layer) => {
    return layer.tiles.some((a) => {
      return adjacentFogLayer.tiles.some((b) => {
        return a.position.isSame(b.position)
      })
    })
  })

  // Remove overlaping tiles from overlaping layers
  overlapingFogLayers.forEach((overlapingLayer) => {
    overlapingLayer.tiles = overlapingLayer.tiles.filter((a) => {
      return !adjacentFogLayer.tiles.some((b) => {
        return a.position.isSame(b.position)
      })
    })
  })

  // Remove all tiles from adjacent layer
  adjacentFogLayer.tiles = []
}

// Creates a ad-hoc grid for the given character
export function createGrid(character: Character): Grid | null {
  if (!gameState.stage) {
    return null
  }

  // Create a grid with the dimensions of the stage with
  // all tiles available to be occupied
  const grid: Grid = []
  for (let y = 0; y < gameState.stage.mapHeight; y++) {
    const line: (typeof TILE_FLOOR)[] = Array(gameState.stage.mapWidth).fill(
      TILE_FLOOR,
    )
    grid.push(line)
  }

  // TODO: Block all tiles occupied by characters

  // If the character is ethereal it can move to any tile
  if (isEthereal(character)) {
    return grid
  }

  // Block all tiles from the collider layers
  gameState.stage.layers.forEach((layer) => {
    if (!layer.collider) return
    layer.tiles.forEach((tile) => {
      if (isOpenDoorTile(tile)) {
        return
      }
      grid[tile.position.y][tile.position.x] = TILE_BLOCK
    })
  })

  return grid
}

function isOpenDoorTile(tile: Tile<MapTileAttributes>): boolean {
  return (tile.attributes?.door && tile.attributes?.isOpen) || false
}
