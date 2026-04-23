import { getMonsterSpriteNames } from "../sprites/SpriteMonster.svelte"
import type { IMonster, Layer, IGlobalState } from "../types"
import Vec2 from "../Vec2"
import { monsterHurtRandomSound } from "./audio"
import {
  getRandomFromArray,
  LAYER_WALLS,
  setBaseStat,
  VIEW_DISTANCE,
} from "./common"

const LAYERS_TO_REMOVE = [LAYER_WALLS, "doors"]
const MONSTERS_DENSITY = 0.1

export function populateMonsters(gameState: IGlobalState): IMonster[] {
  let validPositions = getValidPositions(gameState)
  let numMonsters = Math.floor(validPositions.length * MONSTERS_DENSITY)
  const monsters: IMonster[] = []

  while (numMonsters-- && validPositions.length) {
    const index = Math.floor(validPositions.length * Math.random())
    const [pos] = validPositions.splice(index, 1)
    const monster = createMonster(pos)
    monsters.push(monster)
  }

  return monsters
}

function createMonster(pos: Vec2): IMonster {
  const monsterSpriteNames = getMonsterSpriteNames()
  const monsterSprite = getRandomFromArray(monsterSpriteNames)
  const monster: IMonster = {
    id: crypto.randomUUID(),
    isAlive: true,
    type: "monster",
    name: monsterSprite,
    sprite: monsterSprite,
    position: pos,
    offset: new Vec2(0, 0),
    items: [],
    traits: [],
    sounds: {
      hurt: monsterHurtRandomSound,
      death: monsterHurtRandomSound,
    },
    baseStats: {
      attack: 0,
      aim: 0,
      magic: 0,
      defence: 0,
      movement: 0,
      actions: 0,
      health: 0,
    },
    totalStats: {
      attack: 0,
      aim: 0,
      magic: 0,
      defence: 0,
      movement: 0,
      actions: 0,
      health: 0,
    },
    currentStats: {
      attack: 0,
      aim: 0,
      magic: 0,
      defence: 0,
      movement: 0,
      actions: 0,
      health: 0,
    },
  }

  setBaseStat("actions", 2, monster)
  setBaseStat("movement", 8, monster)
  setBaseStat("attack", 2, monster)
  setBaseStat("defence", 2, monster)
  setBaseStat("aim", 0, monster)
  setBaseStat("magic", 0, monster)
  setBaseStat("health", 2, monster)

  return monster
}

function getValidPositions(gameState: IGlobalState): Vec2[] {
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
