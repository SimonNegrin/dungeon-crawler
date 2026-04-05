<script lang="ts">
  import spritesheet from "../../assets/spritesheets/monsters.png"
  import monsters from "../../assets/spritesheets/monsters.json"
  import Sprite from "./Sprite.svelte"

  export type MonsterName = keyof typeof monsters

  let {
    name,
    invert,
  }: {
    name: MonsterName
    invert?: boolean
  } = $props()
</script>

<Sprite pos={monsters[name]} {spritesheet} {invert} />
