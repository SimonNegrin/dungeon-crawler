# Plan de Reconexión de Jugadores

## Objetivo

Permitir que un jugador que pierde la conexión (WebRTC) pueda reconectarse al juego sin perder su progreso. Mientras está desconectado, su turno se salta automáticamente para que el resto de jugadores puedan seguir jugando.

---

## 1. Detección de desconexión

### Estado actual

- El signaling server envía `peerclose` cuando un WebSocket se cierra.
- `SignalingConnection.ts` define el evento `peerclose` pero **no se usa** en `PlayerBinding.svelte`.
- No hay detección de caída del dataChannel (RTCDataChannel) ni de la conexión ICE.

### Cambios necesarios

**En `PlayerBinding.svelte`:**

- Escuchar el evento `peerclose` del signaling para detectar cuando el gamepad se desconecta.
- Escuchar `dataChannel.onclose` para detectar caída del canal de datos.
- Escuchar `peerConnection.oniceconnectionstatechange` para detectar cambios en la conexión ICE (estados `disconnected`, `failed`).
- Cuando se detecte una desconexión, marcar el jugador como desconectado en el estado global.

**En `IPlayerConnection` (types.d.ts):**

- Añadir propiedad `isConnected: boolean` para saber si el jugador tiene conexión activa.

---

## 2. Nuevo componente `PlayerHero.svelte`

### Ubicación

`/Users/simon/Proyectos/rogue/dungeon-tv/src/lib/PlayerHero.svelte`

### Responsabilidad

Reemplazar el uso directo de `ActorStats.svelte` en `PlayersList.svelte`. Este componente mostrará:

- **Jugador conectado**: Renderiza `ActorStats` con los datos del actor (comportamiento actual).
- **Jugador desconectado**: Renderiza `PlayerBinding` para mostrar un QR de reconexión.

### Props

```ts
let {
  player,
}: {
  player: IPlayerConnection
} = $props()
```

### Comportamiento

- Si `player.isConnected === true` → mostrar `<ActorStats actor={player.actor} />`
- Si `player.isConnected === false` → mostrar `<PlayerBinding playerId={player.playerId} onconnection={handleReconnection} />`

### Integración en `PlayersList.svelte`

- Reemplazar `<ActorStats actor={player.actor} />` por `<PlayerHero player={player} />`.

---

## 3. Mecanismo de reconexión

### Flujo

1. **Dungeon-TV detecta desconexión** → marca `player.isConnected = false`.
2. **Dungeon-TV mantiene el actor del jugador** en `gameState.players` con su estado actual (stats, posición, items, salud).
3. **`PlayerHero.svelte`** detecta `!isConnected` y muestra `PlayerBinding` con un nuevo QR.
4. **El gamepad escanea el QR** y establece una nueva conexión WebRTC.
5. **Dungeon-TV recibe la nueva conexión** y en lugar de crear un actor nuevo, **asigna el nuevo peer/channel al `IPlayerConnection` existente**.
6. **Dungeon-TV envía el estado completo del jugador** al gamepad reconectado.

### Nuevo paquete: `PKT_PLAYER_STATE_SYNC`

**En `connections.ts` (dungeon-tv):**

```ts
export const PKT_PLAYER_STATE_SYNC = 11
```

**Estructura del paquete:**

```
[PKT_PLAYER_STATE_SYNC][JSON del estado del jugador]
```

El JSON incluirá:

```ts
interface IPlayerSyncState {
  sprite: RogueName
  name: string
  genre: PlayerGenre
  health: number
  maxHealth: number
  movement: number
  actions: number
  attack: number
  defence: number
  aim: number
  magic: number
}
```

### En el gamepad (`rogue-gamepad`)

**En `main.ts`:**

- Escuchar `PKT_PLAYER_STATE_SYNC` para restaurar el estado del jugador.
- Al recibirlo, actualizar `globalState` con los datos recibidos:
  - `globalState.player` con sprite, nombre, género.
  - `globalState.health` y `globalState.maxHealth`.
  - `globalState.inGame = true` (si la partida ya empezó).

**En `connection.svelte.ts`:**

- Añadir `PKT_PLAYER_STATE_SYNC` a los constantes.
- Asegurar que `clearConnection()` se llame al reconectar para limpiar la conexión anterior.

---

## 4. Salto de turno para jugadores desconectados

### Estado actual

