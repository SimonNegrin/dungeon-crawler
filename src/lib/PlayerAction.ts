import { createAudioPreset, playAudio } from "./audio"
import { getCharacterPathTo, getTileTypeAt, waitTime } from "./common"
import { gameState } from "./state.svelte"

const doorUnlockSound = createAudioPreset("door_unlock", { volume: 0.5 })
const doorLockedSound = createAudioPreset("door_locked", { volume: 0.4 })

export default class PlayerAction {
  async execute(): Promise<void> {
    if (!gameState.stage) {
      return
    }

    // Si el cursor está sobre un cofre y la posición del cofre es adjacente recta
    // al jugador actual se abre el cofre
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
    if (!door.attributes.keyId) {
      door.attributes.isOpen = true
      doorUnlockSound()
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
      doorUnlockSound()
      return true
    }

    // The player can't open the door but we return true
    // to indicate the interaction try
    doorLockedSound()
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
      gameState.currentPlayer.position = step
      await waitTime(200)
      gameState.cursorPath = gameState.cursorPath.slice(1)
    }

    return true
  }
}
