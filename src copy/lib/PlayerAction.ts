import {
  doorLockedSound,
  doorUnlockSound,
  fogClearSound,
  tiredSound,
} from "../../src/lib/audio"
import {
  clearFogAt,
  getCharacterPathTo,
  getTileTypeAt,
  INITIATIVE_CHEST,
  INITIATIVE_DOOR,
  INITIATIVE_STEP,
  removeItemByName,
  spendInitiative,
  waitTime,
} from "./common"
import { gameState } from "../../src/lib/state.svelte"

export default class PlayerAction {
  async execute(): Promise<void> {
    if (!gameState.stage) {
      return
    }
    await this.doAction()
  }

  private async doAction(): Promise<void> {
    if (await this.interactPlayer()) {
      return
    }

    if (await this.interactChest()) {
      return
    }

    if (await this.interactDoor()) {
      return
    }

    await this.playerMove()
  }

  private async interactPlayer(): Promise<boolean> {
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
    if (gameState.initiativeLeft < INITIATIVE_CHEST) {
      tiredSound()
      return true
    }

    gameState.initiativeLeft -= INITIATIVE_CHEST
    gameState.openInventory = player

    return true
  }

  private async interactChest(): Promise<boolean> {
    const chest = getTileTypeAt("chest", gameState.cursorPosition)

    if (!chest) {
      return false
    }

    if (!gameState.currentPlayer.position.isRectAdjacent(chest.position)) {
      return false
    }

    // Check if the player has the initiative needed
    // to interact with a chest
    if (gameState.initiativeLeft < INITIATIVE_CHEST) {
      tiredSound()
      return true
    }

    gameState.initiativeLeft -= INITIATIVE_CHEST
    gameState.openInventory = chest.attributes

    return true
  }

  private async interactDoor(): Promise<boolean> {
    const door = getTileTypeAt("door", gameState.cursorPosition)

    if (!door) {
      return false
    }

    // If door is open no interation is needed
    if (door.attributes.isOpen) {
      return false
    }

    // To interact is needed to be rect adjacent
    if (!gameState.currentPlayer.position.isRectAdjacent(door.position)) {
      return false
    }

    // If the door does not need key we open the door inmediatly
    if (!door.attributes.keyName) {
      if (spendInitiative(INITIATIVE_STEP)) {
        door.attributes.isOpen = true
        doorUnlockSound()
      } else {
        tiredSound()
      }
      return true
    }

    // To open the door the player needs the key
    const player = gameState.currentPlayer
    const { keyName } = door.attributes
    if (player.items.some((item) => item.name === keyName)) {
      if (spendInitiative(INITIATIVE_DOOR)) {
        // Open the door with key
        door.attributes.isOpen = true
        // Remove key from player inventory
        removeItemByName(player, keyName)
        gameState.initiativeLeft -= INITIATIVE_DOOR
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

  private async playerMove(): Promise<boolean> {
    const path = await getCharacterPathTo(
      gameState.currentPlayer,
      gameState.cursorPosition,
    )

    if (!path) {
      return false
    }

    for (const step of path.slice(1)) {
      // Check if the player has the initiative needed to walk
      if (gameState.initiativeLeft < INITIATIVE_STEP) {
        tiredSound()
        break
      }
      gameState.currentPlayer.position = step
      clearFogAt(step)
      await waitTime(200)
      gameState.cursorPath = gameState.cursorPath.slice(1)
      gameState.initiativeLeft--
    }

    return true
  }
}