- `nextPlayer()` en `game.ts` itera sobre `gameState.players` y busca el siguiente jugador vivo.
- No considera si el jugador está conectado o no.

### Cambios necesarios

**En `game.ts`:**

- Modificar `nextAlivePlayerIndex()` para que también verifique `player.isConnected`.
- Un jugador desconectado se salta igual que si estuviera muerto.
- Cuando el jugador se reconecte, volverá a tener turno normalmente.

```ts
function nextAlivePlayerIndex(): number {
  const players = gameState.players
  const nextIndex = gameState.playerIndex + 1

  const priorized = [
    ...players.slice(nextIndex),
    ...players.slice(0, nextIndex),
  ]

  const next = priorized.findIndex((player) => {
    return player.actor.isAlive && player.isConnected
  })

  if (next === -1) {
    return -1
  }

  return (nextIndex + next) % players.length
}
```

---

## 5. Gestión del roomId para reconexión

### Problema actual

- `PlayerBinding.svelte` usa un `roomId` fijo (`"3612f737-13d5-42d5-8da9-dbf5a9533072"`).
- Al reconectar, se necesita el mismo `roomId` para que el gamepad pueda unirse a la misma sala.

### Cambios necesarios

**En `PlayerBinding.svelte`:**

- Almacenar el `roomId` como propiedad del componente para poder reutilizarlo en reconexiones.
- No generar un nuevo `roomId` al reconectar, usar el mismo.
- Escuchar `peerclose` para detectar que el gamepad se fue y poder mostrar el QR de nuevo.

**En `Landing.svelte`:**

- La prop `playerId` se regenera con `crypto.randomUUID()` tras cada conexión. Para reconexión, **no debe regenerarse** o debe mantenerse el mismo ID.

---

## 6. Resumen de tareas

### dungeon-tv

| #   | Tarea                                                                                | Archivo                          |
| --- | ------------------------------------------------------------------------------------ | -------------------------------- |
| 1   | Añadir `isConnected` a `IPlayerConnection`                                           | `src/lib/types.d.ts`             |
| 2   | Detectar desconexión (peerclose, dataChannel.onclose, ICE state)                     | `src/lib/PlayerBinding.svelte`   |
| 3   | Marcar `isConnected = false` en el estado global al desconectarse                    | `src/lib/PlayerBinding.svelte`   |
| 4   | Crear `PlayerHero.svelte` que muestre `ActorStats` o `PlayerBinding` según conexión  | `src/lib/PlayerHero.svelte`      |
| 5   | Modificar `PlayersList.svelte` para usar `PlayerHero`                                | `src/lib/PlayersList.svelte`     |
| 6   | Añadir `PKT_PLAYER_STATE_SYNC` y handler para enviar estado al reconectar            | `src/lib/helpers/connections.ts` |
| 7   | En la reconexión, reutilizar el `IPlayerConnection` existente (no crear nuevo actor) | `src/lib/PlayerBinding.svelte`   |
| 8   | Modificar `nextAlivePlayerIndex()` para saltar jugadores desconectados               | `src/lib/helpers/game.ts`        |
| 9   | Mantener el mismo `roomId` para reconexiones                                         | `src/lib/PlayerBinding.svelte`   |

### rogue-gamepad

| #   | Tarea                                                           | Archivo                        |
| --- | --------------------------------------------------------------- | ------------------------------ |
| 1   | Añadir constante `PKT_PLAYER_STATE_SYNC`                        | `src/lib/contants.ts`          |
| 2   | Escuchar `PKT_PLAYER_STATE_SYNC` y restaurar estado del jugador | `src/main.ts`                  |
| 3   | Añadir `maxHealth` al `globalState` si no existe                | `src/lib/state.svelte.ts`      |
| 4   | Asegurar que `clearConnection()` se llame antes de reconectar   | `src/lib/connection.svelte.ts` |

---

## 7. Consideraciones adicionales

- **UI de desconexión**: En `PlayerHero.svelte`, cuando el jugador está desconectado, se podría mostrar el sprite en gris/desvanecido además del QR.
- **Múltiples reconexiones**: El sistema debe permitir reconexiones múltiples (un jugador puede perder la conexión varias veces).
- **Timeout**: Considerar añadir un timeout para limpiar jugadores que llevan demasiado tiempo desconectados (opcional, para una futura iteración).
- **Estados del gamepad**: El gamepad debe poder volver al estado de "conexión" (mostrar QR) si pierde la conexión, sin necesidad de recargar la página.
