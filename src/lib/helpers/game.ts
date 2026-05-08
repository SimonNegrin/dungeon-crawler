import { nextSound } from "./audio"
import MonstersController from "./MonstersController"
import { gameState } from "../state.svelte"

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
    restorePlayersStats()
  }

  //If next index player we need to find again an alive player
  if (!gameState.players[nextIndex].actor.isAlive) {
    nextIndex = nextAlivePlayerIndex()
  }

  // Check again if there is no players alive
  if (nextIndex === -1) {
    // TODO: Game over
    return
  }

  const player = gameState.players[nextIndex]
  gameState.currentPlayer = player
  gameState.centerActor = player.actor
  gameState.playerIndex = nextIndex
  gameState.cursorPosition = player.actor.position
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
    return player.actor.isAlive && player.isConnected
  })

  if (next === -1) {
    return -1
  }

  return (nextIndex + next) % players.length
}

function restorePlayersStats(): void {
  gameState.players.forEach((player) => {
    player.actor.currentStats.movement = player.actor.totalStats.movement
    player.actor.currentStats.actions = player.actor.totalStats.actions
  })
}
