# Plan: Sistema de habilidades mágicas

## Objetivo

Pasar de un único ataque mágico (proyectil) a un sistema de habilidades mágicas seleccionables, ampliables mediante items tipo “hechizo” con usos limitados, y bloqueadas para jugadores sin habilidad mágica (salvo que un item les otorgue dicha habilidad).

## Reglas base (definición funcional)

1. **Selección de acción mágica**
   - Al pulsar el botón **Magic** del gamepad, el monitor (dungeon-tv) muestra un “pergamino” con las acciones mágicas disponibles para el jugador actual.
   - El jugador navega por la lista y **activa** una acción.
2. **Hechizo base siempre disponible**
   - “Proyectil mágico” siempre aparece en la lista.
   - No se gasta (usos infinitos).
3. **Hechizos como items consumibles**
   - Un item de tipo “hechizo” añade una acción mágica extra a la lista.
   - Cada hechizo tiene un número de **usos**.
   - Cada vez que se lanza, se decrementan los usos; al llegar a 0 el item se elimina del inventario del jugador.
4. **Bloqueo por habilidad mágica**
   - Un jugador solo puede abrir el pergamino y lanzar hechizos si tiene “habilidad mágica”.
   - La habilidad mágica viene por:
     - stats/base (por ejemplo `currentStats.magic > 0`), o
     - un item en inventario/traits que otorgue explícitamente “habilidad mágica”.

## UX / Controles (propuesta concreta)

- **Abrir/Cerrar**
  - Pulsar **Magic** abre el pergamino.
  - Pulsar **Magic** sobre una opción la confirma (lanza el hechizo) y cierra el pergamino.
  - Pulsar **Caminar** cierra el pergamino sin lanzar nada (cancelar). El icono del botón cambia y muestra una “X” para indicar que se cancela la operación.
- **Navegación**
  - Joystick **↑/↓** cambia la opción seleccionada.
  - Joystick **←/→** no hace nada dentro del pergamino (se reserva para futuras subopciones).
- **Targeting**
  - Primera iteración: los hechizos que requieran objetivo usan el **objetivo bajo el cursor** actual (igual que el proyectil mágico actual).
  - Si no hay objetivo válido, el menú de pergamino no se abre. Se emite un sonido de fallo.

## Modelo de datos (cambios propuestos)

### 1) Definición de “habilidad mágica”

#### Completado: Sí

Implementado el helper `canCastMagic(actor)` con esta semántica:

- `true` si `actor.currentStats.magic > 0`
- `true` si algún item/trait en `actor.items` o `actor.traits` otorga magia
- `false` en caso contrario

Implementación: `src/lib/helpers/common.ts` (y uso inicial integrado en el ataque mágico actual).

Para “otorgar magia” se añade un flag explícito a metadata, para no reutilizar el actual `metadata.magic` (hoy se muestra como “Ataque mágico”):

- `ItemMetadata.grantsMagic?: boolean`

### 2) Items “hechizo”

#### Completado: Sí

Extender `ItemMetadata` para soportar hechizos:

- `spellId?: string` (identificador estable, ej. `"freeze"`)
- `uses?: number` (ya existe; se reutiliza para cargas)
- (opcional) `spellPower?: number` o `range?: number` si queremos parametrizar por item

Criterio de identificación:

- Un item es “hechizo” si tiene `metadata.spellId` (y normalmente `metadata.uses`).

Implementación: extendido `ItemMetadata` y actualizado el UI de stats de item para mostrar “Hechizo: {spellId}”.

### 3) Registro de hechizos (acciones mágicas)

#### Completado: Sí

Crear un registro/tabla de hechizos del juego (ej. `helpers/spells.ts`) que defina:

- `id`
- `name` (texto del pergamino)
- `type` (proyectil / efecto / soporte)
- `requiresTarget` (bool)
- `range` (por defecto usar `SHOOT_DISTANCE`, configurable)
- `requiresLineOfSight` (bool)
- `actionCost` (por defecto 1 acción)
- `cast(ctx)` (función que aplica el efecto: proyectil, estado, etc.)

