import type { Character, GameState } from "./types"
import Vec2 from "./Vec2"

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
  items: [
    // {
    //   name: "Colgante etéreo",
    //   desc: "",
    //   spriteId: "crystal_necklace",
    //   metadata: {
    //     ethereal: true,
    //   },
    // },
  ],
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

export const debug = $state({
  showCoords: false,
})

export const gameState = $state<GameState>({
  stage: null,
  fog: [],
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
  //   const stage: Stage = await loadSpritesheet<MapTileAtts>(name)
  //   type ItemRef = {
  //     name: string
  //   }
  //   stage.layers.forEach((layer) => {
  //     layer.tiles.forEach((tile) => {
  //       if (tile.attributes.type === "chest") {
  //         tile.attributes.items = tile.attributes.items.map(
  //           (item: ItemRef): Item => {
  //             return createItem(item.name)
  //           },
  //         )
  //       }
  //     })
  //   })
  //   gameState.stage = stage
  //   gameState.fog = createFogPositions(stage)
  //   gameState.playerIndex = 0
  //   gameState.currentPlayer = gameState.players[gameState.playerIndex]
  //   gameState.players.forEach((player) => {
  //     clearFogAt(player.position)
  //   })
}
