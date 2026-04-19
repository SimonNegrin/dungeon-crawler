import type { Component } from "svelte"
import type { ItemName } from "./sprites/SpriteItem.svelte"
import type { MonsterSpriteName as MonsterSpriteName } from "./sprites/SpriteMonster.svelte"
import type { RogueName } from "./sprites/SpriteRogue.svelte"
import type Vec2 from "./Vec2"

export type GridValue = 0 | 1
export type Grid = GridValue[][]

export type InventoryType = "chest" | "player" | "enemy"

export interface Inventory {
  type: InventoryType
  sprite: string
  name: string
  items: Item[]
}

export interface Point {
  x: number
  y: number
}

export type Turn = "players" | "monsters"

export interface Hurt {
  damage: number
  position: Vec2
}

interface GameState {
  ignoreInput: boolean
  stage: Stage | null
  hurts: Hurt[]
  fog: Vec2[]
  turn: Turn
  playerIndex: number
  currentPlayer: Player
  centerActor: Actor
  initiativeRequired: number
  openInventory: Inventory | null
  freezePath: boolean
  cursorPosition: Vec2
  cursorPath: Vec2[]
  players: Player[]
  monsters: Monster[]
}

export interface CharacterStats {
  attack: number
  aim: number
  magic: number
  defence: number
  movement: number
  actions: number
  health: number
}

export type SoundFn = () => void

export interface CharacterSounds {
  hurt: SoundFn
  death: SoundFn
}

export interface Character {
  isAlive: boolean
  name: string
  position: Vec2
  offset: Vec2
  sounds: CharacterSounds
  baseStats: CharacterStats
  totalStats: CharacterStats
  currentStats: CharacterStats
  traits: Item[]
  items: Item[]
}

export interface Player extends Character {
  type: "player"
  sprite: RogueName
}

export interface Monster extends Character {
  type: "monster"
  sprite: MonsterSpriteName
}

export type ActorType = "player" | "monster"

export type Actor = Player | Monster

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
  sprite: ItemName
  name: string
  desc: string

  // Modificadores de stats (pueden ser múltiples)
  statModifiers?: StatModifier[]

  // Handlers opcionales para efectos complejos
  effectHandlers?: EffectHandlers

  // Metadata para items especiales
  metadata?: ItemMetadata
}

export interface Point {
  x: number
  y: number
}

export type TileAtts = DoorAtts | ChestAtts | SpawnAtts
export type TileType = "door" | "chest" | "spawn"

export type TileTypeMap = {
  door: DoorAtts
  chest: ChestAtts
  spawn: SpawnAtts
}

export interface DoorAtts {
  type: "door"
  name: string
  isOpen: boolean
  keyName: string
}

export interface ChestAtts {
  type: "chest"
  name: string
  sprite: string
  isOpen: boolean
  keyName: string
  items: Item[]
}

export interface SpawnAtts {
  type: "spawn"
}

/**
 * Representa un tile individual en el mapa
 */
export interface Tile<T extends TileAtts = TileAtts> {
  id: string
  sprite: Vec2
  position: Vec2
  attributes: T
}

/**
 * Representa una capa del mapa (ej: Collition, Decoration, Floor)
 */
export interface Layer {
  name: string
  tiles: Tile[]
  tilesMap: Record<string, Tile>
  collider: boolean
}

/**
 * Representa la estructura completa del mapa del juego
 */
export interface Stage {
  spritesheetUrl: string
  tileSize: number
  mapWidth: number
  mapHeight: number
  layers: Layer[]
}

export interface AttackPlan {
  attacker: Actor
  target: Actor
  path: Vec2[]
}

export interface IProjectile {
  id: Symbol
  from: Actor
  target: Actor
  hits: number
  bullet: Component<{ projectile: IProjectile }>
  resolve: () => void
}

export type ProjectileType = "arrow" | "fireball"
export type ProjectileComponent = Component<{ config: IProjectileConfig }>

export interface IProjectileConfig {
  id: Symbol
  from: Actor
  target: Actor
  type: ProjectileType
}

export interface PlayerConnection {
  playerId: string
  connection: RTCPeerConnection
  channel: RTCDataChannel
}

export interface IPlayerPreset {
  sprite: RogueName
  name: string
  genre: "male" | "female"
  points: number
  movement: number
  actions: number
  attack: number
  defence: number
  aim: number
  magic: number
}
