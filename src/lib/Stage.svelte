<script lang="ts">
  import { loadSpritesheet } from "./common"
  import Rogue from "./Rogue.svelte"
  import type { MapTileAttributes, Position, Spritesheet } from "./types"
  import Vec2 from "./Vec2"

  const TILE_FLOOR = "floor"
  const TILE_DOOR = "door"
  const TILE_WALL = "wall"

  type CellType = typeof TILE_FLOOR | typeof TILE_DOOR | typeof TILE_WALL
  type Grid = CellType[][]
  type Player = {
    name: string
    position: Vec2
  }

  let {
    name,
  }: {
    name: string
  } = $props()

  let stagePromise = $derived(loadSpritesheet<MapTileAttributes>(name))
  let spritesheet = $derived(`/${name}/spritesheet.png`)
  let grid: Grid = $state([])
  let players = $state<Player[]>([
    {
      name: "Krom",
      position: new Vec2(1, 1),
    },
  ])

  $effect(() => {
    stagePromise.then((stage) => {
      grid = getGrid(stage)
    })
  })

  function getGrid(stage: Spritesheet<MapTileAttributes>): Grid {
    const lines: Grid = []
    for (let y = 0; y < stage.mapHeight; y++) {
      const line: CellType[] = Array(stage.mapWidth).fill("floor")
      lines.push(line)
    }

    stage.layers.forEach((layer) => {
      if (!layer.collider) return
      layer.tiles.forEach((tile) => {
        if (!tile.attributes?.door) {
          lines[tile.y][tile.x] = TILE_WALL
        }
      })
    })

    return lines
  }

  function windowOnkeydown(event: KeyboardEvent): void {
    const movements: Record<string, Vec2> = {
      ArrowRight: new Vec2(1, 0),
      ArrowLeft: new Vec2(-1, 0),
      ArrowDown: new Vec2(0, 1),
      ArrowUp: new Vec2(0, -1),
    }

    const movement = movements[event.key]
    if (!movement) return

    players.forEach((player) => {
      player.position = player.position.add(movement)
    })
  }
</script>

<svelte:window onkeydown={windowOnkeydown} />

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
      {#each grid as line, y}
        {#each line as cell, x}
          <div
            class="cell"
            class:wall={cell === TILE_WALL}
            style:left="{x * stage.tileSize}px"
            style:top="{y * stage.tileSize}px"
          ></div>
        {/each}
      {/each}

      {#each players as player}
        <Rogue name={player.name} position={player.position} />
      {/each}
    </div>
  </div>
{/await}

<style>
  .stage {
    position: relative;
    transform: scale(2.2);
    background-color: rgb(40, 40, 40);
    width: calc(var(--map-width) * var(--tile-size));
    height: calc(var(--map-height) * var(--tile-size));
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
