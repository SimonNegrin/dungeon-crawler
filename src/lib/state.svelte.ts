import type { GameState, Layer, Monster, Player, Stage } from "./types"
import {
  calcStat,
  clearFogAt,
  createFogPositions,
  VIEW_DISTANCE,
} from "./common"
import Vec2 from "./Vec2"
import StageLoader from "./StageLoader"
import { prefabsMap } from "./items"
import {
  getMonsterSpriteNames,
  type MonsterSpriteName,
} from "./sprites/SpriteMonster.svelte"
import { nextSound } from "./audio"
import MonstersController from "./MonstersController"

const ladelbar: Player = {
  sprite: "bandit",
  type: "player",
  name: "Ladelbar",
  position: new Vec2(2, 2),
  offset: new Vec2(0, 0),
  initiativeLeft: 8,
  stats: {
    health: 0,
    totalHealth: 0,
    initiative: 8,
    attack: 0,
    defence: 0,
    damage: 0,
    aim: 0,
  },
  traits: [],
  items: [
    // {
    //   name: "Colgante etéreo",
    //   desc: "",
    //   sprite: "crystal pendant",
    //   metadata: {
    //     ethereal: true,
    //   },
    // },
  ],
}

const krom: Player = {
  sprite: "farmer (pitchfork)",
  type: "player",
  name: "Krom",
  position: new Vec2(3, 2),
  offset: new Vec2(0, 0),
  initiativeLeft: 8,
  stats: {
    health: 0,
    totalHealth: 0,
    initiative: 8,
    attack: 0,
    defence: 0,
    damage: 0,
    aim: 0,
  },
  traits: [],
  items: [],
}

export const debug = $state({
  showCoords: false,
})

const orc: Monster = {
  type: "monster",
  sprite: "orc",
  name: "Orc",
  position: new Vec2(5, 6),
  offset: new Vec2(0, 0),
  initiativeLeft: 0,
  stats: {
    attack: 0,
    defence: 0,
    damage: 0,
    aim: 0,
    initiative: 8,
    health: 0,
    totalHealth: 0,
  },
  traits: [],
  items: [],
}

export const gameState = $state<GameState>({
  stage: null,
  fog: [],
  playerIndex: 0,
  currentPlayer: ladelbar,
  centerActor: ladelbar,
  initiativeLeft: ladelbar.stats.initiative,
  initiativeRequired: 0,
  openInventory: null,
  cursorPosition: ladelbar.position,
  cursorPath: [],
  freezePath: false,
  players: [ladelbar, krom],
  monsters: [],
  turn: "players",
})

export async function loadStage(stageName: string): Promise<void> {
  const stageLoader = new StageLoader(prefabsMap)
  const stage = await stageLoader.load(stageName)

  gameState.stage = stage
  gameState.fog = createFogPositions(stage)
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]

  const monstersGenerator = new MonstersGenerator(
    stage,
    getMonsterSpriteNames(),
  )
  gameState.monsters = monstersGenerator.createMonsters(gameState.players)

  // Clear fog at players positions
  gameState.players.forEach((player) => {
    clearFogAt(player.position)
  })
}

export async function nextPlayer(): Promise<void> {
  const index = (gameState.playerIndex + 1) % gameState.players.length

  if (index === 0) {
    const monstersController = new MonstersController()
    await monstersController.execute()
  }

  const player = gameState.players[index]
  gameState.currentPlayer = player
  gameState.centerActor = player
  gameState.playerIndex = index
  gameState.cursorPosition = player.position
  gameState.initiativeLeft = calcStat("initiative", player)
  gameState.openInventory = null
  nextSound()
}

class MonstersGenerator {
  private layersToRemove = ["walls", "doors"]

  private monstersDensity = 0.1

  constructor(
    private stage: Stage,
    private monsterSpriteNames: MonsterSpriteName[],
  ) {}

  createMonsters(players: Player[]): Monster[] {
    let validPositions = this.getValidPositions(players)
    let numMonsters = Math.floor(validPositions.length * this.monstersDensity)
    const monsters: Monster[] = []

    while (numMonsters-- && validPositions.length) {
      const index = Math.floor(validPositions.length * Math.random())
      const [pos] = validPositions.splice(index, 1)
      const monster = this.createMonster(pos)
      monsters.push(monster)
    }

    return monsters
  }

  private createMonster(pos: Vec2): Monster {
    const monsterSprite =
      this.monsterSpriteNames[
        Math.floor(this.monsterSpriteNames.length * Math.random())
      ]
    return {
      type: "monster",
      name: "Monster",
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
    }
  }

  private getValidPositions(players: Player[]): Vec2[] {
    // Get floor positions because at first
    // all floor tiles are proper to allocate an enemy
    let positions = this.stage.layers
      .find((layer) => layer.name === "floor")!
      .tiles.map((tile) => tile.position)

    this.layersToRemove.forEach((layerName) => {
      positions = this.filterLayer(
        this.stage.layers.find((layer) => layer.name === layerName)!,
        positions,
      )
    })

    // Remove positions too near to players
    positions = positions.filter((pos) => {
      return players.every((player) => {
        const distance = Math.floor(player.position.add(pos).magnitude())
        return distance > VIEW_DISTANCE + 2
      })
    })

    return positions
  }

  private filterLayer(layer: Layer, positions: Vec2[]): Vec2[] {
    return positions.filter((position) => {
      return layer.tilesMap[position.toString()] === undefined
    })
  }
}
