<script lang="ts">
  import { fade, fly } from "svelte/transition"
  import { gameState } from "./state.svelte"
  import type { Inventory, InventoryType } from "./types"
  import { onMount } from "svelte"
  import { chestCloseSound, chestOpenSound, zipSound } from "./helpers/audio"
  import InventoryView from "./InventoryView.svelte"
  import OnkeydownCapture from "./OnkeydownCapture.svelte"
  import { moveInventoryItem } from "./helpers/common"
  import { sendPlayerStateSync } from "./helpers/webrtc"

  let {
    leftInventory,
    rightInventory,
  }: {
    leftInventory: Inventory
    rightInventory: Inventory
  } = $props()

  const openSounds: Record<InventoryType, () => void> = {
    chest: chestOpenSound,
    player: zipSound,
    enemy: zipSound,
  }
  const closeSounds: Record<InventoryType, () => void> = {
    chest: chestCloseSound,
    player: zipSound,
    enemy: zipSound,
  }

  let focusRight = $state(true)
  let indexLeft = $state(0)
  let indexRight = $state(0)

  onMount(() => {
    openSounds[leftInventory.type]()
  })

  function moveToLeft(index: number): void {
    moveInventoryItem(index, rightInventory, leftInventory)
    if (gameState.currentPlayer) {
      sendPlayerStateSync(gameState.currentPlayer)
    }
  }

  function moveToRight(index: number): void {
    moveInventoryItem(index, leftInventory, rightInventory)
    if (gameState.currentPlayer) {
      sendPlayerStateSync(gameState.currentPlayer)
    }
  }

  function onleft(): void {
    indexLeft = 2
    toggleFocus()
  }

  function onright(): void {
    indexRight = 0
    toggleFocus()
  }

  function toggleFocus(): void {
    focusRight = !focusRight
  }

  function close(): void {
    closeSounds[leftInventory.type]()
    gameState.openInventory = null
  }
</script>

<OnkeydownCapture key="Escape" handler={close} preventDefault />

<div class="inventory-exchange" transition:fade>
  <div class="inventories" transition:fly={{ y: 20 }}>
    <div class="inventory">
      <div class="inventory-name">{leftInventory.name}</div>
      <div class="inventory-content">
        <InventoryView
          bind:selectedIndex={indexLeft}
          inventory={leftInventory}
          focus={!focusRight}
          onselect={moveToRight}
          {onright}
        />
      </div>
    </div>
    <div class="inventory">
      <div class="inventory-name">{rightInventory.name}</div>
      <div class="inventory-content">
        <InventoryView
          bind:selectedIndex={indexRight}
          inventory={rightInventory}
          focus={focusRight}
          onselect={moveToLeft}
          {onleft}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .inventory-exchange {
    --color-font: var(--color-mild-yellow-white);
    --color-back: var(--color-gold-yellow);

    position: absolute;
    z-index: 300;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .inventories {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    pointer-events: all;
    display: flex;
    background-color: var(--color-font);
    border-radius: 10px;
  }
  .inventory {
    flex: 1 0 0;
    min-height: 0;
    color: var(--color-back);
    text-align: center;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .inventory-name {
    font-size: 1em;
    border-bottom: 2px dotted var(--color-back);
  }
  .inventory-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
