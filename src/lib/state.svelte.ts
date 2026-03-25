import type { Character, GameState, Stage } from "./types"
import { loadSpritesheet } from "./common"
import Vec2 from "./Vec2"

const ladelbar: Character = {
  spritePath: "rogues/ladelbar",
  name: "Ladelbar",
  position: new Vec2(2, 2),
  initiative: 8,
  traits: [],
  items: [],
}

const krom: Character = {
  spritePath: "rogues/krom",
  name: "Krom",
  position: new Vec2(3, 2),
  initiative: 8,
  traits: [],
  items: [],
}

export const gameState = $state<GameState>({
  stage: null,
  playerIndex: 0,
  currentPlayer: ladelbar,
  initiativeLeft: ladelbar.initiative,
  initiativeRequired: 0,
  openInventory: null,
  cursorPosition: ladelbar.position,
  cursorPath: [],
  players: [ladelbar, krom],
})

export async function loadStage(name: string): Promise<void> {
  const stage: Stage = await loadSpritesheet(name)
  gameState.stage = stage
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]
}
