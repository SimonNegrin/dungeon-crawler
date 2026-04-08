import { nextSound } from "./audio"
import MonstersController from "../controllers/MonstersController"
import { gameState } from "../state.svelte"
import { calcStat } from "./common"

export const TURN_PLAYERS = "players"
export const TURN_MONSTERS = "monsters"

export async function nextPlayer(): Promise<void> {
  let nextIndex = nextAlivePlayerIndex()

  // Check if there is no players alive
  if (nextIndex === -1) {
    // TODO: Game over
    return
  }

  if (nextIndex <= gameState.playerIndex) {
    gameState.turn = TURN_MONSTERS
    const monstersController = new MonstersController()
    await monstersController.execute()
    restorePlayersInitiative()
  }

  //If next index player we need to find again an alive player
  if (!gameState.players[nextIndex].isAlive) {
    nextIndex = nextAlivePlayerIndex()
  }

  // Check again if there is no players alive
  if (nextIndex === -1) {
    // TODO: Game over
    return
  }

  const player = gameState.players[nextIndex]
  gameState.currentPlayer = player
  gameState.centerActor = player
  gameState.playerIndex = nextIndex
  gameState.cursorPosition = player.position
  gameState.openInventory = null
  gameState.turn = TURN_PLAYERS
  nextSound()
}

function nextAlivePlayerIndex(): number {
  const players = gameState.players
  const nextIndex = gameState.playerIndex + 1

  const priorized = [
    ...players.slice(nextIndex),
    ...players.slice(0, nextIndex),
  ]

  const next = priorized.findIndex((player) => {
    return player.isAlive
  })

  if (next === -1) {
    return -1
  }

  return (nextIndex + next) % players.length
}

function restorePlayersInitiative(): void {
  gameState.players.forEach((player) => {
    player.initiativeLeft = calcStat("initiative", player)
  })
}
