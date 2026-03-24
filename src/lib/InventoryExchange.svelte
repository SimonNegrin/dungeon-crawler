<script lang="ts">
  import { fade, fly } from "svelte/transition"
  import ItemSprite from "./ItemSprite.svelte"
  import OnkeydownCapture from "./OnkeydownCapture.svelte"
  import { gameState } from "./state.svelte"
  import type { Inventory } from "./types"
  import { onMount } from "svelte"
  import Audio from "./Audio.svelte"
  import ItemStats from "./ItemStats.svelte"

  let {
    inventory,
  }: {
    inventory: Inventory
  } = $props()

  let exchangeAudio: Audio
  let openAudio: Audio
  let currentPlayer = $derived(gameState.currentPlayer)
  let leftInventory = $state(true)
  let indexLeft = $state(0)
  let indexRight = $state(0)

  onMount(() => {
    adjustIndex()
    openAudio.play()
  })

  function exchangeItem(): void {
    if (!inventory) return
    const [index, from, target] = leftInventory
      ? [indexLeft, inventory, currentPlayer]
      : [indexRight, currentPlayer, inventory]
    const [item] = from.items.splice(index, 1)
    target.items.push(item)
    exchangeAudio.play()
    adjustIndex()
  }

  function close(event: KeyboardEvent): void {
    event.preventDefault()
    gameState.openInventory = null
  }

  function moveHorizontally(): void {
    leftInventory = !leftInventory
    adjustIndex()
  }

  function adjustIndex() {
    if (!inventory) return
    if (indexLeft >= inventory.items.length) {
      indexLeft = Math.max(0, inventory.items.length - 1)
    }
    if (indexRight >= currentPlayer.items.length) {
      indexRight = Math.max(0, currentPlayer.items.length - 1)
    }
    if (inventory.items.length === 0) {
      leftInventory = false
      return
    }
    if (currentPlayer.items.length === 0) {
      leftInventory = true
      return
    }
  }

  function moveDown() {
    if (!inventory) return
    if (leftInventory) {
      indexLeft = (indexLeft + 1) % inventory.items.length
    } else {
      indexRight = (indexRight + 1) % currentPlayer.items.length
    }
  }

  function moveUp() {
    if (!inventory) return
    if (leftInventory) {
      indexLeft--
      if (indexLeft < 0) indexLeft += inventory.items.length
    } else {
      indexRight--
      if (indexRight < 0) indexRight += currentPlayer.items.length
    }
  }
</script>

<OnkeydownCapture preventDefault key="ArrowDown" handler={moveDown} />
<OnkeydownCapture preventDefault key="ArrowUp" handler={moveUp} />
<OnkeydownCapture
  preventDefault
  key="ArrowLeft,ArrowRight"
  handler={moveHorizontally}
/>
<OnkeydownCapture preventDefault key=" " handler={exchangeItem} />
<OnkeydownCapture preventDefault key="Escape" handler={close} />

<Audio bind:this={exchangeAudio} src="/sounds/pen_click.mp3" volume={0.15} />
<Audio bind:this={openAudio} src="/sounds/chest_open.mp3" volume={0.25} />

<div class="inventory-exchange" transition:fade>
  <div class="inventories" transition:fly={{ y: 20 }}>
    <div class="inventory">
      <div class="inventory-name">{inventory.name}</div>
      <div class="inventory-content">
        {#if !inventory.items.length}
          <div class="empty">--- Vacio ---</div>
        {/if}
        {#each inventory.items as item, index}
          <div
            class="item"
            class:selected={leftInventory && indexLeft === index}
          >
            <ItemSprite id={item.spriteId} />
            <div>
              <div class="name">{item.name}</div>
              <div class="desc">{item.desc}</div>
              <div class="stats-container">
                <ItemStats {item} />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <div class="inventory">
      <div class="inventory-name">{currentPlayer.name}</div>
      <div class="inventory-content">
        {#if !currentPlayer.items.length}
          <div class="empty">--- Vacio ---</div>
        {/if}
        {#each currentPlayer.items as item, index}
          <div
            class="item"
            class:selected={!leftInventory && indexRight === index}
          >
            <ItemSprite id={item.spriteId} />
            <div>
              <div class="name">{item.name}</div>
              <div class="desc">{item.desc}</div>
              <div class="stats-container">
                <ItemStats {item} />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .inventory-exchange {
    --color-font: #f5e9bc;
    --color-back: #a78a20;

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
    pointer-events: all;
    display: flex;
    width: 80%;
    height: 80%;
    background-color: var(--color-font);
    border-radius: 10px;
  }
  .inventory {
    flex: 1 0 0;
    min-height: 0;
    color: var(--color-back);
    text-align: center;
    padding: 20px;
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
  .empty {
    padding: 4px 8px;
  }
  .item {
    display: flex;
    gap: 4px;
    position: relative;
    font-family: var(--font-family-1);
    padding: 4px;
    width: 100%;
    text-align: left;
    background-color: transparent;
    color: var(--color-back);
    border: 2px solid var(--color-back);
    box-shadow: 2px 2px 0 var(--color-back);

    &.selected {
      &::before,
      &::after {
        content: "";
        display: block;
        position: absolute;
        top: calc(50% - 4px);
        width: 4px;
        height: 4px;
        transform: rotate(45deg);
      }

      &::before {
        left: -12px;
        border-top: 3px solid var(--color-back);
        border-right: 3px solid var(--color-back);
      }

      &::after {
        right: -14px;
        border-left: 3px solid var(--color-back);
        border-bottom: 3px solid var(--color-back);
      }
    }

    & .name {
      font-size: 0.9em;
    }

    & .desc,
    & .stats-container {
      font-size: 0.7em;
    }
  }
</style>
