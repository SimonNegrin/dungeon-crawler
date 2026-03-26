import type { Character, GameState, Item, MapTileAtts, Stage } from "./types"
import { loadSpritesheet } from "./common"
import Vec2 from "./Vec2"
import { itemsFactory } from "./items"

const ladelbar: Character = {
  spritePath: "rogues/ladelbar",
  type: "player",
  name: "Ladelbar",
  position: new Vec2(2, 2),
  stats: {
    health: 0,
    totalHealth: 0,
    initiative: 8,
    attack: 0,
    defence: 0,
    damage: 0,
    aim: 0,
  },
  traits: [],
  items: [],
}

const krom: Character = {
  spritePath: "rogues/krom",
  type: "player",
  name: "Krom",
  position: new Vec2(3, 2),
  stats: {
    health: 0,
    totalHealth: 0,
    initiative: 8,
    attack: 0,
    defence: 0,
    damage: 0,
    aim: 0,
  },
  traits: [],
  items: [],
}

export const gameState = $state<GameState>({
  stage: null,
  playerIndex: 0,
  currentPlayer: ladelbar,
  initiativeLeft: ladelbar.stats.initiative,
  initiativeRequired: 0,
  openInventory: null,
  cursorPosition: ladelbar.position,
  cursorPath: [],
  freezePath: false,
  players: [ladelbar, krom],
})

export async function loadStage(name: string): Promise<void> {
  const stage: Stage = await loadSpritesheet<MapTileAtts>(name)

  type Ref = {
    type: string
    id: string
  }

  stage.layers.forEach((layer) => {
    layer.tiles.forEach((tile) => {
      if (tile.attributes.type === "chest") {
        tile.attributes.items = tile.attributes.items.map((item): Item => {
          const ref = item as unknown as Ref
          return itemsFactory[ref.type](ref.id)
        })
      }
    })
  })

  gameState.stage = stage
  gameState.playerIndex = 0
  gameState.currentPlayer = gameState.players[gameState.playerIndex]
}
