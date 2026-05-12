# Plan: Proyectiles mágicos (VFX + estados)

## Objetivo

Mejorar el sistema de proyectiles mágicos para soportar múltiples animaciones/variantes y colores por hechizo, y añadir señalización visual persistente en enemigos afectados por estados de varios turnos (congelado, ardiendo, confundido, etc.).

## Contexto actual (resumen)

- Pipeline de proyectiles: `projectileTo` emite `events.shoot` y `Projectiles.svelte` monta el componente según `projectilesMap`.
- Hechizos: `castSpell(...)` resuelve y ejecuta `SPELLS[spellId].cast(...)`.
- Estado “Congelado” ya existe como trait con `metadata.frozen=true` + `turns`, y el turno de monstruos lo consume/decrementa.

## Iteración 0 — Inventario técnico (sin cambios de gameplay)

Completado: Sí

### Pipeline actual confirmado

#### Tipos (`src/lib/types.d.ts`)

- `IProjectileConfig` — `id: Symbol`, `from: Actor`, `target: Actor`, `type: ProjectileType`, `tint?: string`, `impactTint?: string`. Ya soporta los campos de color base.
- `ProjectileType` = `"arrow" | "fireball"` — union type; añadir nuevos tipos requiere extender aquí.
- `ProjectileComponent` = `Component<{ config: IProjectileConfig }>` — interfaz estándar para componentes de proyectil.
- `ItemMetadata` — ya tiene `frozen?: boolean`, `turns?: number`, `ethereal?: boolean`, `magic?: boolean`, `grantsMagic?: boolean`, `spellId?: string`, `spellPower?: number`. No tiene campos para `burning`, `confused`, etc.

#### Mapa de proyectiles (`src/lib/helpers/combat.ts`)

- `projectilesMap: Record<ProjectileType, ProjectileComponent>` — mapea `"arrow"` → `ProjectileArrow`, `"fireball"` → `ProjectileMagicFireball`. Punto de registro para nuevos componentes.
- `projectileTo(config)` — emite `events.shoot(config)`, espera `events.shootCompleted` con mismo `id`. Devuelve `Promise<void>`.
- `attackRoll(attack, defence)` y `damage(target, hits)` — usadas dentro de los `ontarget()` de cada proyectil. La lógica de daño está acoplada al componente.

#### Eventos (`src/lib/helpers/common.ts`)

- `events.shoot: EventBus<IProjectileConfig>` — dispara la creación visual del proyectil.
- `events.shootCompleted: EventBus<IProjectileConfig>` — señal de que el proyectil terminó (impacto + animación).

#### Render de proyectiles (`src/lib/Projectiles.svelte`)

- Montado en `GameMap.svelte` > `.gameboard` (capa z-index: 100+).
- Escucha `events.shoot` → añade config al array reactivo.
- Escucha `events.shootCompleted` → filtra por `config.id` para eliminar.
- Renderiza `{#each projectiles as config (config.id)}` usando `projectilesMap[config.type]`.
- Sin límite de proyectiles simultáneos; limpia por id.

#### Componente base (`src/lib/Projectile.svelte`)

- Recibe `config`, `children` (Snippet), `ontarget` (callback).
- Anima posición con transición Svelte custom (`in:animation`) interpolando `from.position → target.position`.
- `duration = distance * 150ms`.
- Llama `ontarget()` en `onintroend` (cuando el proyectil llega al destino).
- No contiene lógica de daño/estado — eso queda en el `ontarget` del componente hijo.

#### Flecha (`src/lib/ProjectileArrow.svelte`)

- Wrapper de `Projectile.svelte`.
- `ontarget()`: usa `attackRoll(aim, defence)` → `damage(target, hits)` → `events.shootCompleted.emit(config)`.
- Soporta `config.tint` via `style:background-color` en el div `.arrow`.
- Sin animación de impacto (la flecha simplemente desaparece al llegar).
- Sonido: `arrowShootSound` en `onMount`.

#### Bola de fuego (`src/lib/ProjectileMagicFireball.svelte`)

- Wrapper de `Projectile.svelte`.
- `ontarget()`: usa `attackRoll(magic, defence)` → `damage(target, hits)` → `events.shootCompleted.emit(config)`.
- Soporta `config.tint` (bullet) y `config.impactTint` (explosión) con fallbacks:
  - `bulletTint = config.tint ?? "var(--color-mild-yellow-white)"`
  - `impactTint = config.impactTint ?? config.tint ?? "var(--color-gold-yellow)"`
- Usa `Animation.svelte` para la explosión con spritesheet `/animations/explotions.png` (12 keyframes).
- Sonidos: `magicShootSound` en `onMount`, `magicFireSound` en `ontarget`.

