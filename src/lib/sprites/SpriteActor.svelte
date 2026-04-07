<script lang="ts">
  import type { Actor } from "../types"
  import SpriteMonster from "./SpriteMonster.svelte"
  import SpriteRogue from "./SpriteRogue.svelte"

  let {
    actor,
    invert,
  }: {
    actor: Actor
    invert?: boolean
  } = $props()
</script>

{#if actor.type === "player"}
  <SpriteRogue name={actor.sprite} {invert} />
{:else}
  <SpriteMonster name={actor.sprite} {invert} />
{/if}
