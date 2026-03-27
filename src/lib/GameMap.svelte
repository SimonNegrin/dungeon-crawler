<script lang="ts">
  import { isInsideGameboard, removeFog, TILE_SIZE, tileIsFog } from "./common"
  import Cursor from "./Cursor.svelte"
  import Loading from "./Loading.svelte"
  import { gameState } from "./state.svelte"
  import Vec2 from "./Vec2"
  import MapLayer from "./MapLayer.svelte"
  import PlayerAction from "./PlayerAction"
  import { fogClearSound } from "./audio"
  import CursorPath from "./CursorPath.svelte"
  import Players from "./Players.svelte"
  import type { Character, Stage } from "./types"
  import FogLayer from "./FogLayer.svelte"

  const VIEWPORT_SIZE = 13

  let stageOffset = $derived(
    calcStageOffset(gameState.stage, gameState.currentPlayer),
  )
  let mapWidth = $state(0)
  let containerWidth = $state(0)
  let mapScale = $derived(mapWidth / containerWidth)

  function calcStageOffset(stage: Stage | null, player: Character): Vec2 {
    if (!stage) {
      return new Vec2(0, 0)
    }
    const pad = Math.floor(VIEWPORT_SIZE / 2)
    let padX = Math.min(0, pad - player.position.x)
    let padY = Math.min(0, pad - player.position.y)
    padX = Math.max(padX, VIEWPORT_SIZE - stage.mapWidth)
    padY = Math.max(padY, VIEWPORT_SIZE - stage.mapHeight)
    return new Vec2(padX, padY)
  }

  function onkeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return
    if (event.key === " ") {
      action()
      return
    }
    moveCursor(event)
  }

  function moveCursor(event: KeyboardEvent): void {
    const movements: Record<string, Vec2> = {
      ArrowRight: new Vec2(1, 0),
      ArrowLeft: new Vec2(-1, 0),
      ArrowDown: new Vec2(0, 1),
      ArrowUp: new Vec2(0, -1),
    }

    if (!movements[event.key]) {
      return
    }

    const newPosition = gameState.cursorPosition.add(movements[event.key])

    if (!isInsideGameboard(newPosition)) {
      return
    }

    if (tileIsFog(newPosition)) {
      return
    }

    gameState.cursorPosition = newPosition
  }

  async function action(): Promise<void> {
    gameState.freezePath = true
    const action = new PlayerAction()
    await action.execute()
    gameState.freezePath = false
    if (await removeFog(gameState.currentPlayer.position)) {
      fogClearSound()
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="game-map" bind:clientWidth={mapWidth}>
  <div
    class="game-map-container"
    bind:clientWidth={containerWidth}
    style:width="{VIEWPORT_SIZE * TILE_SIZE}px"
    style:height="{VIEWPORT_SIZE * TILE_SIZE}px"
    style:transform="scale({mapScale})"
  >
    {#if !gameState.stage}
      <Loading />
    {:else}
      <div
        class="stage"
        style:left="{stageOffset.x * TILE_SIZE}px"
        style:top="{stageOffset.y * TILE_SIZE}px"
        style:width="{gameState.stage.mapWidth * TILE_SIZE}px"
        style:height="{gameState.stage.mapHeight * TILE_SIZE}px"
      >
        <div class="layers">
          {#each gameState.stage.layers as layer, index}
            <MapLayer {layer} zIndex={gameState.stage.layers.length - index} />
          {/each}
        </div>

        <div class="gameboard">
          <FogLayer />

          <CursorPath />

          <Cursor position={gameState.cursorPosition} />

          <Players />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .game-map {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .game-map-container {
    overflow: hidden;
    position: relative;
    background-color: rgb(22, 22, 22);
  }
  .stage {
    position: absolute;
    overflow: hidden;
    transition-property: top, left;
    transition-duration: 750ms;
  }
  .layers {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .gameboard {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
