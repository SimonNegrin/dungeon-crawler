import {
  tiredSound,
  doorUnlockSound,
  doorLockedSound,
  walkSound,
} from "./audio"
import {
  INITIATIVE_CHEST,
  getTileTypeAt,
  INITIATIVE_STEP,
  INITIATIVE_DOOR,
  removeItemByName,
  waitTime,
  STEP_TIME,
  INITIATIVE_ATTACK,
} from "./common"
import { gameState } from "../state.svelte"
import { clearFogAt } from "./fog"
import {
  getActorAtPosition,
  getAdjacentActors,
  getCharacterPathTo,
  isActorAtPositon,
} from "./stage"
import type { Player } from "../types"
import { combat, physicAttack } from "./combat"

export async function currentPlayerAction(): Promise<void> {
  if (await interactPlayer()) {
    return
  }

  if (await interactChest()) {
    return
  }

  if (await interactDoor()) {
    return
  }

  if (await attackMonster()) {
    return
  }

  await playerMove()
}

async function interactPlayer(): Promise<boolean> {
  const player = gameState.players.find((player) => {
    return player.position.isEqual(gameState.cursorPosition)
  })

  if (!player) {
    return false
  }

  if (!gameState.currentPlayer.position.isRectAdjacent(player.position)) {
    return false
  }

  // Check if the player has the initiative needed
  // to interact with a chest
  if (gameState.currentPlayer.initiativeLeft < INITIATIVE_CHEST) {
    tiredSound()
    return true
  }

  gameState.currentPlayer.initiativeLeft -= INITIATIVE_CHEST
  gameState.openInventory = player

  return true
}

async function interactChest(): Promise<boolean> {
  const chest = getTileTypeAt("chest", gameState.cursorPosition)

  if (!chest) {
    return false
  }

  if (!gameState.currentPlayer.position.isRectAdjacent(chest.position)) {
    return false
  }

  // Check if the player has the initiative needed
  // to interact with a chest
  if (gameState.currentPlayer.initiativeLeft < INITIATIVE_CHEST) {
    tiredSound()
    return true
  }

  gameState.currentPlayer.initiativeLeft -= INITIATIVE_CHEST
  gameState.openInventory = chest.attributes

  return true
}

async function interactDoor(): Promise<boolean> {
  const currentPlayer = gameState.currentPlayer

  const door = getTileTypeAt("door", gameState.cursorPosition)

  if (!door) {
    return false
  }

  // If door is open no interation is needed
  if (door.attributes.isOpen) {
    return false
  }

  // To interact is needed to be rect adjacent
  if (!currentPlayer.position.isRectAdjacent(door.position)) {
    return false
  }

  // If the door does not need key we open the door inmediatly
  if (!door.attributes.keyName) {
    if (spendInitiative(currentPlayer, INITIATIVE_STEP)) {
      door.attributes.isOpen = true
      doorUnlockSound()
    } else {
      tiredSound()
    }
    return true
  }

  // To open the door the player needs the key
  const { keyName } = door.attributes
  if (currentPlayer.items.some((item) => item.name === keyName)) {
    if (spendInitiative(currentPlayer, INITIATIVE_DOOR)) {
      // Open the door with key
      door.attributes.isOpen = true
      // Remove key from player inventory
      removeItemByName(currentPlayer, keyName)
      gameState.currentPlayer.initiativeLeft -= INITIATIVE_DOOR
      doorUnlockSound()
    } else {
      tiredSound()
    }
    return true
  }

  // The player can't open the door but we return true
  // to indicate the interaction try
  doorLockedSound()
  return true
}

function spendInitiative(player: Player, initiative: number): boolean {
  if (player.initiativeLeft < initiative) {
    return false
  }
  player.initiativeLeft -= initiative
  return true
}

async function playerMove(): Promise<boolean> {
  if (!gameState.stage) {
    return false
  }

  const player = gameState.currentPlayer

  if (isActorAtPositon(gameState.cursorPosition)) {
    return false
  }

  const path = await getCharacterPathTo(player, gameState.cursorPosition)

  if (!path) {
    return false
  }

  for (const step of path.slice(1)) {
    // Check if the player has the initiative needed to walk
    if (!spendInitiative(player, INITIATIVE_STEP)) {
      tiredSound()
      break
    }

    // If the player current position is rect adjacent to a monster
    // the monster has an oportunity to attack the player
    const adjacentMonsters = getAdjacentActors(player.position, "monster")
    for (const adjacentMonster of adjacentMonsters) {
      await physicAttack(adjacentMonster, player)
      await waitTime(100)
    }

    if (!player.isAlive) {
      break
    }

    player.position = step
    clearFogAt(step)
    await waitTime(STEP_TIME)
    walkSound()
    gameState.cursorPath = gameState.cursorPath.slice(1)
  }

  return true
}

async function attackMonster(): Promise<boolean> {
  const player = gameState.currentPlayer
  const monster = getActorAtPosition(gameState.cursorPosition)

  if (!monster?.isAlive || monster.type !== "monster") {
    return false
  }

  if (!player.position.isRectAdjacent(monster.position)) {
    return false
  }

  if (!spendInitiative(player, INITIATIVE_ATTACK)) {
    tiredSound()
    return false
  }

  await combat(player, monster)
  return true
}
