<script lang="ts">
  import HealthBar from "./HealthBar.svelte"
  import SpriteActor from "./sprites/SpriteActor.svelte"
  import type { Actor } from "./types"

  let {
    actor,
  }: {
    actor: Actor
  } = $props()
</script>

<div class="character-stats" class:dead={!actor.isAlive}>
  <div>
    <SpriteActor {actor} />
  </div>
  <div class="info">
    <div class="name">{actor.name}</div>
    <div class="initiative">{actor.initiativeLeft}</div>
    <HealthBar character={actor} />
  </div>
</div>

<style>
  .character-stats {
    display: flex;
    gap: 4px;
    padding: 4px;
    background-color: antiquewhite;
    border-radius: 4px;

    &.dead {
      filter: grayscale(1);
    }
  }
  .info {
    flex: 1 0 0;
  }
</style>
