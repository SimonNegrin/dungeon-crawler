import type { GameState, Player } from "./types"
import Vec2 from "./Vec2"
import StageLoader from "./helpers/StageLoader"
import { prefabsMap } from "./helpers/items"
import { populateMonsters } from "./helpers/monsters"
import { clearFogAt, createFogPositions } from "./helpers/fog"
import { TURN_PLAYERS } from "./helpers/game"
import { setBaseStat } from "./helpers/common"

const ladelbar: Player = {
  isAlive: true,
  sprite: "bandit",
  type: "player",
  name: "Ladelbar",
  position: new Vec2(2, 2),
  offset: new Vec2(0, 0),
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

  traits: [],
  items: [],
}

const trancos: Player = {
  isAlive: true,
  sprite: "male fighter",
  type: "player",
  name: "Trancos",
  position: new Vec2(3, 3),
  offset: new Vec2(0, 0),
  traits: [],
  items: [],
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

const legolas: Player = {
  isAlive: true,
  sprite: "ranger",
  type: "player",
  name: "Legolas",
  position: new Vec2(4, 3),
  offset: new Vec2(0, 0),
  traits: [],
  items: [],
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

setBaseStat("actions", 2, trancos, legolas, ladelbar, krom)
setBaseStat("movement", 8, trancos, legolas, ladelbar, krom)
setBaseStat("attack", 2, trancos, legolas, ladelbar, krom)
setBaseStat("defence", 2, trancos, legolas, ladelbar, krom)
setBaseStat("aim", 2, trancos, legolas, ladelbar, krom)
setBaseStat("magic", 2, trancos, legolas, ladelbar, krom)
setBaseStat("health", 8, trancos, legolas, ladelbar, krom)

export const debug = $state({
  showCoords: false,
  showHealth: false,
})

export const gameState = $state<GameState>({
  ignoreInput: false,
  stage: null,
  hurts: [],
  fog: [],
  playerIndex: 0,
  currentPlayer: ladelbar,
  centerActor: ladelbar,
  initiativeRequired: 0,
  openInventory: null,
  cursorPosition: ladelbar.position,
  cursorPath: [],
  freezePath: false,
  players: [trancos, legolas, ladelbar, krom],
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
  gameState.cursorPosition = gameState.players[0].position

  // Clear fog at players positions
  gameState.players.forEach((player) => {
    clearFogAt(player.position)
  })
}
