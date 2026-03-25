<script lang="ts">
  import Sprite from "./Sprite.svelte"

  let {
    id,
  }: {
    id: string
  } = $props()
</script>

<Sprite path="items/{id}" />
