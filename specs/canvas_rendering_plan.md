# Plan de Renderizado en Canvas (Svelte UI + Canvas GameMap)

## Objetivo

Mantener toda la UI/HUD en Svelte, pero mover el renderizado del mapa y la “escena” (tiles + actores + efectos) a un `<canvas>` controlado por `requestAnimationFrame`, para:

- Reducir complejidad de reactividad (evitar “me falta un repaint”).
- Mejorar rendimiento (menos nodos DOM, menos layout/reflow).
- Centralizar el orden de dibujado (capas, efectos, transiciones).

## Estado actual (referencias)

- El mapa se renderiza como DOM:
  - Tiles: [GameMapLayer.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/GameMapLayer.svelte) → [GameMapTile.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/GameMapTile.svelte)
  - Actores: [Avatars.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Avatars.svelte) → [Avatar.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Avatar.svelte)
  - Fog: [FogLayer.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/FogLayer.svelte) → [Fog.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Fog.svelte)
  - Overlays: [Cursor.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Cursor.svelte), [CursorPath.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/CursorPath.svelte), [Hurts.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Hurts.svelte), [Projectiles.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Projectiles.svelte)
- La “cámara” se mueve cambiando `left/top` de `.stage` con transición CSS (750ms) en [GameMap.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/GameMap.svelte#L86-L93).
- No hay loop de render (salvo transiciones/animaciones CSS o transiciones Svelte en proyectiles).

## Alcance (qué se mueve al canvas)

En la primera iteración:

- Canvas: tiles (todas las capas), actores (jugadores/monstruos) y fog.
- DOM: se mantiene la UI/HUD completa fuera del canvas (listas de jugadores, inventario, etc.).

Evolución posterior (opcional):

- Migrar a canvas: cursor, path preview, números de daño (hurts), proyectiles.

## Principios de implementación

- “El estado manda”: el canvas dibuja siempre desde el estado actual (`gameState`).
- Dibujado por capas determinista (z-order fijo).
- Cachear lo estático:
  - Tiles de capas que no cambian (floor/walls/props) pre-renderizadas en un buffer (OffscreenCanvas si está disponible, o un canvas normal oculto).
  - Dibujar dinámico encima (actores, fog, efectos).
- `requestAnimationFrame` para animaciones; repintado bajo demanda cuando no haya animación.
- Escalado nítido: manejar `devicePixelRatio` y `ctx.imageSmoothingEnabled = false` (pixel-art).

## Fase 0 — Preparación (sin cambiar gameplay)

1. Identificar fuentes de sprites:
   - Tiles: `gameState.stage.spritesheetUrl` y `tile.sprite.{x,y}` en [GameMapTile.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/GameMapTile.svelte#L20-L25).
   - Actores: spritesheets de “rogues/monsters” usados por [SpriteRogue.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/sprites/SpriteRogue.svelte) y [SpriteMonster.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/sprites/SpriteMonster.svelte).
2. Definir un API mínimo de render:
   - `draw(state, time)` que dibuje un frame completo.
   - `setViewport(offset)` o derivar `stageOffset` igual que ahora.
3. Acordar una estrategia de assets:
   - Cargar imágenes una vez (tiles spritesheet + spritesheets de actores).
   - Esperar a “assets listos” antes de pintar (pantalla de loading se mantiene en Svelte hasta que canvas esté listo).

## Fase 1 — Crear el canvas y renderizar tiles del viewport

Objetivo: reemplazar el DOM de tiles por un canvas que dibuje el mismo contenido visible.

1. Crear un nuevo componente `CanvasGameMap.svelte` (en `src/lib/`).
   - Renderiza un `<canvas>` con tamaño lógico `VIEWPORT_SIZE * TILE_SIZE`.
   - Ajusta tamaño real por `devicePixelRatio` para evitar blur.
   - Desactiva smoothing (`imageSmoothingEnabled = false`).
2. Integrarlo en [GameMap.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/GameMap.svelte):
   - Sustituir el bloque `.layers` (GameMapLayer/GameMapTile) por `<CanvasGameMap />`.
   - Mantener el contenedor `.gameboard` para overlays (de momento).
3. Implementar `drawTiles(ctx, stage, stageOffset)`:
   - Iterar capas en el orden actual (mismo z-index que [GameMapLayer.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/GameMapLayer.svelte)).
   - Dibujar solo tiles dentro del viewport:
     - `vx = tile.position.x - stageOffset.x`
     - `vy = tile.position.y - stageOffset.y`
     - si `0 <= vx < VIEWPORT_SIZE` y `0 <= vy < VIEWPORT_SIZE`, dibujar.
   - Usar `drawImage(spritesheet, sx, sy, TILE_SIZE, TILE_SIZE, dx, dy, TILE_SIZE, TILE_SIZE)`.
4. Validación visual:
   - Capturar 3-4 pantallas comparables (antes/después) para asegurar que el tilemap queda idéntico.

## Fase 2 — Cámara y animación de scroll (equivalente a transition 750ms)

Objetivo: igualar la sensación actual de movimiento de cámara al cambiar `centerActor`.

1. Sustituir la transición CSS del contenedor `.stage` por interpolación en canvas:
   - Mantener `targetStageOffset` como el `calcStageOffset(...)` actual.
   - Mantener `currentStageOffset` interpolado (lerp) durante ~750ms cuando cambie el objetivo.
2. Disparar `requestAnimationFrame` solo mientras la cámara esté en transición:
   - Si `currentStageOffset` ya coincide con `targetStageOffset`, parar el loop.
3. Asegurar que la cámara y el cursor se mantengan sincronizados:
   - El cursor sigue siendo DOM (por ahora), así que su `left/top` debe usar el mismo offset (o el cursor se migra a canvas en Fase 4 para evitar “doble sistema”).

Nota: si en Fase 1 se ve aceptable sin transición (cambios instantáneos), se puede posponer esta fase y ganar simplicidad.

## Fase 3 — Render de actores (jugadores/monstruos) en canvas

Objetivo: reemplazar [Avatars.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Avatars.svelte) + [Avatar.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Avatar.svelte) por canvas.

1. Definir el “sprite source” de cada actor:
   - Reutilizar la info actual de sprite (nombre) y mapear a coordenadas del spritesheet (igual que hace SpriteRogue/SpriteMonster).
2. Dibujar actores:
   - Convertir coordenadas a viewport:
     - `dx = (actor.position.x - currentStageOffset.x) * TILE_SIZE + actor.offset.x`
     - `dy = (actor.position.y - currentStageOffset.y) * TILE_SIZE + actor.offset.y`
   - Dibujar highlight del jugador activo (equivalente a borde punteado dorado de [Avatar.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Avatar.svelte#L46-L48)).
   - Manejar “invert” (mirar izquierda/derecha) con `ctx.save(); ctx.scale(-1, 1); ...`.
   - Manejar “ethereal” (drop-shadow/opacity) con `ctx.globalAlpha` y/o un pase adicional (primero versión blanca, luego sprite).
3. Compatibilidad con el sistema actual de ataque:
   - `actor.offset` se usa hoy para animar el ataque en [helpers/combat.ts](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/helpers/combat.ts#L93-L129); en canvas esto sigue funcionando directamente (solo cambia el renderer).

## Fase 4 — Fog + cursor + path en canvas (recomendado para coherencia)

Objetivo: evitar overlays DOM que se puedan desincronizar con la cámara interpolada.

1. Fog:
   - En vez de instanciar miles de nodos como [FogLayer.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/FogLayer.svelte), dibujar rectángulos negros sobre tiles en fog.
   - Efecto “estrellas”:
     - Opción A (rápida): eliminar estrellas y usar un patrón simple/noise.
     - Opción B (fiel): generar estrellas deterministas por tile (seed basada en `position.toString()`), y animar brillo con `time`.
2. Cursor:
   - Dibujar el rectángulo punteado en canvas cuando `gameState.turn === TURN_PLAYERS` (equivalente a [Cursor.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Cursor.svelte#L28-L35)).
   - Color según `invalidPosition` (mismo cálculo actual).
3. CursorPath:
   - Dibujar puntos del path (equivalente a [CursorPath.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/CursorPath.svelte)).

## Fase 5 — Proyectiles y “hurts” (efectos temporales) en canvas

Objetivo: que todo lo que se mueve/animación esté en el mismo sistema de render.

1. Proyectiles:
   - El sistema actual usa transiciones Svelte y `tick` en [Projectile.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Projectile.svelte#L17-L33).
   - En canvas:
     - Guardar un array de proyectiles activos con `{startTime, duration, from, target, type}`.
     - En cada frame calcular `t = clamp((now - startTime)/duration, 0..1)` y dibujar en `from + (target-from)*t`.
     - Al completar, llamar a `ontarget()` para aplicar daño y emitir `shootCompleted` (reutilizando `events`).
2. Hurts (números de daño):
   - El sistema actual depende de `animationend` en [Hurts.svelte](file:///Users/simon/Proyectos/rogue/dungeon-tv/src/lib/Hurts.svelte#L13-L24).
   - En canvas:
     - Añadir `startTime` a cada hurt.
     - Renderizar texto con alpha y desplazamiento vertical en función del tiempo.
     - Al pasar 2s, retirar el hurt del estado (o mantener un buffer interno del renderer para no tocar `gameState`).

## Fase 6 — Integración con Svelte (eventos de render y scheduling)

Objetivo: que el renderer se active cuando haga falta, sin depender de “reactividad DOM” para verse.

1. Estrategia de scheduling:
   - “Dirty flag”: cuando cambie algo que afecta al frame (cursor, posiciones, fog, etc.), marcar `needsRedraw = true`.
   - Si no hay animaciones en curso, pintar una sola vez y volver a idle.
   - Si hay animaciones (cámara interpolando, proyectil activo, offset cambiando), mantener rAF hasta que terminen.
2. Detección de cambios:
   - Inicialmente: usar `$effect` en el componente canvas que observe los trozos de `gameState` relevantes y marque dirty.
   - Optimización posterior: disparar invalidaciones desde puntos clave (por ejemplo, después de `nextPlayer()`, después de `walkTo()`, al modificar `gameState.fog`, etc.).
3. Responsabilidad clara:
   - `gameState` sigue siendo el source of truth del gameplay.
   - El renderer puede mantener estado temporal de animación (tiempos, interpolaciones) sin contaminar el estado del juego.

## Fase 7 — Limpieza y eliminación del DOM antiguo

1. Retirar componentes que ya no se usen:
   - GameMapLayer/GameMapTile (tiles DOM).
   - Avatars/Avatar (si actores van a canvas).
   - FogLayer/Fog (si fog va a canvas).
   - Cursor/CursorPath/Hurts/Projectiles (si se migran).
2. Consolidar el orden de capas:
   - Definir explícitamente el orden (tiles → actors → fog → path → cursor → projectiles → hurts).

## Definición de “Done”

- El mapa se dibuja completamente en canvas y se actualiza siempre que cambia el estado del juego.
- La cámara (stageOffset) y el cursor/overlays se ven consistentes (sin desajustes).
- El rendimiento mejora (menos nodos DOM; el viewport se dibuja en un frame estable).
- La UI/HUD (inventario, lista de jugadores, etc.) sigue en Svelte sin cambios de UX.

## Riesgos y mitigaciones

- Diferencias de look (CSS vs canvas): migrar por fases y validar visualmente en cada una.
- Animaciones existentes (transiciones Svelte): reimplementar solo las necesarias (proyectiles/cámara) y mantener duraciones equivalentes.
- Gestión de DPI: ajustar el canvas por `devicePixelRatio` desde el principio para no introducir blur.

