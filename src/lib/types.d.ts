import type { ItemName } from "./Item.svelte"
import type { TileName } from "./Tile.svelte"
import type Vec2 from "./Vec2"

export type GridValue = 0 | 1
export type Grid = GridValue[][]

export type InventoryType = "chest" | "player" | "enemy"

export interface Inventory {
  type: InventoryType
  spritePath: string
  name: string
  items: Item[]
}

export interface Position {
  x: number
  y: number
}

interface GameState {
  stage: Stage
  fog: Vec2[]
  playerIndex: number
  currentPlayer: Character
  initiativeLeft: number
  initiativeRequired: number
  openInventory: Inventory | null
  freezePath: boolean
  cursorPosition: Vec2
  cursorPath: Vec2[]
  players: Character[]
}

export interface Character {
  type: "player" | "enemy"
  spritePath: string
  name: string
  position: Vec2
  stats: Record<StatType, number>
  traits: Item[]
  items: Item[]
}

export type StatType =
  | "attack"
  | "defence"
  | "damage"
  | "aim"
  | "initiative"
  | "health"
  | "totalHealth"

export interface StatModifier {
  stat: StatType
  value: number
}

export interface EffectHandlers {
  onEquip?: EffectHandler
  onUnequip?: EffectHandler
  onUse?: EffectHandler
}

export type EffectHandler = (character: Character, item: Item) => Promise<void>

export interface ItemMetadata {
  uses?: number // para consumibles
  turns?: number // para efectos temporales
  range?: number // para armas a distancia
  ethereal?: boolean // inmunidad física
  magic?: boolean // ataque mágico
}

export interface Item {
  spriteName: ItemName
  name: string
  desc: string

  // Modificadores de stats (pueden ser múltiples)
  statModifiers?: StatModifier[]

  // Handlers opcionales para efectos complejos
  effectHandlers?: EffectHandlers

  // Metadata para items especiales
  metadata?: ItemMetadata
}

export interface Position {
  x: number
  y: number
}

export type MapTileAtts = AttsDoor | AttsChest | AttsSpawn
export type TileType = "door" | "chest" | "spawn"

type TileTypeMap = {
  door: AttsDoor
  chest: AttsChest
  spawn: AttsSpawn
}

export interface AttsDoor {
  type: "door"
  name: string
  isOpen: boolean
  keyName: string
}

export interface AttsChest {
  type: "chest"
  name: string
  spritePath: string
  isOpen: boolean
  keyName: string
  items: Item[]
}

export interface AttsSpawn {}

export interface AttsPlayerSpawn {
  type: "spawn"
  spawnType: "player"
}

export interface AttsEnemySpawn {
  type: "spawn"
  spawnType: "enemy"
  enemyName: string
}

interface BaseTile {
  position: Position
  name: TileName
}

export interface FloorTile extends BaseTile {}

/**
 * Representa un tile individual en el mapa
 */
export interface MapTile {
  position: Position
  attributes: TileAtts
}

/**
 * Representa una capa del mapa (ej: Collition, Decoration, Floor)
 */
export interface Layer {
  name: string
  tiles: Tile<TileAtts>[]
  tilesMap: Record<string, Tile<TileAtts>>
  collider: boolean
}

export interface Surface {
  tiles: Vec2[]
  map: Record<string, Vec2>
}

export interface Stage {
  width: number
  height: number
  floor: Surface
  walls: Surface
  doors: Surface
  spawn: Surface
  seen: Record<string, Vec2>
  fog: Vec2[]
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface StageData {
  rects: Rect[]
  doors: Position[]
}
