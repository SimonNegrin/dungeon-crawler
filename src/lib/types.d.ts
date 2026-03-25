import type Vec2 from "./Vec2"

export type Grid = (0 | 1)[][]

export interface Inventory {
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
  cursorPosition: Vec2
  cursorPath: Vec2[]
  players: Character[]
}

export type Character = {
  spritePath: string
  name: string
  position: Vec2
  initiative: number
  traits: Item[]
  items: Item[]
}

export interface Item {
  spriteId: string
  name: string
  desc: string

  // ID of the item
  id: string

  // Enables physical immunity if enabled
  ethereal?: true

  // Enables magic attack if enabled
  magic?: true

  // Number of turns that the item lasts
  turns?: number

  // How many uses can be made before it disapear
  uses?: number

  // If defined, enables distance attack at indicated distance
  // For example, a bow will have a number here
  range?: number

  // Modify the character attack
  attack?: number

  // Modify the character defence
  defence?: number

  // Modify the character damage
  damage?: number

  // Modify the character initiative
  initiative?: number
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
  keyId: string
}

export interface AttsChest {
  type: "chest"
  name: string
  isOpen: boolean
  keyId?: string
  items: Item[]
}

export interface AttsSpawn {
  type: "spawn"
  spawnType: "player" | "npc"
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
