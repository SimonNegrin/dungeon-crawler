<script lang="ts">
  import spritesheet from "../../assets/spritesheets/rogues.png"
  import rogues from "../../assets/spritesheets/rogues.json"
  import Sprite from "./Sprite.svelte"

  export type RogueName = keyof typeof rogues

  let {
    name,
    invert,
    scale,
  }: {
    name: RogueName
    invert?: boolean
    scale?: number
  } = $props()
</script>

<Sprite pos={rogues[name]} {spritesheet} {invert} {scale} />
