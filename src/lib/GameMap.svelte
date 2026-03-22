<script lang="ts">
  import AspectRatio from "./AspectRatio.svelte"
  import {
    getCharacterPathTo,
    isInsideGameboard,
    removeFog,
    TILE_SIZE,
    tileIsFog,
  } from "./common"
  import CrtScreen from "./CrtScreen.svelte"
  import Cursor from "./Cursor.svelte"
  import Loading from "./Loading.svelte"
  import Player from "./Player.svelte"
  import { gameState } from "./state.svelte"
  import Vec2 from "./Vec2"
  import MapLayer from "./MapLayer.svelte"
  import PlayerAction from "./PlayerAction"
  import InventoryExchange from "./InventoryExchange.svelte"

  let freezePath = $state(false)
  let clientWidth = $state(0)
  let stageScale = $derived(clientWidth / 512)

  $effect(() => {
    if (freezePath) return
    getCharacterPathTo(
      gameState.stage!,
      gameState.currentPlayer,
      gameState.cursorPosition,
    ).then((path) => {
      gameState.cursorPath = path?.slice(1, -1) || []
    })
  })

  function onkeydown(event: KeyboardEvent): void {
    if (gameState.openInventory) return
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
    freezePath = true
    const action = new PlayerAction(gameState)
    await action.execute()
    freezePath = false
    await removeFog(gameState.currentPlayer.position)
  }
</script>

<svelte:window {onkeydown} />

<AspectRatio ratio={16 / 12}>
  <CrtScreen flickerOpacity={0.6} vhs={false}>
    <div class="game-map" bind:clientWidth>
      {#if !gameState.stage}
        <Loading />
      {:else}
        <div
          class="stage"
          style="transform: scale({stageScale});"
          style:--map-width={gameState.stage.mapWidth}
          style:--map-height={gameState.stage.mapHeight}
        >
          <div class="layers">
            {#each gameState.stage.layers as layer, index}
              <MapLayer
                {layer}
                zIndex={gameState.stage.layers.length - index}
              />
            {/each}
          </div>

          <div class="gameboard">
            <Cursor position={gameState.cursorPosition} />

            {#each gameState.cursorPath as step}
              <div
                class="step"
                style:left="{step.x * TILE_SIZE}px"
                style:top="{step.y * TILE_SIZE}px"
              ></div>
            {/each}

            {#each gameState.players as player}
              <Player {player} />
            {/each}

            {#if gameState.openInventory}
              <InventoryExchange inventory={gameState.openInventory} />
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </CrtScreen>
</AspectRatio>

<style>
  .game-map {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .stage {
    position: relative;
    overflow: hidden;
    width: calc(var(--map-width) * var(--tile-size));
    height: calc(var(--map-height) * var(--tile-size));
  }
  .layers {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .step {
    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);

    &::before {
      content: "";
      display: block;
      width: 8px;
      height: 8px;
      background-color: yellow;
      position: absolute;
      top: calc(50% - 4px);
      left: calc(50% - 4px);
      border-radius: 100%;
    }
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
