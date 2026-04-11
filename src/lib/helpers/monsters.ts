import { getMonsterSpriteNames } from "../sprites/SpriteMonster.svelte"
import type { Monster, Layer, GameState } from "../types"
import Vec2 from "../Vec2"
import { getRandomFromArray, LAYER_WALLS, VIEW_DISTANCE } from "./common"

const LAYERS_TO_REMOVE = [LAYER_WALLS, "doors"]
const MONSTERS_DENSITY = 0.1

export function populateMonsters(gameState: GameState): Monster[] {
  let validPositions = getValidPositions(gameState)
  let numMonsters = Math.floor(validPositions.length * MONSTERS_DENSITY)
  const monsters: Monster[] = []

  while (numMonsters-- && validPositions.length) {
    const index = Math.floor(validPositions.length * Math.random())
    const [pos] = validPositions.splice(index, 1)
    const monster = createMonster(pos)
    monsters.push(monster)
  }

  return monsters
}

function createMonster(pos: Vec2): Monster {
  const monsterSpriteNames = getMonsterSpriteNames()
  const monsterSprite = getRandomFromArray(monsterSpriteNames)
  return {
    isAlive: true,
    type: "monster",
    name: monsterSprite,
    sprite: monsterSprite,
    position: pos,
    offset: new Vec2(0, 0),
    initiativeLeft: 8,
    items: [],
    traits: [],
    stats: {
      attack: 1,
      defence: 1,
      damage: 1,
      aim: 1,
      initiative: 8,
      health: 2,
      totalHealth: 2,
    },
    baseStats: {
      attack: 0,
      aim: 0,
      magic: 0,
      defence: 0,
      movement: 0,
      actions: 0,
    },
    totalStats: {
      attack: 0,
      aim: 0,
      magic: 0,
      defence: 0,
      movement: 0,
      actions: 0,
    },
    currentStats: {
      attack: 0,
      aim: 0,
      magic: 0,
      defence: 0,
      movement: 0,
      actions: 0,
    },
  }
}

function getValidPositions(gameState: GameState): Vec2[] {
  if (!gameState.stage) {
    return []
  }

  const stage = gameState.stage

  // Get floor positions because at first
  // all floor tiles are proper to allocate an enemy
  let positions = stage.layers
    .find((layer) => layer.name === "floor")!
    .tiles.map((tile) => tile.position)

  LAYERS_TO_REMOVE.forEach((layerName) => {
    positions = filterLayer(
      stage.layers.find((layer) => layer.name === layerName)!,
      positions,
    )
  })

  // Remove positions too near to players
  positions = positions.filter((pos) => {
    return gameState.players.every((player) => {
      const distance = Math.floor(player.position.add(pos).magnitude())
      return distance > VIEW_DISTANCE + 2
    })
  })

  return positions
}

function filterLayer(layer: Layer, positions: Vec2[]): Vec2[] {
  return positions.filter((position) => {
    return layer.tilesMap[position.toString()] === undefined
  })
}
