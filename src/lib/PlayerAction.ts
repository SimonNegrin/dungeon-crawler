import { createAudioPreset, playAudio } from "./audio"
import {
  getCharacterPathTo,
  getTileTypeAt,
  INITIATIVE_CHEST,
  INITIATIVE_DOOR,
  INITIATIVE_STEP,
  nextPlayerIfExaust,
  waitTime,
} from "./common"
import { gameState } from "./state.svelte"

const doorUnlockSound = createAudioPreset("door_unlock", { volume: 0.5 })
const doorLockedSound = createAudioPreset("door_locked", { volume: 0.4 })

export default class PlayerAction {
  async execute(): Promise<void> {
    if (!gameState.stage) {
      return
    }
    await this.doAction()
  }

  private async doAction(): Promise<void> {
    if (await this.interactChest()) {
      return
    }

    if (await this.interactDoor()) {
      return
    }

    await this.playerMove()
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
      // TODO: Sound of exaust
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

    // Check if the player has the initiative needed
    // to interact with a door
    if (gameState.initiativeLeft < INITIATIVE_DOOR) {
      // TODO: Sound of exaust
      return true
    }

    // If the door does not need key we open the door inmediatly
    if (!door.attributes.keyId) {
      door.attributes.isOpen = true
      gameState.initiativeLeft -= INITIATIVE_STEP
      doorUnlockSound()
      nextPlayerIfExaust()
      return true
    }

    // To open the door the player needs the key
    const player = gameState.currentPlayer
    const keyId = door.attributes.keyId
    if (player.items.some((item) => item.id === keyId)) {
      // Open the door with key
      door.attributes.isOpen = true
      // Remove key from player inventory
      player.items = player.items.filter((item) => item.id !== keyId)
      gameState.initiativeLeft -= INITIATIVE_DOOR
      doorUnlockSound()
      nextPlayerIfExaust()
      return true
    }

    // The player can't open the door but we return true
    // to indicate the interaction try
    gameState.initiativeLeft -= INITIATIVE_STEP
    doorLockedSound()
    nextPlayerIfExaust()
    return true
  }

  private async playerMove(): Promise<boolean> {
    const path = await getCharacterPathTo(
      gameState.stage!,
      gameState.currentPlayer,
      gameState.cursorPosition,
    )

    if (!path) {
      return false
    }

    for (const step of path.slice(1)) {
      // Check if the player has the initiative needed to walk
      if (gameState.initiativeLeft < INITIATIVE_STEP) {
        // TODO: Sound of exaust
        nextPlayerIfExaust()
        return true
      }
      gameState.initiativeLeft--
      gameState.currentPlayer.position = step
      await waitTime(200)
      gameState.cursorPath = gameState.cursorPath.slice(1)
    }

    return true
  }
}
