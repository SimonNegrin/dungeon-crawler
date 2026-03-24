import EasyStar from "easystarjs"
import type {
  Character,
  Grid,
  MapTileAtts,
  Spritesheet,
  Stage,
  Tile,
  TileType,
  TileTypeMap,
} from "./types"
import Vec2 from "./Vec2"
import { gameState } from "./state.svelte"

export const TILE_SIZE = 32
export const TILE_FLOOR = 0
export const TILE_BLOCK = 1

export const INITIATIVE_DOOR = 2
export const INITIATIVE_CHEST = 2
export const INITIATIVE_ATTACK = 2
export const INITIATIVE_STEP = 1

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
        attributes: tile.attributes || {},
      }
    })
  })
  return spritesheet
}

export function getCharacterPathTo(
  stage: Stage,
  character: Character,
  target: Vec2,
): Promise<Vec2[] | null> {
  return new Promise((resolve) => {
    const grid = createGrid(stage, character)
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
  stage: Stage,
  character: Character,
  a: Vec2,
  b: Vec2,
): Promise<number | null> {
  return new Promise((resolve) => {
    const grid = createGrid(stage, character)
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
  const allItems = [...character.traits, ...character.items]
  return allItems.some((item) => {
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
      return tile.position.isEqual(position)
    })
  })
}

export async function removeFog(position: Vec2): Promise<boolean> {
  // First check if we have stage and the point is inside the gameboard
  if (!gameState.stage || !isInsideGameboard(position)) {
    return false
  }

  // Get all fog layers indexes
  const fogLayersIndx: number[] = []
  gameState.stage.layers.forEach((layer, index) => {
    if (layer.name.startsWith("fog")) {
      fogLayersIndx.push(index)
    }
  })

  // Find the adjacent fog layer indexes to the point
  const adjacentFogLayersIndx: number[] = []
  fogLayersIndx.forEach((index) => {
    const layer = gameState.stage!.layers[index]
    const isAdjacent = layer.tiles.some((tile) => {
      return tile.position.isAdjacent(position)
    })
    if (isAdjacent) {
      adjacentFogLayersIndx.push(index)
    }
  })

  if (!adjacentFogLayersIndx.length) {
    return false
  }

  // If we match two layers it means we can remove al tiles from them
  // because the player have visibility of all layers areas
  if (adjacentFogLayersIndx.length === 2) {
    const [a, b] = adjacentFogLayersIndx
    gameState.stage.layers[a].tiles = []
    gameState.stage.layers[b].tiles = []
    return true
  }

  // We have only one adjacent layer
  const [adjacentIdx] = adjacentFogLayersIndx
  const adjacentFogLayer = gameState.stage.layers[adjacentIdx]

  // Remove all fog tiles from other fog layers that overlaps
  // with the adjacent fog layer
  // This is because maybe we have to remove fog partially
  // from other layers
  fogLayersIndx.forEach((fogLayerIdx) => {
    if (fogLayerIdx === adjacentIdx) {
      return
    }
    // Is not the adjacent fog layer
    // Remove the overlaping tiles
    const overlapingIndxs: number[] = []
    const fogTiles = gameState.stage!.layers[fogLayerIdx].tiles
    fogTiles.forEach((tile, index) => {
      adjacentFogLayer.tiles.forEach((t) => {
        if (tile.position.isEqual(t.position)) {
          overlapingIndxs.push(index)
        }
      })
    })

    if (overlapingIndxs.length === 0) {
      return
    }

    gameState.stage!.layers[fogLayerIdx].tiles = fogTiles.filter((_, index) => {
      return !overlapingIndxs.includes(index)
    })
  })

  // Remove all tiles from adjacent layer
  gameState.stage.layers[adjacentIdx].tiles = []

  return true
}

// Creates a ad-hoc grid for the given character
export function createGrid(stage: Stage, character: Character): Grid | null {
  // Create a grid with the dimensions of the stage with
  // all tiles available to be occupied
  const grid: Grid = []
  for (let y = 0; y < stage.mapHeight; y++) {
    const line: (typeof TILE_FLOOR)[] = Array(stage.mapWidth).fill(TILE_FLOOR)
    grid.push(line)
  }

  // Block all tiles occupied by players
  gameState.players.forEach((player) => {
    grid[player.position.y][player.position.x] = TILE_BLOCK
  })

  // TODO: Block all tiles occupied by NPCs

  // If the character is ethereal it can move to any tile
  if (isEthereal(character)) {
    return grid
  }

  // Block all tiles from the collider layers
  stage.layers.forEach((layer) => {
    if (!layer.collider) return
    layer.tiles.forEach((tile) => {
      if (isOpenDoor(tile)) {
        return
      }
      grid[tile.position.y][tile.position.x] = TILE_BLOCK
    })
  })

  return grid
}

export function getTileTypeAt<K extends keyof TileTypeMap>(
  tileType: K,
  position: Vec2,
): Tile<TileTypeMap[K]> | null

export function getTileTypeAt(
  tileType: TileType,
  position: Vec2,
): Tile<MapTileAtts> | null {
  for (const layer of gameState.stage!.layers) {
    for (const tile of layer.tiles) {
      if (
        tile.attributes.type === tileType &&
        tile.position.isEqual(position)
      ) {
        return tile
      }
    }
  }
  return null
}

function isOpenDoor(tile: Tile<MapTileAtts>): boolean {
  return tile.attributes.type === "door" && tile.attributes.isOpen
}

export function waitTime(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function nextPlayerIfExaust(): void {
  // We skip if the current player still have initiative
  if (gameState.initiativeLeft > 0) {
    return
  }
  nextPlayer()
}

export function nextPlayer(): void {
  const index = (gameState.playerIndex + 1) % gameState.players.length
  const player = gameState.players[index]
  gameState.currentPlayer = player
  gameState.playerIndex = index
  gameState.cursorPosition = player.position
  gameState.initiativeLeft = player.initiative
  gameState.openInventory = null
}
