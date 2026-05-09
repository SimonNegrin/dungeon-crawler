# Mejoras del Player Preview en Landing (Tarea 14)

Lista de mejoras planificadas para el componente PlayerPreview en la pantalla de Landing.

## Estado

- ✅ **Punto 3** — Implementado
- ✅ **Punto 4** — Implementado
- ✅ **Punto 6** — Implementado
- ⬜ Resto de puntos — Pendientes

---

### 1. Mostrar barra de vida (HealthBar)

Actualmente el preview solo muestra el valor numérico de salud con un icono de manzana. Integrar el componente `HealthBar` (ya existente en el proyecto) para dar una representación visual más clara de la vida del jugador.

### 2. Mostrar nombre del jugador más destacado

El nombre del jugador aparece actualmente en el `header` pero es muy pequeño y se mezcla con el sprite. Darle más protagonismo con un estilo más visible (fuente más grande, contraste, etc.).

### 3. ✅ Indicador visual de estado (Waiting vs Ready)

Añadido un badge flotante en la esquina superior derecha que muestra el texto según el estado:

- **"Conectado"** — estado inicial
- **"Esperando..."** — cuando `isWaiting = true`
- **"¡Listo!"** — cuando `isReady = true`

### 4. Ocultar stats que están a 0

Siguiendo el patrón de `ActorStats.svelte`, ocultar stats como `aim` y `magic` cuando su valor es 0 para no ocupar espacio innecesario.

### 5. Mejorar el layout general del preview

El tamaño actual de 120x144px es muy pequeño. Propuestas:

- Aumentar el tamaño de cada tarjeta de jugador
- Mejorar la distribución en grid de las stats
- Hacer que el sprite del personaje sea más grande y visible

### 6. Añadir animación de entrada para nuevos jugadores

Cuando un jugador se conecta, su tarjeta aparece de golpe. Una pequeña animación de entrada (fade-in / slide-in) mejoraría la experiencia visual.

### 7. Reorganizar el espacio en Landing para mejor distribución

Actualmente los `PlayerPreview` y `PlayerBinding` se muestran en un contenedor flex horizontal dentro del 50% inferior del landing. Con las tarjetas más grandes, ajustar el layout para que se distribuyan mejor (filas de 3 o con wrapping).
