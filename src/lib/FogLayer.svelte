<script lang="ts">
  import Fog from "./Fog.svelte"
  import { gameState } from "./state.svelte"
  import Vec2 from "./Vec2"

  // let grid = $state(createFogGrid(gameState.stage))

  // $effect(() =>
  //   updateFogGrid(gameState.stage, gameState.currentPlayer.position),
  // )

  // function createFogGrid(stage: Stage | null): Grid {
  //   if (!stage) {
  //     return []
  //   }
  //   const grid: Grid = []
  //   for (let y = 0; y < stage.mapWidth; y++) {
  //     const row: GridValue[] = []
  //     grid.push(row)
  //     for (let x = 0; x < stage.mapHeight; x++) {
  //       row.push(1)
  //     }
  //   }
  //   return grid
  // }

  // function updateFogGrid(stage: Stage | null, position: Vec2): void {
  //   if (!stage) {
  //     return
  //   }

  //   const up = untilWall(stage, position, new Vec2(0, -1))
  //   const down = untilWall(stage, position, new Vec2(0, 1))
  //   const left = untilWall(stage, position, new Vec2(-1, 0))
  //   const right = untilWall(stage, position, new Vec2(1, 0))

  //   for (let y = up.y; y <= down.y; y++) {
  //     for (let x = left.x; x <= right.x; x++) {
  //       grid[y][x] = 0
  //     }
  //   }
  // }

  // function untilWall(stage: Stage, position: Vec2, step: Vec2): Vec2 {
  //   const layer: Layer<MapTileAtts> = stage.layers.find((layer) => {
  //     return layer.name === "walls"
  //   })!
  //   while (!layer.tiles.some((tile) => tile.position.isEqual(position))) {
  //     position = position.add(step)
  //   }
  //   return position
  // }
</script>

<div class="fog-layer">
  {#each gameState.fog as position}
    <Fog {position} />
  {/each}
</div>

<style>
  .fog-layer {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
