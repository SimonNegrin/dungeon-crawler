<script lang="ts">
  let {
    key,
    handler,
  }: {
    key: string
    handler: (event: KeyboardEvent) => void
  } = $props()

  let keys = $derived(key.split(","))

  function onkeydown(event: KeyboardEvent): void {
    if (keys.includes(event.key)) {
      handler(event)
    }
  }
</script>

<svelte:window {onkeydown} />
