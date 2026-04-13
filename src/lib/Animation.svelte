<script lang="ts">
  import { TILE_SIZE, waitTime } from "./helpers/common"
  import type { Point } from "./types"

  interface ISize {
    width: number
    height: number
  }

  interface IAnimation {
    spritesheet: string
    size: ISize
    keyframes: Point[]
  }

  let {
    animation,
  }: {
    animation: IAnimation
  } = $props()

  let pos = $derived(animation.keyframes[0])

  export async function play(): Promise<void> {
    for (const keyframe of animation.keyframes) {
      pos = keyframe
      await waitTime(1000 / 24)
    }
  }
</script>

<div
  class="animation"
  style:width="{animation.size.width}px"
  style:height="{animation.size.height}px"
>
  <img
    class="spritesheet"
    src={animation.spritesheet}
    alt=""
    style:left="{pos.x * -TILE_SIZE}px"
    style:top="{pos.y * -TILE_SIZE}px"
  />
</div>

<style>
  .animation {
    position: relative;
    overflow: hidden;
  }
  .spritesheet {
    position: absolute;
  }
</style>
