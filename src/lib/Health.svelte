<script lang="ts">
  let {
    health,
  }: {
    health: number
  } = $props()
</script>

<div class="health">{health}</div>

<style>
  .health {
    position: absolute;
    z-index: 2;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    color: var(--color-text-primary);
  }
</style>