#### Sistema de animación (`src/lib/Animation.svelte`)

- Recibe `animation: IAnimation` (`spritesheet`, `size`, `keyframes`) y `color: string`.
- Renderiza con `mask-image` + `background-color` — **no necesita assets tintados**, el color se aplica por CSS.
- `play()` itera keyframes con `await waitTime(40)` entre cada uno.
- **Reutilizable para cualquier VFX de impacto** simplemente cambiando spritesheet y keyframes.

#### Disparadores de proyectiles

- `shootMonster()` en `players.ts` → `projectileTo({ type: "arrow" })` — sin tint.
- `magickAttack()` en `players.ts` → `castSpell({ spellId: "magic_projectile" })`.
- `SPELLS.magic_projectile.cast()` en `spells.ts` → `projectileTo({ type: "fireball", tint: "var(--color-mild-yellow-white)", impactTint: "var(--color-gold-yellow)" })`.
- `SPELLS.freeze.cast()` en `spells.ts` → añade trait `frozen` al target, **sin proyectil visual** (es `type: "effect"`).

### Punto natural para overlays persistentes en enemigos

#### `Avatar.svelte` (ya tiene el patrón)

- Patrón existente para **frozen**:
  1. Helper en `common.ts`: `isFrozen(character)` busca `metadata.frozen === true` en traits+items.
  2. En `Avatar.svelte`: `let frozen = $derived(isFrozen(actor))`.
  3. Clase CSS `.frozen` + `<div class="frozen-overlay">` condicional.
  4. Overlay usa `radial-gradient`, `mix-blend-mode: screen`, `box-shadow`, animación `frozen-shimmer`.
- **Extensión natural**: mismo patrón para burning, confused, etc. — nuevo helper, nueva clase CSS, nuevo overlay div.
- El overlay **no interfiere** con el sprite (usa `pointer-events: none`, `position: absolute`, `inset: 0`).

#### `MonstersController.tickFrozen()` en `MonstersController.ts`

- Ya decrementa `turns` del trait frozen y lo elimina al expirar.
- **Punto de extensión**: generalizar `tickFrozen()` → `tickStatuses()` que itere sobre una lista de estados (frozen, burning, confused…) decrementando `turns` y eliminando al expirar.

### API mínima definida para VFX

```typescript
// IProjectileConfig ya tiene todo lo necesario para color:
interface IProjectileConfig {
  id: Symbol
  from: Actor
  target: Actor
  type: ProjectileType // ← extender con nuevos tipos o hacer genérico
  tint?: string // ✅ ya existe: color del proyectil en vuelo
  impactTint?: string // ✅ ya existe: color del impacto/explosión
  variant?: "bolt" | "orb" | "shard" // 🆕 propuesto: variante visual
}
```

**Hallazgos clave:**

- `tint` e `impactTint` **ya están implementados** y se propagan correctamente en `ProjectileArrow` y `ProjectileMagicFireball`.
- `Animation.svelte` soporta `color` por máscara CSS → cualquier animación de impacto puede tintarse sin modificar assets.
- Para añadir **variantes visuales** (bolt/orb/shard) se necesita:
  - Añadir `variant` a `IProjectileConfig` (opcional)
  - Un componente genérico `MagicProjectile.svelte` que lea `variant` + `tint`/`impactTint` y renderice distinto bullet/impacto según la variante
  - Definir animaciones de impacto por variante (spritesheet + keyframes)
- `ProjectileType` puede mantenerse como union type o evolucionar a un tipo genérico `"magic"` parametrizable por config, evitando multiplicar tipos.
- La lógica de daño **está acoplada** a `ontarget()` de cada componente (no en hechizos para `fireball`/`arrow`). Para hechizos nuevos, `spell.cast()` ya centraliza la lógica; el proyectil debería ser solo visual.

## Iteración 1 — Colores configurables en proyectiles (base)

Completado: Sí

- Extender `IProjectileConfig` para soportar estilo visual, por ejemplo:
  - `tint?: string`
  - `impactTint?: string` (si aplica)
- Actualizar proyectiles existentes para leer el color desde `config`:
  - Flecha: color de `.arrow`
  - Proyectil mágico: `Animation.svelte` ya soporta `color` por máscara; propagar desde `config`
- Validación manual:
  - Un mismo hechizo/proyectil se puede renderizar en distintos colores sin tocar assets

## Iteración 2 — Separar VFX del proyectil del efecto del hechizo (escalabilidad)

Completado: Sí

- Evitar que el componente del proyectil contenga lógica de daño/estado. ✅
- Mover el «efecto» (daño/estado) al `spell.cast(...)`, y dejar el proyectil como visual (o un «onImpact» genérico). ✅
- Beneficio: reutilizar un mismo proyectil visual para múltiples hechizos/efectos sin duplicar lógica. ✅

