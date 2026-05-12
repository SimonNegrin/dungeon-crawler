# Plan: Proyectiles mágicos (VFX + estados)

## Objetivo

Mejorar el sistema de proyectiles mágicos para soportar múltiples animaciones/variantes y colores por hechizo, y añadir señalización visual persistente en enemigos afectados por estados de varios turnos (congelado, ardiendo, confundido, etc.).

## Contexto actual (resumen)

- Pipeline de proyectiles: `projectileTo` emite `events.shoot` y `Projectiles.svelte` monta el componente según `projectilesMap`.
- Hechizos: `castSpell(...)` resuelve y ejecuta `SPELLS[spellId].cast(...)`.
- Estado “Congelado” ya existe como trait con `metadata.frozen=true` + `turns`, y el turno de monstruos lo consume/decrementa.

## Iteración 0 — Inventario técnico (sin cambios de gameplay)

Completado: No

- Confirmar el pipeline actual de proyectiles y puntos de extensión:
  - `helpers/combat.ts` (`projectilesMap`, `projectileTo`)
  - `Projectiles.svelte` (render)
  - componentes existentes: `ProjectileArrow.svelte`, `ProjectileMagicFireball.svelte`, `Projectile.svelte`
- Identificar el punto natural para overlays persistentes en enemigos:
  - Render de actores en `Avatar.svelte` (sprite wrapper, clases/estilos)
- Definir una “API mínima” para VFX:
  - color/tint del proyectil
  - color/tint del impacto
  - (opcional) variante visual del proyectil (bolt/orb/shard)

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

Completado: No

- Evitar que el componente del proyectil contenga lógica de daño/estado.
- Mover el “efecto” (daño/estado) al `spell.cast(...)`, y dejar el proyectil como visual (o un “onImpact” genérico).
- Beneficio: reutilizar un mismo proyectil visual para múltiples hechizos/efectos sin duplicar lógica.

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
