<script lang="ts">
  import type Vec2 from "./Vec2"

  let {
    position,
  }: {
    position: Vec2
  } = $props()
</script>

<div class="cursor" style:--x={position.x} style:--y={position.y}></div>

<style>
  .cursor {
    position: absolute;
    z-index: 2;
    width: var(--tile-size);
    height: var(--tile-size);
    left: calc(var(--tile-size) * var(--x));
    top: calc(var(--tile-size) * var(--y));
    border: 2px dotted #ff09ca;
    transition-duration: 100ms;
  }
</style>
