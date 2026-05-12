<div class="burning-overlay"></div>

<style>
  .burning-overlay {
    position: absolute;
    z-index: 2;
    inset: -4px;
    pointer-events: none;
    background:
      radial-gradient(
        circle at 50% 70%,
        rgba(255, 100, 30, 0.4),
        transparent 50%
      ),
      radial-gradient(
        circle at 50% 30%,
        rgba(255, 180, 40, 0.3),
        transparent 50%
      );
    mix-blend-mode: screen;
    box-shadow:
      0 0 12px rgba(255, 100, 30, 0.35),
      inset 0 0 4px rgba(255, 180, 40, 0.25);
    animation: burning-pulse 600ms ease-in-out infinite alternate;
  }

  @keyframes burning-pulse {
    from {
      opacity: 0.5;
      filter: blur(0px);
    }
    to {
      opacity: 0.9;
      filter: blur(1px);
    }
  }
</style>
