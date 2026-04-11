<script lang="ts">
  import HealthBar from "./HealthBar.svelte"
  import SpriteActor from "./sprites/SpriteActor.svelte"
  import SpriteItem from "./sprites/SpriteItem.svelte"
  import { gameState } from "./state.svelte"
  import type { Actor } from "./types"

  let {
    actor,
  }: {
    actor: Actor
  } = $props()
</script>

<div
  class="character-stats"
  class:dead={!actor.isAlive}
  class:current-player={actor.name === gameState.currentPlayer.name}
>
  <div>
    <SpriteActor {actor} />
  </div>
  <div class="info">
    <div class="name">{actor.name}</div>
    <HealthBar character={actor} />

    <div class="stats">
      <div class="stat">
        <div class="sprite">
          <SpriteItem name="leather boots" />
        </div>
        <div class="level">{actor.currentStats.movement}</div>
      </div>
      <div class="stat">
        <div class="sprite">
          <SpriteItem name="leather gloves" />
        </div>
        <div class="level">{actor.currentStats.actions}</div>
      </div>
      <div class="stat">
        <div class="sprite">
          <SpriteItem name="short sword" />
        </div>
        <div class="level">{actor.currentStats.attack}</div>
      </div>
      <div class="stat">
        <div class="sprite">
          <SpriteItem name="buckler" />
        </div>
        <div class="level">{actor.currentStats.defence}</div>
      </div>
      <div class="stat">
        <div class="sprite">
          <SpriteItem name="arrows" />
        </div>
        <div class="level">{actor.currentStats.aim}</div>
      </div>
      <div class="stat">
        <div class="sprite">
          <SpriteItem name="wide-brimmed hat" />
        </div>
        <div class="level">{actor.currentStats.magic}</div>
      </div>
    </div>
  </div>
</div>

<style>
  .character-stats {
    position: relative;
    display: flex;
    gap: 4px;
    padding: 4px;
    height: 100%;
    background-color: brown;
    border: 2px outset rgb(168, 64, 64);
    transition-duration: 200ms;

    &.dead {
      filter: grayscale(1) brightness(0.5);
    }

    &.current-player {
      background-color: burlywood;
      border: 2px outset rgb(243, 217, 183);
    }
  }
  .info {
    flex: 1 0 0;
  }

  .stats {
    margin-top: 4px;
    display: grid;
    gap: 2px;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 28px);
  }

  .stat {
    display: flex;
    align-items: center;
    background-color: antiquewhite;
    /* border-radius: 4px; */
    /* box-shadow: inset 2px 2px 2px #666; */
    border: 2px inset rgb(253, 233, 207);
  }

  .level {
    flex-grow: 1;
    text-align: center;
  }
</style>
