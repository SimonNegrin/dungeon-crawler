<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    children,
    flickerOpacity = 0.55,
    vhs = true,
    crt = true,
  }: {
    children: Snippet
    flickerOpacity?: number
    vhs?: boolean
    crt?: boolean
  } = $props()
</script>

<div
  class="crt-screen"
  class:flicker={flickerOpacity > 0}
  class:crt
  style:--flicker-opacity={flickerOpacity}
>
  <div class="inner-shadow"></div>
  {#if vhs}
    <div class="vhs"></div>
  {/if}
  {@render children()}
</div>

<style>
  .crt-screen {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    &.crt::before {
      content: "";
      display: block;
      position: absolute;
      z-index: 500;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: linear-gradient(
          rgba(18, 16, 16, 0) 50%,
          rgba(0, 0, 0, 0.25) 50%
        ),
        linear-gradient(
          90deg,
          rgba(255, 0, 0, 0.2),
          rgba(0, 255, 0, 0.05),
          rgba(0, 0, 255, 0.2)
        );
      background-size:
        100% 2px,
        3px 100%;
      pointer-events: none;
    }

    &.flicker::after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(18, 16, 16, 0.1);
      opacity: 0;
      z-index: 500;
      pointer-events: none;
      animation: flicker 0.15s infinite;
    }
  }

  .inner-shadow {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
    top: -1px;
    left: -1px;
    bottom: -1px;
    right: -1px;
    border-radius: var(--border-radius);
    box-shadow: inset 0 0 6px 3px var(--main-background-color);
    background-image: url("/images/noise.png");
    mix-blend-mode: overlay;
  }

  .vhs {
    position: absolute;
    z-index: 999;
    pointer-events: none;
    top: -1px;
    left: -1px;
    bottom: -1px;
    right: -1px;
    background-image: url("/images/vhs.gif");
    background-repeat: no-repeat;
    background-size: cover;
    mix-blend-mode: screen;
    opacity: 0.3;
  }

  @keyframes flicker {
    0% {
      opacity: calc(0.27861 * var(--flicker-opacity));
    }
    5% {
      opacity: calc(0.34769 * var(--flicker-opacity));
    }
    10% {
      opacity: calc(0.23604 * var(--flicker-opacity));
    }
    15% {
      opacity: calc(0.90626 * var(--flicker-opacity));
    }
    20% {
      opacity: calc(0.18128 * var(--flicker-opacity));
    }
    25% {
      opacity: calc(0.83891 * var(--flicker-opacity));
    }
    30% {
      opacity: calc(0.65583 * var(--flicker-opacity));
    }
    35% {
      opacity: calc(0.67807 * var(--flicker-opacity));
    }
    40% {
      opacity: calc(0.26559 * var(--flicker-opacity));
    }
    45% {
      opacity: calc(0.84693 * var(--flicker-opacity));
    }
    50% {
      opacity: calc(0.96019 * var(--flicker-opacity));
    }
    55% {
      opacity: calc(0.08594 * var(--flicker-opacity));
    }
    60% {
      opacity: calc(0.20313 * var(--flicker-opacity));
    }
    65% {
      opacity: calc(0.71988 * var(--flicker-opacity));
    }
    70% {
      opacity: calc(0.53455 * var(--flicker-opacity));
    }
    75% {
      opacity: calc(0.37288 * var(--flicker-opacity));
    }
    80% {
      opacity: calc(0.71428 * var(--flicker-opacity));
    }
    85% {
      opacity: calc(0.70419 * var(--flicker-opacity));
    }
    90% {
      opacity: calc(0.7003 * var(--flicker-opacity));
    }
    95% {
      opacity: calc(0.36108 * var(--flicker-opacity));
    }
    100% {
      opacity: calc(0.24387 * var(--flicker-opacity));
    }
  }
</style>
