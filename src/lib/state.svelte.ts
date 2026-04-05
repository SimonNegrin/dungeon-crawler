import type { Character, GameState, Monster, Player, Stage } from "./types"
import { clearFogAt, createFogPositions } from "./common"
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
  gameState.monsters = createMonsters(stage)

  gameState.players.forEach((player) => {
    clearFogAt(player.position)
  })
}

export function createMonsters(stage: Stage): Monster[] {
  return []
}
