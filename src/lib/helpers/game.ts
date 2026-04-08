import { nextSound } from "./audio"
import MonstersController from "../controllers/MonstersController"
import { gameState } from "../state.svelte"
import { calcStat } from "./common"

export const TURN_PLAYERS = "players"
export const TURN_MONSTERS = "monsters"

export async function nextPlayer(): Promise<void> {
  const index = (gameState.playerIndex + 1) % gameState.players.length

  if (index === 0) {
    gameState.turn = TURN_MONSTERS
    const monstersController = new MonstersController()
    await monstersController.execute()
    restorePlayersInitiative()
  }

  const player = gameState.players[index]
  gameState.currentPlayer = player
  gameState.centerActor = player
  gameState.playerIndex = index
  gameState.cursorPosition = player.position
  gameState.openInventory = null
  gameState.turn = TURN_PLAYERS
  nextSound()
}

function restorePlayersInitiative(): void {
  gameState.players.forEach((player) => {
    player.initiativeLeft = calcStat("initiative", player)
  })
}
