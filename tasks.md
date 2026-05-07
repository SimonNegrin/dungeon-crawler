# Tareas Pendientes - Rogue TV: Dungeon Crawler 2D

## Estado Actual del Proyecto

### Proyectos en el Workspace

| Proyecto             | Ruta                              | Estado                                               |
| -------------------- | --------------------------------- | ---------------------------------------------------- |
| **dungeon-tv**       | `dungeon-tv/`                     | Host principal del juego (Svelte 5 + Vite)           |
| **rogue-gamepad**    | `rogue-gamepad/`                  | ✅ Cliente móvil funcional (Svelte 5 + Tailwind)     |
| **signaling-server** | `../gamepad/v1/signaling-server/` | ✅ Servidor WebSocket funcional (Node.js + ws)       |
| **rooms_editor**     | `rooms_editor/`                   | Editor de mapas por habitaciones (Svelte 5 + Canvas) |
| **maze_generator**   | `maze_generator/`                 | Generador de laberintos (algoritmo Blobby Division)  |

### Lo que ya funciona

- **Servidor de señalización** (`signaling-server/index.js`): WebSocket que gestiona salas, broadcasting de ofertas/answers/candidatos ICE, ping/pong. Puerto 6100.
- **Cliente móvil** (`rogue-gamepad/`): Se conecta al signaling server vía `VITE_SIGNALING_SERVER`, recibe oferta WebRTC, responde con answer, y establece canal de datos. Tiene:
  - Pantalla de configuración de personaje con 8 presets y stats configurables
  - Joystick táctil con detección de 8 direcciones
  - Botones A/B/C/D con iconos de items
  - Envío de gamepad state empaquetado en 1 byte
  - Flujo completo: Conexión → Configuración → Ready → InGame → MyTurn/WaitingMyTurn
- **Conexión WebRTC**: Protocolo de paquetes binarios con tipos: GAMEPAD_STATE (1), MENU (2), PLAYER_CONFIG (3), PLAYER_ACCEPT (4), PLAYER_READY (5), GAME_START (6), ENABLE_TURN (7), DISABLE_TURN (8), NEXT_PLAYER (9)

---

## Prioridad Crítica (Imprescindible para jugar)

### 1. Servidor TURN funcional

- **Archivos**: `dungeon-tv/src/lib/helpers/common.ts`, `rogue-gamepad/src/lib/connection.svelte.ts`
- **Descripción**: Las credenciales de Metered.ca actuales pueden no funcionar en producción. Contratar un servicio TURN o configurar un servidor propio para asegurar la conectividad WebRTC en redes NAT.

---

## Prioridad Alta (Core del juego)

### 2. Game Over y Fin de Partida

- **Archivo**: `dungeon-tv/src/lib/helpers/game.ts` (TODO en `nextPlayer`)
- **Descripción**: Implementar detección de fin de partida cuando todos los jugadores están muertos o se completa el objetivo del mapa. Mostrar pantalla de resultados.

### 3. Sistema de Animaciones

- **Archivo**: `dungeon-tv/src/lib/helpers/animations.ts`
- **Descripción**: Implementar el sistema de animaciones (actualmente vacío). Necesario para:
  - Efectos de uso de objetos consumibles (pociones, comida)
  - Animaciones de daño recibido
  - Efectos visuales de buffs/debuffs

### 4. Objetos Consumibles

- **Archivo**: `dungeon-tv/src/lib/helpers/items.ts` (comentado)
- **Descripción**: Descomentar y completar la lógica de objetos consumibles:
  - Queso, pan, manzana (restauran vida)
  - Poción de vida, velocidad, fuerza, invisibilidad, etéreo
  - Implementar efectos temporales (buff turns)

### 5. Puertas Cerradas con Llave

- **Archivo**: `dungeon-tv/src/lib/helpers/players.ts` (función `interact`)
- **Descripción**: Implementar la lógica de puertas que requieren llave. Actualmente las puertas se abren siempre. Vincular con objetos tipo "key" en el inventario.

