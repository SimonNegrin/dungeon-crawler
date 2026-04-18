import type { Subscriber, Writable } from "svelte/store"
import { gameState } from "../state.svelte"
import type {
  Character,
  Actor,
  Inventory,
  Tile,
  TileType,
  TileTypeMap,
  AttackPlan,
  CharacterStats,
  IProjectileConfig,
} from "../types"
import Vec2 from "../Vec2"
import { penClickSound } from "./audio"
import EventBus from "./EventBus"
import { getCharacterPathTo, getAliveActorAtPosition } from "./stage"
import VisionSystem from "./VisionSystem"

export const LAYER_WALLS = "walls"

export const STEP_TIME = 200
export const ATTACK_TIME = 200
export const TIME_AFTER_ATTACK = 300
export const TILE_SIZE = 32
export const TILE_FLOOR = 0
export const TILE_BLOCK = 1
export const VIEW_DISTANCE = 6
export const INVENTORY_SLOTS = 3

export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: "stun:stun.relay.metered.ca:80",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "a0240ef79f4aab6adcbcd492",
    credential: "sivvkdvgYch7X1z4",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "a0240ef79f4aab6adcbcd492",
    credential: "sivvkdvgYch7X1z4",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "a0240ef79f4aab6adcbcd492",
    credential: "sivvkdvgYch7X1z4",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "a0240ef79f4aab6adcbcd492",
    credential: "sivvkdvgYch7X1z4",
  },
]

// Size of the game map in tiles
// Set a odd number to be able to keep centered
// the player sprite
export const VIEWPORT_SIZE = 13

// Shoot and magic distance
export const SHOOT_DISTANCE = 6

export const events = {
  shoot: new EventBus<IProjectileConfig>(),
  shootCompleted: new EventBus<IProjectileConfig>(),
}

export function getRandomFromArray<T>(items: T[]): T {
  const index = Math.floor(items.length * Math.random())
  return items[index]
}

export function createDice(faces: number): () => number {
  return () => {
    return 1 + Math.floor(faces * Math.random())
  }
}

export async function killActor(actor: Actor): Promise<void> {
  actor.isAlive = false
  actor.sounds.death()
  await waitTime(1000)
}

export function createVisionSystem(): VisionSystem {
  if (!gameState.stage) {
    throw new Error("VisionSystem can't be created if there is no stage")
  }

  const visionSystem = new VisionSystem(
    gameState.stage!.mapWidth,
    gameState.stage!.mapHeight,
    VIEW_DISTANCE,
  )

  const walls = gameState.stage.layers.find((layer) => {
    return layer.name === LAYER_WALLS
  })

  if (walls) {
    walls.tiles.forEach((tile) => {
      visionSystem.addWall(tile.position)
    })
  }

  return visionSystem
}

export function getTileTypeAt<K extends TileType>(
  tileType: K,
  position: Vec2,
): Tile<TileTypeMap[K]> | null

export function getTileTypeAt(tileType: TileType, position: Vec2): Tile | null {
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

export function waitTime(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function isEthereal(character: Character): boolean {
  return [...character.traits, ...character.items].some((item) => {
    return item.metadata?.ethereal === true
  })
}

export function removeItemByName(character: Character, itemName: string): void {
  character.items = character.items.filter((item) => {
    return item.name !== itemName
  })
}

export function moveInventoryItem(
  index: number,
  from: Inventory,
  to: Inventory,
): void {
  if (to.items.length >= INVENTORY_SLOTS) {
    return
  }
  const [item] = from.items.splice(index, 1)
  to.items.push(item)
  penClickSound()
}

export async function createAttackPlan(
  attacker: Actor,
  target: Actor,
): Promise<AttackPlan | undefined> {
  if (!target.isAlive) {
    return
  }

  let path = await getCharacterPathTo(attacker, target.position)

  if (!path) {
    return
  }

  // Remove the first and the last steps because they are
  // the current positions of the attacker and the target
  path = path.slice(1, -1)

  // Check if the target is too far
  if (path.length > attacker.currentStats.movement) {
    return
  }

  // The last step is rect adjacent to the
  // target position and is the place that will occupy the attacker
  // but is posible that this positon is occupied by an ethereal character
  // because is posible to move through them, so we need
  // to check if there is sombebody in this position
  if (path.length > 0 && getAliveActorAtPosition(path.at(-1)!)) {
    return
  }

  return { attacker, target, path }
}

export function setBaseStat(
  stat: keyof CharacterStats,
  value: number,
  ...characters: Character[]
): void {
  characters.forEach((character) => {
    character.baseStats[stat] = value
    character.totalStats[stat] = value
    character.currentStats[stat] = value
  })
}

export function createStateMachine<T extends Record<string, (keyof T)[]>>(
  state: keyof T,
  machine: T,
): Writable<keyof T> {
  const subscribers = new Set<Subscriber<keyof T>>()

  const set = (newState: keyof T) => {
    // If state not change return
    if (newState === state) {
      console.warn(
        `Invalid state machine chage from "${String(state)}" to "${String(newState)}"`,
      )
      return
    }

    // Check if the machine allow the state change
    if (!machine[state].includes(newState)) {
      console.warn(
        `Invalid state machine chage from "${String(state)}" to "${String(newState)}"`,
      )
      return
    }

    // Change status
    state = newState
    subscribers.forEach((subscriber) => subscriber(state))
  }

  const subscribe = (subscriber: Subscriber<keyof T>) => {
    subscribers.add(subscriber)
    subscriber(state)
    return () => subscribers.delete(subscriber)
  }

  const update = (updater: (state: keyof T) => keyof T) => {
    set(updater(state))
  }

  return {
    set,
    subscribe,
    update,
  }
}
