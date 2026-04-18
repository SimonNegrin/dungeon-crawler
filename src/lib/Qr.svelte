<script lang="ts">
  import QrCreator from "qr-creator"
  import { onMount } from "svelte"

  let {
    content,
    size = 200,
  }: {
    content: string
    size?: number
  } = $props()

  let canvas: HTMLCanvasElement

  onMount(() => {
    QrCreator.render(
      {
        text: content,
        radius: 0.0, // 0.0 to 0.5
        ecLevel: "M", // L, M, Q, H
        fill: "#000", // foreground color
        background: "#fff", // color or null for transparent
        size, // in pixels
      },
      canvas,
    )
  })
</script>

<div class="p-2 bg-white">
  <canvas bind:this={canvas}></canvas>
</div>
