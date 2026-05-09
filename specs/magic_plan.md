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

## Input / State machine (dungeon-tv)

Reutilizar el mismo paquete `PKT_GAMEPAD_STATE` y cambiar el “routing” del input según estado:

- Si `magicMenuOpen`:
  - joystick ↑/↓ => cambia `magicMenuIndex`
  - botón Magic => intenta lanzar el hechizo seleccionado
  - botón Caminar => cierra sin lanzar
  - se ignoran movimientos de cursor y el resto de acciones (ataque físico/disparo)
- Si `magicMenuOpen` es `false`:
  - comportamiento actual (mover cursor, atacar, disparar, etc.)
  - botón Magic => abre el pergamino (si `canCastMagic(currentPlayer.actor)`)

## Casting (pipeline unificado)

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
   - si `uses <= 0`: `removeItemByName(actor, item.name)`

## Hechizos iniciales (mínimo para validar el sistema)

- **Proyectil mágico** (base, infinito)
  - Tipo: proyectil (reutiliza fireball actual)
  - Requiere target (monstruo)
- **Hechizo de congelación** (por item, ej. 3 usos)
  - Tipo: efecto sobre objetivo
  - Requiere target (monstruo)
  - Efecto sugerido: aplicar un estado “frozen” por N turnos que impide actuar al monstruo

Nota: la implementación del estado puede apoyarse en `traits` con `metadata.turns`, y el controlador de turnos de monstruos debería decrementar turnos y saltarse la acción si está congelado.

## Sincronización con el gamepad (rogue-gamepad)

Objetivo: que el gamepad muestre/oculte el botón Magic de forma correcta, incluyendo el caso “habilidad mágica otorgada por item”.

Plan:

1. En dungeon-tv, al enviar `PKT_PLAYER_STATE_SYNC`, incluir un booleano adicional `canCastMagic`.
2. En rogue-gamepad, almacenar ese booleano en `globalState.player` (o un campo separado) y usarlo para renderizar los botones de magia.
3. Mantener compatibilidad:
   - Si el campo no existe (clientes antiguos), fallback a `magic > 0`.

## Paso a paso (implementación)

1. **Añadir modelo de hechizos**
   - Crear registro de hechizos y tipos (`spellId`, definición, cast handler).
   - Añadir helpers: `canCastMagic(actor)`, `getAvailableSpells(actor)`.
2. **Extender metadata de items**
   - Añadir `grantsMagic?: boolean` y `spellId?: string` en `ItemMetadata`.
   - Ajustar `ItemStats` para mostrar “Habilidad mágica” y/o “Hechizo: X” si procede.
3. **Crear items de hechizo en prefabs**
   - Añadir al menos un item “Pergamino de congelación” con `metadata.spellId="freeze"` y `metadata.uses=3`.
   - (Opcional) añadir un item que otorgue magia a un no-mago: `metadata.grantsMagic=true`.
4. **Overlay del pergamino**
   - Crear componente UI del pergamino y renderizarlo en el monitor.
   - Añadir estado a `gameState` para abrir/cerrar y seleccionar.
5. **Actualizar manejo de input**
   - Modificar el handler de `PKT_GAMEPAD_STATE` para rutear input según `magicMenuOpen`.
   - Asegurar que al abrir el pergamino no se mueve el cursor (ni se atacan monstruos accidentalmente).
6. **Implementar el pipeline de casting**
   - Centralizar validaciones (acciones, rango, LoS, target).
   - Integrar consumo de usos y eliminación del item.
   - Reutilizar el proyectil mágico existente como hechizo base.
7. **Implementar “congelación”**
   - Añadir el estado “frozen” (trait/item temporal) a monstruos.
   - Integrar en el loop de monstruos: si frozen, perder turno y decrementar `turns`.
8. **Sincronizar disponibilidad de magia con el gamepad**
   - Extender el payload de sync del jugador (dungeon-tv).
   - Ajustar UI del gamepad para usar `canCastMagic` (o fallback).
9. **Validación manual (checklist)**
   - Un mago abre el pergamino, selecciona “Proyectil mágico”, lanza y no consume nada.
   - Un mago con “Congelación (3)” lo usa 3 veces y el item desaparece.
   - Un no-mago con un item de hechizo pero sin `grantsMagic` no puede abrir el pergamino (o no ve hechizos).
   - Un no-mago con item `grantsMagic` sí puede abrir el pergamino y lanzar hechizos.
   - Con pergamino abierto, el joystick no mueve el cursor del mapa.
