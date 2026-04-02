import { MAX_PLAYERS } from "./constants"
import type { Rect, Stage, StageData } from "./types"
import Vec2 from "./Vec2"

export default class StageLoader {
  private data!: StageData
  private offset = new Vec2(0, 0)
  private stage: Stage = {
    width: 0,
    height: 0,
    floor: { tiles: [], map: {} },
    walls: { tiles: [], map: {} },
    doors: { tiles: [], map: {} },
    spawn: { tiles: [], map: {} },
    seen: {},
    fog: [],
  }

  constructor(private stageName: string) {}

  async load(): Promise<Stage> {
    const response = await fetch(`/stages/${this.stageName}.json`)
    this.data = await response.json()

    this.calcSize()
    this.createSpawn()
    this.createFloor()
    this.createWalls()
    this.createDoors()
    this.createFog()

    return this.stage
  }

  private calcSize(): void {
    let left = Infinity
    let right = -Infinity
    let top = Infinity
    let bottom = -Infinity

    this.data.rects.forEach((rect) => {
      left = Math.min(left, rect.x)
      right = Math.max(right, rect.x + rect.w)
      top = Math.min(top, rect.y)
      bottom = Math.max(bottom, rect.y + rect.h)
    })

    // Increase all by one to give room to walls
    left--
    right++
    top--
    bottom++

    this.offset = new Vec2(left * -1, top * -1)
    this.stage.width = right - left
    this.stage.height = bottom - top
  }

  private createSpawn(): void {
    const spawnCandidates = this.data.rects.filter((rect) => {
      const tiles = rect.x * rect.y
      return tiles > MAX_PLAYERS
    })

    const spawnRect =
      spawnCandidates[Math.floor(spawnCandidates.length * Math.random())]

    const spawn = this.rectTiles(spawnRect).slice(0, 6)

    this.stage.spawn = {
      tiles: spawn,
      map: Object.fromEntries(spawn.map((tile) => [tile.toString(), tile])),
    }
  }

  private createFloor(): void {
    const floor = new Map<string, Vec2>()
    this.data.rects.forEach((rect) => {
      this.rectTiles(rect).forEach((tile) => {
        tile = tile.add(this.offset)
        floor.set(tile.toString(), tile)
      })
    })
    this.stage.floor = {
      tiles: [...floor.values()],
      map: Object.fromEntries(floor),
    }
  }

  private createWalls(): void {
    const walls = new Map<string, Vec2>()
    this.data.rects.forEach((rect) => {
      this.rectTiles(rect, 1).forEach((tile) => {
        tile = tile.add(this.offset)
        walls.set(tile.toString(), tile)
      })
    })

    for (const key in this.stage.floor.map) {
      walls.delete(key)
    }

    this.stage.walls = {
      tiles: [...walls.values()],
      map: Object.fromEntries(walls),
    }
  }

  private createDoors(): void {
    const doors = new Map<string, Vec2>()
    this.data.doors.forEach((door) => {
      const position = this.offset.add(new Vec2(door.x, door.y))
      doors.set(position.toString(), position)
    })
    this.stage.doors = {
      tiles: [...doors.values()],
      map: Object.fromEntries(doors),
    }
  }

  private createFog(): void {
    this.stage.fog = [...this.stage.floor.tiles, ...this.stage.walls.tiles]
  }

  private rectTiles(rect: Rect, n = 0): Vec2[] {
    const positions: Vec2[] = []
    for (let y = rect.y - n; y < rect.y + rect.h + n; y++) {
      for (let x = rect.x - n; x < rect.x + rect.w + n; x++) {
        positions.push(new Vec2(x, y))
      }
    }
    return positions
  }
}
