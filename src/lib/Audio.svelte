<script lang="ts">
  let {
    src,
    volume = 0.5,
  }: {
    src: string
    volume: number
  } = $props()

  let audioEl: HTMLAudioElement

  export function play(): void {
    if (!audioEl) return
    audioEl.volume = volume
    audioEl.currentTime = 0
    audioEl.play()
  }
</script>

<audio bind:this={audioEl} {src} preload="auto"></audio>
