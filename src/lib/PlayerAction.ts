import { getCharacterPathTo, isInventory, waitTime } from "./common"
import type { GameState, Inventory, MapTileAtts, Tile } from "./types"
import type Vec2 from "./Vec2"

export default class PlayerAction {
  constructor(public gameState: GameState) {}

  async execute(): Promise<void> {
    if (!this.gameState.stage) {
      return
    }
    // Si el cursor está sobre un cofre y la posición del cofre es adjacente recta
    // al jugador actual se abre el cofre
    if (await this.openChest()) {
      return
    }

    await this.move()
  }

  private async move(): Promise<boolean> {
    const path = await getCharacterPathTo(
      this.gameState.stage!,
      this.gameState.currentPlayer,
      this.gameState.cursorPosition,
    )

    if (!path) {
      return false
    }

    for (const step of path.slice(1)) {
      this.gameState.currentPlayer.position = step
      await waitTime(200)
      this.gameState.cursorPath = this.gameState.cursorPath.slice(1)
    }

    return true
  }

  private async openChest(): Promise<boolean> {
    let inventoryTile = this.getTileWithInventory(this.gameState.cursorPosition)
    if (!inventoryTile) {
      return false
    }

    if (
      !this.gameState.currentPlayer.position.isRectAdjacent(
        this.gameState.cursorPosition,
      )
    ) {
      return false
    }

    this.gameState.openInventory = inventoryTile.attributes as Inventory

    return true
  }

  private getTileWithInventory(position: Vec2): Tile<MapTileAtts> | null {
    for (const layer of this.gameState.stage!.layers) {
      for (const tile of layer.tiles) {
        if (position.isEqual(tile.position) && isInventory(tile.attributes)) {
          return tile
        }
      }
    }
    return null
  }
}
