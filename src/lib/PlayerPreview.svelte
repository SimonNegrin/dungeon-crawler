<script lang="ts">
  import SpriteItem from "./sprites/SpriteItem.svelte"
  import SpriteRogue from "./sprites/SpriteRogue.svelte"
  import type { IPlayerConnection } from "./types"

  const spriteScale = 0.7

  let {
    player,
  }: {
    player: IPlayerConnection
  } = $props()
</script>

<div
  class="preset"
  class:is-waiting={player.isWaiting}
  class:ready={player.isReady}
>
  <div class="header">
    <SpriteRogue name={player.actor.sprite} />
    <div class="name">{player.actor.name}</div>
  </div>
  <div class="stats">
    <div class="stat">
      <SpriteItem name="apple" scale={spriteScale} />
      <div class="value">{player.actor.currentStats.health}</div>
    </div>
    <div></div>
    <div class="stat">
      <SpriteItem name="leather boots" scale={spriteScale} />
      <div class="value">{player.actor.currentStats.movement}</div>
    </div>
    <div class="stat">
      <SpriteItem name="leather gloves" scale={spriteScale} />
      <div class="value">{player.actor.currentStats.actions}</div>
    </div>
    <div class="stat">
      <SpriteItem name="short sword" scale={spriteScale} />
      <div class="value">{player.actor.currentStats.attack}</div>
    </div>
    <div class="stat">
      <SpriteItem name="buckler" scale={spriteScale} />
      <div class="value">{player.actor.currentStats.defence}</div>
    </div>
    <div class="stat">
      <SpriteItem name="arrows" scale={spriteScale} />
      <div class="value">{player.actor.currentStats.aim}</div>
    </div>
    <div class="stat">
      <SpriteItem name="wide-brimmed hat" scale={spriteScale} />
      <div class="value">{player.actor.currentStats.magic}</div>
    </div>
  </div>
</div>

<style>
  .preset {
    width: 120px;
    height: 144px;
    background-color: var(--color-extra-dark-blue);
    border: 2px outset var(--color-dark-gray);
    display: flex;
    flex-direction: column;
    justify-content: center;

    &.is-waiting {
      background-color: var(--color-gold-yellow);
      border-color: var(--color-sandy-brown);
    }

    &.ready {
      background-color: var(--color-dark-yellow-green);
      border-color: var(--color-yellow-green);
    }
  }
  .header {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 6px;
    padding: 4px;
    color: var(--color-text-primary);
  }
  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 4px;
    padding: 4px;
  }
  .stat {
    display: flex;
    justify-content: start;
    align-items: center;
    background-color: var(--color-extra-dark-purple);
    border: 2px inset var(--color-dark-gray);
    color: var(--color-text-primary);
    height: 20px;

    & .value {
      font-size: 12px;
    }
  }
</style>
