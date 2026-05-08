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

  let statusText = $derived.by(() => {
    if (player.isReady) return "¡Listo!"
    if (player.isWaiting) return "Esperando..."
    return "Conectado"
  })
</script>

<div class="preset">
  <div
    class="status-badge"
    class:ready={player.isReady}
    class:waiting={player.isWaiting}
  >
    {statusText}
  </div>
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
    {#if player.actor.currentStats.aim > 0}
      <div class="stat">
        <SpriteItem name="arrows" scale={spriteScale} />
        <div class="value">{player.actor.currentStats.aim}</div>
      </div>
    {/if}
    {#if player.actor.currentStats.magic > 0}
      <div class="stat">
        <SpriteItem name="wide-brimmed hat" scale={spriteScale} />
        <div class="value">{player.actor.currentStats.magic}</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .preset {
    position: relative;
    width: 120px;
    height: 144px;
    background-color: var(--color-extra-dark-blue);
    border: 2px outset var(--color-dark-gray);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .status-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 10px;
    border-radius: 0;
    background-color: var(--color-extra-dark-blue);
    border: 2px outset var(--color-dark-gray);
    color: var(--color-text-primary);
    z-index: 1;

    &.waiting {
      background-color: var(--color-gold-yellow);
      border-color: var(--color-sandy-brown);
      color: var(--color-extra-dark-blue);
    }

    &.ready {
      background-color: var(--color-dark-yellow-green);
      border-color: var(--color-yellow-green);
      color: var(--color-extra-dark-blue);
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
