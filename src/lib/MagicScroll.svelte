<script lang="ts">
  import { fade, fly } from "svelte/transition"
  import type { Actor } from "./types"
  import { gameState } from "./state.svelte"
  import { getMagicMenuItems } from "./helpers/spells"

  function clampIndex(index: number, length: number): number {
    if (length <= 0) return 0
    return Math.max(0, Math.min(index, length - 1))
  }

  let menuItems = $derived(getMagicMenuItems(gameState.currentPlayer?.actor))
  let selectedIndex = $derived(
    clampIndex(gameState.magicMenuIndex, menuItems.length),
  )
</script>

<div class="magic-scroll" transition:fade>
  <div class="scroll" transition:fly={{ y: 10 }}>
    <div class="title">Magia</div>
    <ul class="list">
      {#each menuItems as item, i (item.spellId + ":" + i)}
        <li class:selected={i === selectedIndex}>
          <span class="marker">{i === selectedIndex ? "▶" : ""}</span>
          <span class="name">{item.name}</span>
          {#if item.uses !== undefined}
            <span class="uses">{item.uses} usos</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .magic-scroll {
    --color-font: var(--color-mild-yellow-white);
    --color-back: var(--color-gold-yellow);

    position: absolute;
    z-index: 250;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .scroll {
    width: 80%;
    max-width: 280px;
    pointer-events: all;
    background-color: var(--color-font);
    color: var(--color-back);
    border-radius: 10px;
    padding: 10px 12px;
  }

  .title {
    font-size: 1em;
    text-align: center;
    border-bottom: 2px dotted var(--color-back);
    padding-bottom: 6px;
    margin-bottom: 8px;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px;
    border-radius: 6px;
  }

  li.selected {
    background-color: rgba(255, 255, 255, 0.12);
  }

  .marker {
    width: 14px;
    flex: 0 0 14px;
    text-align: center;
  }

  .name {
    flex: 1 1 auto;
    min-width: 0;
  }

  .uses {
    flex: 0 0 auto;
    opacity: 0.9;
  }
</style>
