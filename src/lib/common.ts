import type { GameMap } from "./types"

/**
 * Carga los datos del mapa de un stage desde su archivo JSON
 * @param stageName - Nombre del stage a cargar (ej: "Stage_1")
 * @returns Promise con los datos del mapa del juego
 * @throws Error si no se puede cargar el archivo del mapa
 */
export async function loadStage(stageName: string): Promise<GameMap> {
  const response = await fetch(`/${stageName}/map.json`)

  if (!response.ok) {
    throw new Error(`No se pudo cargar el stage: ${stageName}`)
  }

  const mapData: GameMap = await response.json()

  mapData.layers.forEach((layer) => {
    layer.tiles.forEach((tile) => {
      const id = Number(tile.id)
      tile.spriteX = id % 8
      tile.spriteY = Math.floor(id / 8)
    })
  })

  return mapData
}
