import type { IGlobalState } from "./types"
import Vec2 from "./Vec2"
import StageLoader from "./helpers/StageLoader"
import { prefabsMap } from "./helpers/items"
import { populateMonsters } from "./helpers/monsters"
import { clearFogAt, createFogPositions } from "./helpers/fog"
import { TURN_PLAYERS } from "./helpers/game"
import { LAYER_FLOOR } from "./helpers/common"

export const debug = $state({
  showCoords: false,
  showHealth: false,
  bindingGamepad: true,
})

export const gameState = $state<IGlobalState>({
  ignoreInput: false,
  stage: null,
  hurts: [],
  fog: [],
  playerIndex: 0,
  openInventory: null,
  cursorPosition: new Vec2(0, 0),
  cursorPath: [],
  freezePath: false,
  players: [],
  monsters: [],
  turn: TURN_PLAYERS,
})

export async function loadStage(stageName: string): Promise<void> {
  const stageLoader = new StageLoader(prefabsMap)
  const stage = await stageLoader.load(stageName)
  const [firstPlayer] = gameState.players

  gameState.stage = stage
  gameState.fog = createFogPositions(stage)
  gameState.playerIndex = 0
  gameState.currentPlayer = firstPlayer
  gameState.centerActor = firstPlayer.actor
  gameState.monsters = populateMonsters(gameState)
  gameState.turn = TURN_PLAYERS

  const spawnTiles =
    stage.layers
      .find((layer) => layer.name === LAYER_FLOOR)
      ?.tiles.filter((tile) => tile.attributes.type === "spawn") || []

  spawnTiles.sort(() => 0.5 - Math.random())

  gameState.players.forEach((player, i) => {
    // Set spawn position
    player.actor.position = spawnTiles[i].position

    // Clear fog at player position
    clearFogAt(player.actor.position)
  })

  // Use first player to set cursor position
  gameState.cursorPosition = firstPlayer.actor.position
}
