import { clearFogAt, createFogPositions, TILE_SIZE } from "./common"
import { gameState } from "../../src/lib/state.svelte"
import type { Layer, MapTileAtts, Stage, Tile } from "./types"
import Vec2 from "../../src/lib/Vec2"

interface Position {
  x: number
  y: number
}

interface Rect extends Position {
  w: number
  h: number
}

interface Door extends Position {
  dir: Position
}

interface StageData {
  rects: Rect[]
  doors: Door[]
}

export async function loadStage(stageName: string): Promise<void> {
  const response = await fetch(`/stages/${stageName}.json`)
  const content: StageData = await response.json()

  const adapter = new WatabouDungeonConversor(content)
  const stage = adapter.convert()

  gameState.stage = stage
  gameState.fog = createFogPositions(stage)
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]
  gameState.players.forEach((player) => {
    clearFogAt(player.position)
  })
}

class WatabouDungeonConversor {
  constructor(private data: StageData) {}

  convert(): Stage {
    const { mapWidth, mapHeight } = this.stageSize()
    const floorLayer = this.createFloorLayer()

    return {
      mapWidth,
      mapHeight,
      layers: [floorLayer],
      spritesheetUrl: "",
      tileSize: TILE_SIZE,
    }
  }

  stageSize(): { mapWidth: number; mapHeight: number } {
    let left = Infinity
    let right = -Infinity
    let top = Infinity
    let bottom = -Infinity
    this.data.rects.forEach((rect) => {
      left = Math.min(left, rect.x)
      right = Math.max(right, rect.x)
      top = Math.min(top, rect.y)
      bottom = Math.max(bottom, rect.y)
    })
    return {
      mapWidth: Math.abs(right - left),
      mapHeight: Math.abs(bottom - top),
    }
  }

  createFloorLayer(): Layer<MapTileAtts> {
    const tiles: Tile<MapTileAtts>[] = []

    this.data.rects.forEach((rect) => {
      for (let y = rect.y; y < y + rect.h; y++) {
        for (let x = rect.x; x < x + rect.w; x++) {
          const tile: Tile<MapTileAtts> = {
            id: "",
            position: new Vec2(x, y),
            sprite: new Vec2(0, 0),
            attributes: {},
          }
          tiles.push(tile)
        }
      }
    })

    this.data.doors.forEach((door) => {
      const tile: Tile<MapTileAtts> = {
        id: "",
        position: new Vec2(door.x, door.y),
        sprite: new Vec2(0, 0),
        attributes: {},
      }
      tiles.push(tile)
    })

    const tilesMap = Object.fromEntries(
      tiles.map((tile) => {
        return [tile.position.toString(), tile]
      }),
    )

    return {
      collider: false,
      name: "floor",
      tiles,
      tilesMap,
    }
  }
}