### Cambios realizados

- **`types.d.ts`**: añadido `onImpact?: (config: IProjectileConfig) => void` a `IProjectileConfig`.
- **`ProjectileArrow.svelte`**: eliminados imports de `attackRoll`/`damage`; `ontarget()` ahora solo llama `config.onImpact?.(config)` + emite `shootCompleted`.
- **`ProjectileMagicFireball.svelte`**: eliminados imports de `attackRoll`/`damage`; `ontarget()` ahora solo llama `config.onImpact?.(config)` + sonido + animación de explosión + emite `shootCompleted`.
- **`players.ts` (`shootMonster`)**: pasa `onImpact` con `attackRoll(aim, defence)` → `damage()`.
- **`spells.ts` (`SPELLS.magic_projectile.cast`)**: pasa `onImpact` con `attackRoll(magic, defence)` → `damage()`.

Los componentes de proyectil son ahora **puramente visuales**. La lógica de daño/efecto reside en el caller (hechizo o acción de jugador), permitiendo reutilizar el mismo componente visual con distintos efectos.

## Iteración 3 — Proyectil mágico genérico por “variant” (menos componentes)

Completado: No

- Crear o evolucionar un componente genérico (p. ej. `MagicProjectile`) que acepte:
  - `variant` (bolt/orb/shard)
  - `tint` y `impactTint`
  - definición de animación de impacto (spritesheet + keyframes) reutilizando `Animation.svelte`
- Ajustar el modelo de tipos para no multiplicar `ProjectileType` innecesariamente:
  - un `ProjectileType` genérico (p. ej. `"magic"`) parametrizable por config
- Validación manual:
  - 3 “looks” distintos del proyectil mágico cambiando solo `variant + tint`

## Iteración 4 — Catálogo inicial de proyectiles mágicos (skins)

Completado: No

- Añadir 2–3 estilos nuevos (sin necesidad de añadir hechizos nuevos todavía):
  - Arcane bolt (morado/azul)
  - Ice shard (cian/blanco)
  - Poison orb (verde)
- Todos deben soportar `tint`/`impactTint`.
- Validación manual:
  - Alternar “skin” del proyectil para test rápido (antes de mapear 1:1 con hechizos)

## Iteración 5 — Señalización persistente de estados en enemigos (freeze como base)

Completado: Sí

- Derivar estado visual del actor desde `actor.traits/items` (similar a `isEthereal(actor)`):
  - identificar `frozen` y otros estados futuros
- En `Avatar.svelte`:
  - aplicar clase/estilos cuando el actor está congelado
  - añadir overlay mínimo (tinte azul + efecto “escarcha” simple)
- Validación manual:
  - Un monstruo congelado se ve “congelado” durante sus turnos restantes y vuelve a normal al expirar

## Iteración 6 — Marco general de estados con VFX (burning / confused / etc.)

Completado: No

- Estandarizar metadata para estados temporales:
  - opción rápida: flags por estado en `ItemMetadata` (`burning`, `confused`, etc.) + `turns`
  - opción escalable: `statusId: "frozen" | "burning" | "confused"` + `turns`
- Implementar overlays por estado en `Avatar.svelte`:
  - Frozen: tint azul + cristales/escarcha
  - Burning: glow naranja/rojo pulsante (y opcional partículas)
  - Confused: estrellas orbitando o overlay equivalente
- Validación manual:
  - Si existen múltiples estados, se apilan con prioridad/legibilidad controlada

## Iteración 7 — Hechizos que aplican estados + mantenimiento por turno

Completado: No

- Añadir hechizos nuevos en el registro `SPELLS` que apliquen estados duraderos:
  - Burn: aplica ardiendo + turnos (y opcional daño por turno)
  - Confuse: aplica confundido + turnos (y altera el comportamiento del monstruo)
- Extender el controlador de turnos de monstruos para:
  - decrementar/remover cada estado (como ya se hace con frozen)
- Validación manual:
  - Efecto visual y efecto de gameplay expiran a la vez

## Iteración 8 — Pulido (assets, coherencia visual, lectura)

Completado: No

- Definir paleta canónica por “escuela” (arcano/hielo/fuego/veneno) y usarla en:
  - proyectil, impacto y overlay persistente
- Reutilizar spritesheets existentes con tintado (cuando sea posible) y añadir nuevos solo si aportan legibilidad clara.
- Checklist manual final:
  - Proyectiles con distintos colores se ven correctamente
  - Estados de varios turnos siempre marcan al enemigo y desaparecen al expirar
  - El flujo de menú/casting no cambia: solo mejora VFX/feedback
