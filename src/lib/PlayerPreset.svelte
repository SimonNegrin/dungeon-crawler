<script lang="ts">
  import SpriteItem from "./sprites/SpriteItem.svelte"
  import SpriteRogue from "./sprites/SpriteRogue.svelte"
  import type { IPlayerPreset } from "./types"

  const spriteScale = 0.7

  let {
    preset,
  }: {
    preset: IPlayerPreset
  } = $props()
</script>

<div class="preset">
  <div class="header">
    <SpriteRogue name={preset.sprite} />
    <div class="name">{preset.name}</div>
  </div>
  <div class="stats">
    <div class="stat">
      <SpriteItem name="leather boots" scale={spriteScale} />
      <div class="value">{preset.movement}</div>
    </div>
    <div class="stat">
      <SpriteItem name="leather gloves" scale={spriteScale} />
      <div class="value">{preset.actions}</div>
    </div>
    <div class="stat">
      <SpriteItem name="short sword" scale={spriteScale} />
      <div class="value">{preset.attack}</div>
    </div>
    <div class="stat">
      <SpriteItem name="buckler" scale={spriteScale} />
      <div class="value">{preset.defence}</div>
    </div>
    <div class="stat">
      <SpriteItem name="arrows" scale={spriteScale} />
      <div class="value">{preset.aim}</div>
    </div>
    <div class="stat">
      <SpriteItem name="wide-brimmed hat" scale={spriteScale} />
      <div class="value">{preset.magic}</div>
    </div>
  </div>
</div>

<style>
  .preset {
    width: 100%;
    height: 100%;
    background-color: #222;
    border: 2px outset #333;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .header {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 6px;
    padding: 4px;
  }
  .stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 4px;
    padding: 4px;
  }
  .stat {
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 0 4px;
    background-color: #444;
    border: 2px inset #333;
    height: 20px;

    & .value {
      font-size: 12px;
    }
  }
</style>