El hechizo base “Proyectil mágico” se modela también como entrada en el registro pero con `consumesItem=false`.

Implementación: `src/lib/helpers/spells.ts` (incluye el hechizo base “Proyectil mágico”).

## UI del “pergamino” en dungeon-tv

#### Completado: Sí

1. Crear un overlay (componente Svelte) renderizado en la zona del mapa (dentro de `.screen-container`).
2. El overlay muestra:
   - Título: “Magia”
   - Lista de acciones disponibles
   - Para hechizos consumibles: “x usos” alineado a la derecha
   - Indicador de selección (cursor/marker)
3. El overlay se controla por un estado en `gameState`:
   - `magicMenuOpen: boolean`
   - `magicMenuIndex: number`
   - (opcional) `magicMenuItems: MagicActionViewModel[]` derivado

Implementación: `src/lib/MagicScroll.svelte` (overlay) + `magicMenuOpen/magicMenuIndex` en `gameState`.

## Input / State machine (dungeon-tv)

#### Completado: Sí

Reutilizar el mismo paquete `PKT_GAMEPAD_STATE` y cambiar el “routing” del input según estado:

- Si `magicMenuOpen`:
  - joystick ↑/↓ => cambia `magicMenuIndex`
  - botón Magic => intenta lanzar el hechizo seleccionado
  - botón Caminar => cierra sin lanzar
  - se ignoran movimientos de cursor y el resto de acciones (ataque físico/disparo)
- Si `magicMenuOpen` es `false`:
  - comportamiento actual (mover cursor, atacar, disparar, etc.)
  - botón Magic => abre el pergamino (si `canCastMagic(currentPlayer.actor)`)

Implementación: routing aplicado en `src/lib/helpers/connections.ts` (A=Magic, C=Caminar). Al abrir, se valida `canCastMagic` y que haya monstruo bajo el cursor; si falla, suena `attackFailSound()`. Al confirmar, se lanza el hechizo seleccionado vía `castSpell(...)`.

## Casting (pipeline unificado)

#### Completado: Sí

Implementar una función central tipo `castSpell(actor, spellId)`:

1. Validar `canCastMagic(actor)`
2. Resolver el hechizo desde el registro
3. Validar recursos:
   - `actor.currentStats.actions > 0` (o `>= actionCost`)
   - objetivo válido si `requiresTarget`
   - rango y línea de visión si aplica
4. Aplicar coste:
   - decrementar `actions`
5. Ejecutar efecto:
   - proyectil: reutilizar `projectileTo({ type: ... })` o extender `ProjectileType`
   - efecto directo: aplicar estado/daño/buff
6. Consumir item (solo si el hechizo viene de un item):
   - `item.metadata.uses--`
   - si `uses <= 0`: eliminar esa instancia de item del `actor` (en `items` o `traits`)

Implementación: `castSpell(...)` en `src/lib/helpers/spells.ts` + integración en `src/lib/helpers/connections.ts` y wrapper `magickAttack()` en `src/lib/helpers/players.ts`.

## Hechizos iniciales (mínimo para validar el sistema)

#### Completado: Sí

- **Proyectil mágico** (base, infinito)
  - Tipo: proyectil (reutiliza fireball actual)
  - Requiere target (monstruo)
- **Hechizo de congelación** (por item, ej. 3 usos)
  - Tipo: efecto sobre objetivo
  - Requiere target (monstruo)
  - Efecto sugerido: aplicar un estado “frozen” por N turnos que impide actuar al monstruo

Nota: la implementación del estado puede apoyarse en `traits` con `metadata.turns`, y el controlador de turnos de monstruos debería decrementar turnos y saltarse la acción si está congelado.

Implementación:
- “Proyectil mágico”: `src/lib/helpers/spells.ts` (hechizo `magic_projectile`)
- “Congelación”: `src/lib/helpers/spells.ts` (hechizo `freeze`) + item `Pergamino de congelación` en `src/lib/helpers/items.ts` + control de turno “frozen” en `src/lib/helpers/MonstersController.ts`.

