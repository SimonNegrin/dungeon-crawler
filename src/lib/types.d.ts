import type Vec2 from "./Vec2"

export type Grid = (0 | 1)[][]

export interface Position {
  x: number
  y: number
}

export type Character = {
  name: string
  steps: number
  position: Vec2
  items?: Item[]
}

export interface Item {
  name: string
  desc: string
  ethereal?: true
  magic?: true
  lifetime?: number
  attack?: number
  attackDistance?: number
  defence?: number
  damage?: number
}

export interface Position {
  x: number
  y: number
}

export interface MapTileAttributes {
  door?: boolean
  keyId?: string
  isOpen?: true
  spawn?: boolean
}

export interface RogueTileAttributes {
  name: string
  kind: string
}

/**
 * Representa un tile individual en el mapa
 */
export interface Tile<TileAttributesType> {
  id: string

  attributes?: TileAttributesType

  sprite: Vec2
  position: Vec2
}

/**
 * Representa una capa del mapa (ej: Collition, Decoration, Floor)
 */
export interface Layer<TileAttributesType> {
  name: string
  tiles: Tile<TileAttributesType>[]
  collider: boolean
}

/**
 * Representa la estructura completa del mapa del juego
 */
export interface Spritesheet<TileAttributesType> {
  spritesheetUrl: string
  tileSize: number
  mapWidth: number
  mapHeight: number
  layers: Layer<TileAttributesType>[]
}

export type Stage = Spritesheet<MapTileAttributes>
