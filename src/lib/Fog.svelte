<div class="fog"></div>

<style>
  .fog {
    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);
    background-color: #000000;
    opacity: 1;
    background-image: linear-gradient(135deg, #414141 25%, transparent 25%),
      linear-gradient(225deg, #414141 25%, transparent 25%),
      linear-gradient(45deg, #414141 25%, transparent 25%),
      linear-gradient(315deg, #414141 25%, #000000 25%);
    background-position:
      5px 0,
      5px 0,
      0 0,
      0 0;
    background-size: 11px 11px;
    background-repeat: repeat;
  }
</style>
