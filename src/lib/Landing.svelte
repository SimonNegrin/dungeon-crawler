<script lang="ts">
  import CrtScreen from "./CrtScreen.svelte"

  let {
    onclick,
  }: {
    onclick: () => void
  } = $props()
</script>

<CrtScreen flickerOpacity={0.9} vhs={true}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <img class="langing-image" src="/images/landing.png" alt="" {onclick} />
</CrtScreen>

<style>
  .langing-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }
</style>
