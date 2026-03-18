export interface TileAttributes {
  door?: boolean
  spawn?: boolean
}

/**
 * Representa un tile individual en el mapa
 */
export interface MapTile {
  /** ID del tile en el spritesheet */
  id: string

  //
  spriteX: number
  spriteY: number

  attributes?: TileAttributes

  /** Posición X en el grid del mapa */
  x: number
  /** Posición Y en el grid del mapa */
  y: number
}

/**
 * Representa una capa del mapa (ej: Collition, Decoration, Floor)
 */
export interface MapLayer {
  /** Nombre de la capa */
  name: string
  /** Array de tiles que componen esta capa */
  tiles: MapTile[]
  /** Indica si esta capa tiene colisiones */
  collider: boolean
}

/**
 * Representa la estructura completa del mapa del juego
 */
export interface GameMap {
  /** Tamaño de cada tile en píxeles */
  tileSize: number
  /** Ancho del mapa en número de tiles */
  mapWidth: number
  /** Alto del mapa en número de tiles */
  mapHeight: number
  /** Capas del mapa (se renderizan en orden) */
  layers: MapLayer[]
}
