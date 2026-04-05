# Rogue TV - Dungeon Crawler 2D

Un juego dungeon crawler 2D desarrollado con Svelte 5, TypeScript y Vite. Explora mazmorras, gestiona tu inventario y descubre secretos en este juego de estilo retro con efectos visuales CRT.

## 🎮 Características

- **Sistema de turnos**: Controla múltiples personajes en un sistema por turnos
- **Niebla de guerra**: Explora áreas oscuras que se revelan al avanzar
- **Gestión de inventario**: Intercambia objetos entre personajes
- **Sprites pixel art**: Gráficos retro con spritesheets organizadas
- **Efectos CRT**: Estética visual de pantalla de tubo
- **Sistema de audio**: Efectos de sonido para acciones del juego
- **Pathfinding inteligente**: Movimiento automático con easystarjs
- **Mapas TMX**: Carga de mapas creados con Tiled

## 🚀 Cómo ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la construcción
npm run preview
```

## 🛠️ Tecnologías

- **Svelte 5**: Framework frontend reactivo
- **TypeScript**: Tipado estático para mayor robustez
- **Vite**: Build tool rápido y moderno
- **easystarjs**: Biblioteca de pathfinding A\*
- **parse-tmx**: Parser para mapas TMX (Tiled)

## 📁 Estructura del proyecto

```
rogue-tv/
├── public/           # Assets estáticos
│   ├── spritesheets/ # Sprites del juego
│   ├── sounds/       # Efectos de sonido
│   └── images/       # Imágenes de fondo y UI
├── src/
│   ├── lib/          # Componentes y lógica del juego
│   │   ├── Game.svelte      # Componente principal
│   │   ├── GameMap.svelte   # Mapa del juego
│   │   ├── Player.svelte    # Control de personajes
│   │   ├── state.svelte.ts  # Estado global
│   │   └── ...              # Más componentes
│   └── App.svelte    # Punto de entrada
└── package.json      # Dependencias y scripts
```

## 🎯 Controles

- **N**: Cambiar al siguiente personaje
- **Click**: Interactuar con el entorno
- **Drag & Drop**: Mover objetos en el inventario

## 🎨 Assets

El juego incluye:

- Spritesheets para personajes y objetos (fuente: [32 Rogues by SethBB](https://sethbb.itch.io/32rogues))
- Efectos de sonido para acciones
- Fuente Pixelify Sans para estilo retro
- Texturas de fondo y efectos VHS

## 📄 Licencia

Este proyecto es de código abierto. Consulta los archivos de licencia en los directorios de fuentes y assets.

---

_Desarrollado con Svelte 5 y TypeScript_
