import type { Character, Item, Stage } from "./types"
import { loadSpritesheet } from "./common"
import Vec2 from "./Vec2"

interface GameState {
  stage: Stage | null
  playerIndex: 0
  currentPlayer: Character
  players: Character[]
}

const colganteEtereo: Item = {
  name: "Colgante etéreo",
  desc: "Trasciende tu cuerpo físico",
  ethereal: true,
}

const player: Character = {
  name: "Ladelbar",
  position: new Vec2(2, 2),
  steps: 8,
  items: [],
}

export const gameState = $state<GameState>({
  stage: null,
  playerIndex: 0,
  currentPlayer: player,
  players: [player],
})

export async function loadStage(name: string): Promise<void> {
  const stage: Stage = await loadSpritesheet(name)
  gameState.stage = stage
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]
}