## Sincronización con el gamepad (rogue-gamepad)

#### Completado: Sí

Objetivo: que el gamepad muestre/oculte el botón Magic de forma correcta, incluyendo el caso “habilidad mágica otorgada por item”.

Plan:

1. En dungeon-tv, al enviar `PKT_PLAYER_STATE_SYNC`, incluir un booleano adicional `canCastMagic`.
2. En rogue-gamepad, almacenar ese booleano y usarlo para renderizar los botones de magia.
3. Mantener compatibilidad:
   - Si el campo no existe (clientes antiguos), fallback a `magic > 0`.

Implementación:
- dungeon-tv: `sendPlayerStateSync` incluye `canCastMagic` e `inGame` en `PKT_PLAYER_STATE_SYNC` (`src/lib/helpers/webrtc.ts`), y se envía al conectar, durante configuración, al aceptar y al iniciar partida.
- rogue-gamepad: guarda `canCastMagic` en `globalState.canCastMagic` y usa ese flag para renderizar los botones de magia (`src/lib/Gamepad.svelte`). El sync no fuerza el salto de pantalla de configuración (solo hidrata `globalState.player` si ya existe o si `inGame===true`).

## Paso a paso (implementación)

1. **Añadir modelo de hechizos** — Implementado
   - Registro en `src/lib/helpers/spells.ts` (`SPELLS`, `SpellDefinition`, `resolveSpell`).
   - Helper `canCastMagic(actor)` en `src/lib/helpers/common.ts`.
   - Helper `getMagicMenuItems(actor)` para construir la lista del pergamino.
2. **Extender metadata de items** — Implementado
   - `ItemMetadata`: `grantsMagic`, `spellId`, `spellPower`, `frozen` (además de `uses`, `turns`, `range`).
   - UI: `ItemStats` muestra “Habilidad mágica” y “Hechizo: {spellId}”.
3. **Crear items de hechizo en prefabs** — Implementado parcial
   - Añadido “Pergamino de congelación” (`spellId="freeze"`, `uses=3`).
   - No se ha añadido un prefab de item “otorga magia” (`grantsMagic=true`).
4. **Overlay del pergamino** — Implementado
   - Overlay `src/lib/MagicScroll.svelte` renderizado en `.screen-container` (dentro de `Game.svelte`).
   - Estado en `gameState`: `magicMenuOpen`, `magicMenuIndex`.
5. **Actualizar manejo de input** — Implementado
   - Routing en `src/lib/helpers/connections.ts` según `magicMenuOpen`.
   - Al abrir: requiere `canCastMagic` y monstruo bajo cursor (si falla suena `attackFailSound()`).
6. **Implementar el pipeline de casting** — Implementado
   - `castSpell(...)` centraliza validaciones, coste de acciones, LoS/rango, ejecución y consumo de usos.
7. **Implementar “congelación”** — Implementado
   - Hechizo `freeze` aplica trait “Congelado” con `metadata.frozen=true` y `turns`.
   - Turno de monstruos: si está congelado, pierde su turno y se decrementa/elimina el efecto.
8. **Sincronizar disponibilidad de magia con el gamepad** — Implementado
   - Sync incluye `canCastMagic` + `inGame` y se envía en varios momentos (connect/config/accept/start/reconnect).
   - Gamepad usa `globalState.canCastMagic` y el sync no salta la configuración.
9. **Validación manual (checklist)** — Pendiente (no marcada)
   - Un mago abre el pergamino, selecciona “Proyectil mágico”, lanza y no consume nada.
   - Un mago con “Congelación (3)” lo usa 3 veces y el item desaparece.
   - Un no-mago con un item de hechizo pero sin `grantsMagic` no puede abrir el pergamino (o no ve hechizos).
   - Un no-mago con item `grantsMagic` sí puede abrir el pergamino y lanzar hechizos.
   - Con pergamino abierto, el joystick no mueve el cursor del mapa.
