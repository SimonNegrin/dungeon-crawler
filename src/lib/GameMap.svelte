<script lang="ts">
  import Cursor from "./Cursor.svelte"
  import Loading from "./Loading.svelte"
  import { gameState } from "./state.svelte"
  import Vec2 from "./Vec2"
  import GameMapLayer from "./GameMapLayer.svelte"
  import CursorPath from "./CursorPath.svelte"
  import Avatars from "./Avatars.svelte"
  import type { Actor, Stage } from "./types"
  import FogLayer from "./FogLayer.svelte"
  import {
    attackMonster,
    currentPlayerAction,
    magickAttack,
    shootMonster,
  } from "./helpers/players"
  import {
    moveCursorRight,
    moveCursorLeft,
    moveCursorDown,
    moveCursorUp,
  } from "./helpers/cursor"
  import { TILE_SIZE, VIEWPORT_SIZE } from "./helpers/common"
  import Hurts from "./Hurts.svelte"
  import Projectiles from "./Projectiles.svelte"

  let stageOffset = $derived(
    calcStageOffset(gameState.stage, gameState.centerActor!),
  )

  function calcStageOffset(stage: Stage | null, actor: Actor): Vec2 {
    if (!stage) {
      return new Vec2(0, 0)
    }
    const pad = Math.floor(VIEWPORT_SIZE / 2)
    let padX = Math.max(0, actor.position.x - pad)
    let padY = Math.max(0, actor.position.y - pad)
    padX = Math.min(padX, stage.mapWidth - VIEWPORT_SIZE)
    padY = Math.min(padY, stage.mapHeight - VIEWPORT_SIZE)
    return new Vec2(padX, padY)
  }

  async function onkeydown(event: KeyboardEvent): Promise<void> {
    if (gameState.ignoreInput || event.defaultPrevented) return
    if (event.key === " ") {
      await currentPlayerAction()
      return
    }
    if (event.key === "a") {
      await attackMonster()
      return
    }
    if (event.key === "s") {
      await shootMonster()
      return
    }
    if (event.key === "d") {
      await magickAttack()
      return
    }
    moveCursor(event)
  }

  function moveCursor(event: KeyboardEvent): void {
    const movements: Record<string, () => void> = {
      ArrowRight: () => moveCursorRight(),
      ArrowLeft: () => moveCursorLeft(),
      ArrowDown: () => moveCursorDown(),
      ArrowUp: () => moveCursorUp(),
    }
    movements[event.key]?.()
  }
</script>

<svelte:window {onkeydown} />

<div class="game-map">
  <div
    class="game-map-container"
    style:width="{VIEWPORT_SIZE * TILE_SIZE}px"
    style:height="{VIEWPORT_SIZE * TILE_SIZE}px"
  >
    {#if !gameState.stage}
      <Loading />
    {:else}
      <div
        class="stage"
        style:left="{stageOffset.x * -TILE_SIZE}px"
        style:top="{stageOffset.y * -TILE_SIZE}px"
        style:width="{gameState.stage.mapWidth * TILE_SIZE}px"
        style:height="{gameState.stage.mapHeight * TILE_SIZE}px"
      >
        <div class="layers">
          {#each gameState.stage.layers as layer, index}
            <GameMapLayer
              {layer}
              zIndex={gameState.stage.layers.length - index}
            />
          {/each}
        </div>

        <div class="gameboard">
          <Avatars />
          <FogLayer />
          <Hurts />
          <CursorPath />
          <Cursor />
          <Projectiles />
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
