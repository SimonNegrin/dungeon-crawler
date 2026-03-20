import type Vec2 from "./Vec2"

export type Grid = (0 | 1)[][]

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
  /** ID del tile en el spritesheet */
  id: string

  //
  spriteX: number
  spriteY: number

  attributes?: TileAttributesType

  /** Posición X en el grid del mapa */
  x: number
  /** Posición Y en el grid del mapa */
  y: number
}

/**
 * Representa una capa del mapa (ej: Collition, Decoration, Floor)
 */
export interface Layer<TileAttributesType> {
  /** Nombre de la capa */
  name: string
  /** Array de tiles que componen esta capa */
  tiles: Tile<TileAttributesType>[]
  /** Indica si esta capa tiene colisiones */
  collider: boolean
}

/**
 * Representa la estructura completa del mapa del juego
 */
export interface Spritesheet<TileAttributesType> {
  spritesheetUrl: string

  /** Tamaño de cada tile en píxeles */
  tileSize: number
  /** Ancho del mapa en número de tiles */
  mapWidth: number
  /** Alto del mapa en número de tiles */
  mapHeight: number
  /** Capas del mapa (se renderizan en orden) */
  layers: Layer<TileAttributesType>[]
}

export type Stage = Spritesheet<MapTileAttributes>
