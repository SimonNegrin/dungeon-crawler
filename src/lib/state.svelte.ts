import type { Character, GameState, Stage } from "./types"
import { loadSpritesheet } from "./common"
import Vec2 from "./Vec2"

const player: Character = {
  name: "Ladelbar",
  position: new Vec2(2, 2),
  steps: 8,
  traits: [],
  items: [],
}

export const gameState = $state<GameState>({
  stage: null,
  playerIndex: 0,
  currentPlayer: player,
  openInventory: null,
  cursorPosition: player.position,
  cursorPath: [],
  players: [player],
})

export async function loadStage(name: string): Promise<void> {
  const stage: Stage = await loadSpritesheet(name)
  gameState.stage = stage
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]
}
