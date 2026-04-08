import type { GameState, Monster, Player } from "./types"
import Vec2 from "./Vec2"
import StageLoader from "./StageLoader"
import { prefabsMap } from "./helpers/items"
import { populateMonsters } from "./helpers/monsters"
import { clearFogAt, createFogPositions } from "./helpers/fog"
import { TURN_PLAYERS } from "./helpers/game"

const ladelbar: Player = {
  isAlive: true,
  sprite: "bandit",
  type: "player",
  name: "Ladelbar",
  position: new Vec2(2, 2),
  offset: new Vec2(0, 0),
  initiativeLeft: 8,
  stats: {
    health: 6,
    totalHealth: 6,
    initiative: 8,
    attack: 3,
    defence: 2,
    damage: 0,
    aim: 0,
  },
  traits: [],
  items: [
    {
      name: "Colgante etéreo",
      desc: "",
      sprite: "crystal pendant",
      metadata: {
        ethereal: true,
      },
    },
  ],
}

const krom: Player = {
  isAlive: true,
  sprite: "farmer (pitchfork)",
  type: "player",
  name: "Krom",
  position: new Vec2(3, 2),
  offset: new Vec2(0, 0),
  initiativeLeft: 8,
  stats: {
    health: 6,
    totalHealth: 6,
    initiative: 8,
    attack: 3,
    defence: 3,
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
  isAlive: true,
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
  initiativeRequired: 0,
  openInventory: null,
  cursorPosition: ladelbar.position,
  cursorPath: [],
  freezePath: false,
  players: [ladelbar, krom],
  monsters: [],
  turn: TURN_PLAYERS,
})

export async function loadStage(stageName: string): Promise<void> {
  const stageLoader = new StageLoader(prefabsMap)
  const stage = await stageLoader.load(stageName)

  gameState.stage = stage
  gameState.fog = createFogPositions(stage)
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]
  gameState.centerActor = gameState.currentPlayer
  gameState.monsters = populateMonsters(gameState)
  gameState.turn = TURN_PLAYERS

  // Clear fog at players positions
  gameState.players.forEach((player) => {
    clearFogAt(player.position)
  })
}
