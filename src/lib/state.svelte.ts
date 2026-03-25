import type { Character, GameState, Stage } from "./types"
import { createCharacter, loadSpritesheet } from "./common"
import Vec2 from "./Vec2"

const ladelbar: Character = createCharacter({
  spritePath: "rogues/ladelbar",
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
  items: [],
})

// const krom: Character = {
//   spritePath: "rogues/krom",
//   name: "Krom",
//   position: new Vec2(3, 2),
//   initiative: 8,
//   totalHealth: 8,
//   health: 8,
//   attack: 2,
//   damage: 1,
//   defence: 3,
//   baseStats: {},
//   traits: [],
//   items: [],
// }

export const gameState = $state<GameState>({
  stage: null,
  playerIndex: 0,
  currentPlayer: ladelbar,
  initiativeLeft: ladelbar.stats.initiative,
  initiativeRequired: 0,
  openInventory: null,
  cursorPosition: ladelbar.position,
  cursorPath: [],
  freezePath: false,
  players: [ladelbar],
})

export async function loadStage(name: string): Promise<void> {
  const stage: Stage = await loadSpritesheet(name)
  gameState.stage = stage
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]
}