### 6. Poblado de Mapas con Items

- **Archivos**: `public/spritesheets/stage_1/map.json`, `public/spritesheets/stage_2/map.json`
- **Descripción**: Los cofres en los mapas tienen arrays de items vacíos. Poblarlos con objetos reales de los prefabs.

### 7. Ocultar botones del gamepad según habilidades

- **Archivo**: `rogue-gamepad/src/lib/Gamepad.svelte`
- **Descripción**: El gamepad no debe mostrar botones para los que el jugador no tenga habilidad (ej: ocultar botón de magia si `magic = 0`, ocultar botón de arco si `aim = 0`). Requiere enviar las stats del jugador al gamepad después de aceptar la configuración.

### 8. Mostrar salud en la vista de PlayerStats del gamepad

- **Descripción**: Los puntos de salud se deben ver en la interfaz del gamepad durante la partida. Actualmente no hay feedback visual de la vida del personaje.

---

## Prioridad Media (Mejoras de gameplay)

### 9. IA de Monstruos más Inteligente

- **Archivo**: `dungeon-tv/src/lib/helpers/MonstersController.ts`
- **Descripción**: Mejorar el comportamiento de los monstruos:
  - Patrullaje cuando no hay jugadores cerca
  - Comportamiento de huida cuando tienen poca vida
  - Diferentes personalidades/estrategias por tipo de monstruo

### 10. Sistema de Sonido Completo

- **Archivo**: `dungeon-tv/src/lib/helpers/audio.ts`
- **Descripción**: Integrar los sonidos predefinidos con las acciones del juego. Actualmente los sonidos están cargados pero no se reproducen en la mayoría de acciones.

### 11. Efectos Visuales (CRT/VHS)

- **Archivo**: `dungeon-tv/src/lib/Game.svelte`
- **Descripción**: Los efectos CRT y VHS están comentados en el componente Game. Decidir si se implementan o se eliminan.

### 12. Múltiples Mapas y Transiciones

- **Archivo**: `dungeon-tv/src/lib/helpers/StageLoader.ts`
- **Descripción**: Implementar transiciones entre mapas (escaleras, puertas de salida). Cargar stage_1 y stage_2 secuencialmente.

### 13. Sistema de Experiencia y Subida de Nivel

- **Descripción**: Actualmente no hay sistema de progresión. Implementar ganancia de XP al matar monstruos y subida de nivel con mejora de stats.

### 14. Mejora del Player Preview en Landing

- **Archivo**: `dungeon-tv/src/lib/Landing.svelte`
- **Descripción**: Mejorar la vista previa del jugador en la pantalla de inicio para que muestre más información (stats, sprite) cuando un jugador se conecta.

### 15. Limitar a 6 jugadores máximos

- **Archivos**: `dungeon-tv/src/lib/Landing.svelte`, mapas stage_1 y stage_2
- **Descripción**: Limitar el número máximo de jugadores a 6. Añadir 6 puntos de spawn en el mapa stage_2.

### 16. Reconexión de jugador ante pérdida de conexión

- **Descripción**: Implementar lógica de reconexión cuando un jugador pierde la conexión WebRTC, permitiendo reincorporarse a la partida.

---

## Prioridad Baja (Calidad de vida)

### 17. Pantalla de Ayuda / Tutorial

- **Descripción**: Añadir una pantalla con instrucciones de control y mecánicas del juego, accesible desde el menú principal.

### 18. Mejoras en la Interfaz de Inventario

- **Archivo**: `dungeon-tv/src/lib/InventoryExchange.svelte`
- **Descripción**: Mejorar la usabilidad del intercambio de items entre jugadores. Añadir tooltips y descripciones de items.

### 19. Persistencia de Partidas

- **Descripción**: Guardar el estado de la partida en localStorage para poder retomarla más tarde.

### 20. Modo Espectador

- **Descripción**: Permitir a jugadores muertos seguir la partida como espectadores.

