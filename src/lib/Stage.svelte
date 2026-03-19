<script lang="ts">
  import { loadSpritesheet } from "./common"
  import Rogue from "./Rogue.svelte"
  import type { Grid, MapTileAttributes, Player, Spritesheet } from "./types"
  import Vec2 from "./Vec2"
  import { grid } from "./state"

  let {
    name,
  }: {
    name: string
  } = $props()

  let stagePromise = $derived(loadSpritesheet<MapTileAttributes>(name))
  let spritesheet = $derived(`/${name}/spritesheet.png`)
  let showPlayers = $state(false)
  let players = $state<Player[]>([
    {
      name: "Ladelbar",
      position: new Vec2(1, 1),
      origin: new Vec2(1, 1),
      steps: 8,
    },
  ])

  $effect(() => {
    stagePromise.then((stage) => {
      $grid = createGrid(stage)
      showPlayers = true
    })
  })

  function createGrid(stage: Spritesheet<MapTileAttributes>): Grid {
    const lines: Grid = []
    for (let y = 0; y < stage.mapHeight; y++) {
      const line: number[] = Array(stage.mapWidth).fill(0)
      lines.push(line)
    }

    stage.layers.forEach((layer) => {
      if (!layer.collider) return
      layer.tiles.forEach((tile) => {
        if (!tile.attributes?.door) {
          lines[tile.y][tile.x] = 1
        }
      })
    })

    return lines
  }
</script>

{#await stagePromise then stage}
  <div
    class="stage"
    style:--tile-size="{stage.tileSize}px"
    style:--map-width={stage.mapWidth}
    style:--map-height={stage.mapHeight}
  >
    {#each stage.layers as layer, index}
      <div
        class="layer"
        data-name={layer.name}
        style:z-index={stage.layers.length - index}
      >
        {#each layer.tiles as tile}
          <div
            class="tile"
            style:left="{tile.x * stage.tileSize}px"
            style:top="{tile.y * stage.tileSize}px"
          >
            <img
              class="spritesheet"
              src={spritesheet}
              style:left="{tile.spriteX * -stage.tileSize}px"
              style:top="{tile.spriteY * -stage.tileSize}px"
              alt=""
            />
          </div>
        {/each}
      </div>
    {/each}

    <div class="gameboard">
      <!-- {#each grid as line, y}
        {#each line as cell, x}
          <div
            class="cell"
            class:wall={cell === 1}
            style:left="{x * stage.tileSize}px"
            style:top="{y * stage.tileSize}px"
          ></div>
        {/each}
      {/each} -->

      {#if showPlayers}
        {#each players as _, index}
          <Rogue bind:player={players[index]} />
        {/each}
      {/if}
    </div>
  </div>
{/await}

<style>
  .stage {
    position: relative;
    overflow: hidden;
    transform: scale(2.2);
    background-color: rgb(40, 40, 40);
    width: calc(var(--map-width) * var(--tile-size));
    height: calc(var(--map-height) * var(--tile-size));
    filter: url(#fisheye);
    transition: filter 0.3s ease;

    &:active::before {
      display: none;
    }

    &::before {
      content: "";
      display: block;
      position: absolute;
      z-index: 500;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: linear-gradient(
          rgba(18, 16, 16, 0) 50%,
          rgba(0, 0, 0, 0.25) 50%
        ),
        linear-gradient(
          90deg,
          rgba(255, 0, 0, 0.2),
          rgba(0, 255, 0, 0.05),
          rgba(0, 0, 255, 0.2)
        );
      background-size:
        100% 2px,
        3px 100%;
      pointer-events: none;
    }

    &::after {
      --flicker-opacity: 0.4;
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(18, 16, 16, 0.1);
      opacity: 0;
      z-index: 500;
      pointer-events: none;
      animation: flicker 0.15s infinite;
    }
  }

  @keyframes flicker {
    0% {
      opacity: calc(0.27861 * var(--flicker-opacity));
    }
    5% {
      opacity: calc(0.34769 * var(--flicker-opacity));
    }
    10% {
      opacity: calc(0.23604 * var(--flicker-opacity));
    }
    15% {
      opacity: calc(0.90626 * var(--flicker-opacity));
    }
    20% {
      opacity: calc(0.18128 * var(--flicker-opacity));
    }
    25% {
      opacity: calc(0.83891 * var(--flicker-opacity));
    }
    30% {
      opacity: calc(0.65583 * var(--flicker-opacity));
    }
    35% {
      opacity: calc(0.67807 * var(--flicker-opacity));
    }
    40% {
      opacity: calc(0.26559 * var(--flicker-opacity));
    }
    45% {
      opacity: calc(0.84693 * var(--flicker-opacity));
    }
    50% {
      opacity: calc(0.96019 * var(--flicker-opacity));
    }
    55% {
      opacity: calc(0.08594 * var(--flicker-opacity));
    }
    60% {
      opacity: calc(0.20313 * var(--flicker-opacity));
    }
    65% {
      opacity: calc(0.71988 * var(--flicker-opacity));
    }
    70% {
      opacity: calc(0.53455 * var(--flicker-opacity));
    }
    75% {
      opacity: calc(0.37288 * var(--flicker-opacity));
    }
    80% {
      opacity: calc(0.71428 * var(--flicker-opacity));
    }
    85% {
      opacity: calc(0.70419 * var(--flicker-opacity));
    }
    90% {
      opacity: calc(0.7003 * var(--flicker-opacity));
    }
    95% {
      opacity: calc(0.36108 * var(--flicker-opacity));
    }
    100% {
      opacity: calc(0.24387 * var(--flicker-opacity));
    }
  }

  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .gameboard {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .tile {
    position: absolute;
    overflow: hidden;
    width: var(--tile-size);
    height: var(--tile-size);
  }
  .spritesheet {
    position: absolute;
    image-rendering: pixelated;
  }
  .cell {
    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);

    &.wall {
      border: 1px solid rgb(255, 131, 240);
    }
  }
</style>
