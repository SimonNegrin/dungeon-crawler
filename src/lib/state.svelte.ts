import type { GameState, Layer, Monster, Player, Stage } from "./types"
import { clearFogAt, createFogPositions, VIEW_DISTANCE } from "./common"
import Vec2 from "./Vec2"
import StageLoader from "./StageLoader"
import { prefabsMap } from "./items"

const ladelbar: Player = {
  sprite: "bandit",
  type: "player",
  name: "Ladelbar",
  position: new Vec2(2, 2),
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

export const gameState = $state<GameState>({
  stage: null,
  fog: [],
  playerIndex: 0,
  currentPlayer: ladelbar,
  initiativeLeft: ladelbar.stats.initiative,
  initiativeRequired: 0,
  openInventory: null,
  cursorPosition: ladelbar.position,
  cursorPath: [],
  freezePath: false,
  players: [ladelbar, krom],
  monsters: [],
})

export async function loadStage(stageName: string): Promise<void> {
  const stageLoader = new StageLoader(prefabsMap)
  const stage = await stageLoader.load(stageName)

  gameState.stage = stage
  gameState.fog = createFogPositions(stage)
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]

  const monstersGenerator = new MonstersGenerator(stage)
  gameState.monsters = monstersGenerator.createMonsters(gameState.players)

  // Clear fog at players positions
  gameState.players.forEach((player) => {
    clearFogAt(player.position)
  })
}

class MonstersGenerator {
  private layersToRemove = ["walls", "doors"]

  constructor(private stage: Stage) {}

  createMonsters(players: Player[]): Monster[] {
    let numMonsters = players.length * 3
    let validPositions = this.getValidPositions(players)
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
    return {
      type: "monster",
      name: "Monster",
      sprite: "goblin brute",
      position: pos,
      items: [],
      traits: [],
      stats: {
        attack: 0,
        defence: 0,
        damage: 0,
        aim: 0,
        initiative: 0,
        health: 0,
        totalHealth: 0,
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
