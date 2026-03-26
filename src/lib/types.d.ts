import type Vec2 from "./Vec2"

export type Grid = (0 | 1)[][]

export type InventoryType = "chest" | "player" | "enemy"

export interface Inventory {
  type: InventoryType
  name: string
  items: Item[]
}

export interface Position {
  x: number
  y: number
}

interface GameState {
  stage: Stage | null
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
  spriteId: string
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
  isOpen: boolean
  keyName: string
  items: Item[]
}

export interface AttsPlayerSpawn {
  type: "spawn"
  spawnType: "player"
}

export interface AttsEnemySpawn {
  type: "spawn"
  spawnType: "enemy"
  enemyName: string
}

/**
 * Representa un tile individual en el mapa
 */
export interface Tile<TileAtts> {
  id: string
  sprite: Vec2
  position: Vec2
  attributes: TileAtts
}

/**
 * Representa una capa del mapa (ej: Collition, Decoration, Floor)
 */
export interface Layer<TileAtts> {
  name: string
  tiles: Tile<TileAtts>[]
  collider: boolean
}

/**
 * Representa la estructura completa del mapa del juego
 */
export interface Spritesheet<TileAtts> {
  spritesheetUrl: string
  tileSize: number
  mapWidth: number
  mapHeight: number
  layers: Layer<TileAtts>[]
}

export type Stage = Spritesheet<MapTileAtts>