### 21. Tests Automatizados

- **Descripción**: Añadir tests unitarios para la lógica core (combate, pathfinding, visión) y tests de integración para WebRTC.

### 22. Aplicar paleta de colores mejorada

- **Descripción**: Actualizar los estilos visuales del juego con la paleta de colores definida en el proyecto.

### 23. Editor de Mapas (rooms_editor)

- **Archivo**: `rooms_editor/`
- **Descripción**: El editor de mapas por habitaciones está en estado inicial. Permite dibujar celdas (suelo, pared, puerta, spawn) y exportar a JSON. Pendiente:
  - Vincular la exportación con el formato de mapas del juego
  - Añadir más tipos de celdas (cofres, decoración)
  - Integrar la generación procedural con maze_generator

### 24. Generación Procedural de Mapas

- **Archivo**: `maze_generator/MazeGenerator.js`
- **Descripción**: Implementar el algoritmo Blobby Division para generar mazmorras proceduralmente. Pendiente:
  - Integrar la salida del generador con el formato TMX del juego
  - Conectar con rooms_editor para post-procesado

---

## Resumen de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    signaling-server (Node.js)                │
│                    WebSocket puerto 6100                     │
│              Gestiona salas y señalización WebRTC            │
└──────────┬──────────────────────────────────┬────────────────┘
           │ WebSocket                         │ WebSocket
           │ (createroom/joinroom/broadcast)   │ (joinroom)
           ▼                                   ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│     dungeon-tv (Host)    │    │    rogue-gamepad (Móvil)     │
│   Svelte 5 + TypeScript  │    │   Svelte 5 + Tailwind CSS    │
│                          │    │                              │
│  - Renderizado del mapa  │    │  - Joystick táctil 8 dir.   │
│  - Lógica de juego       │◄──►│  - Botones A/B/C/D          │
│  - IA de monstruos       │    │  - Configuración personaje  │
│  - Gestión de estado     │    │  - Feedback visual           │
│  - Códec QR para unirse  │    │  - Pantalla completa         │
└──────────────────────────┘    └──────────────────────────────┘
         WebRTC (datachannel) - Paquetes binarios

┌──────────────────────────┐    ┌──────────────────────────────┐
│    rooms_editor (Herramienta) │  maze_generator (Herramienta)│
│  Editor de mapas por hab. │    │  Generación procedural      │
│  Svelte 5 + Canvas        │    │  Blobby Division algorithm  │
└──────────────────────────┘    └──────────────────────────────┘
```

### Protocolo WebRTC (Paquetes Binarios)

| ID  | Constante           | Descripción                               | Origen       |
| --- | ------------------- | ----------------------------------------- | ------------ |
| 1   | `PKT_GAMEPAD_STATE` | Estado del joystick + botones (1 byte)    | Móvil → Host |
| 2   | `PKT_MENU`          | Acción de menú                            | Ambos        |
| 3   | `PKT_PLAYER_CONFIG` | Configuración actual del personaje (JSON) | Móvil → Host |
| 4   | `PKT_PLAYER_ACCEPT` | Configuración final aceptada (JSON)       | Móvil → Host |
| 5   | `PKT_PLAYER_READY`  | Jugador listo para empezar                | Móvil → Host |
| 6   | `PKT_GAME_START`    | Inicio de la partida                      | Host → Móvil |
| 7   | `PKT_ENABLE_TURN`   | Activar turno del jugador                 | Host → Móvil |
| 8   | `PKT_DISABLE_TURN`  | Desactivar turno del jugador              | Host → Móvil |
| 9   | `PKT_NEXT_PLAYER`   | Pasar al siguiente jugador                | Móvil → Host |

### Formato del Gamepad State (1 byte)

```
Bits:  7     6     5     4     3     2     1     0
      ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
      │ TOP │ RGT │ BOT │ LFT │  A  │  B  │  C  │  D  │
      └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
       Joystick (4 bits)      Botones (4 bits)
```
