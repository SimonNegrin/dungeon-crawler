import { playAnimation, removeItemByName } from "./common"
import type { Character, Item } from "./types"

const itemPrefabs: Item[] = [
  {
    spriteId: "dagger",
    name: "Daga",
    desc: "Una daga pequeña pero afilada",
    statModifiers: [
      {
        stat: "attack",
        value: 1,
      },
      {
        stat: "initiative",
        value: 1,
      },
    ],
  },
  {
    spriteId: "short_sword",
    name: "Espada corta",
    desc: "Mejor que nada",
    statModifiers: [
      {
        stat: "attack",
        value: 2,
      },
    ],
  },
  {
    spriteId: "sword",
    name: "Espada",
    desc: "Una espada estándar",
    statModifiers: [
      {
        stat: "attack",
        value: 3,
      },
    ],
  },
  {
    spriteId: "bastard_sword",
    name: "Espada bastarda",
    desc: "Una espada versátil de una mano y media",
    statModifiers: [
      {
        stat: "attack",
        value: 4,
      },
      {
        stat: "initiative",
        value: -1,
      },
    ],
  },
  {
    spriteId: "big_sword",
    name: "Espada grande",
    desc: "Una espada enorme",
    statModifiers: [
      {
        stat: "attack",
        value: 5,
      },
      {
        stat: "initiative",
        value: -2,
      },
    ],
  },
  {
    spriteId: "great_sword",
    name: "Espadón",
    desc: "Una espada gigantesca para los más fuertes",
    statModifiers: [
      {
        stat: "attack",
        value: 6,
      },
      {
        stat: "damage",
        value: 1,
      },
      {
        stat: "initiative",
        value: -3,
      },
    ],
  },
  {
    spriteId: "axe",
    name: "Hacha",
    desc: "Un hacha de batalla",
    statModifiers: [
      {
        stat: "attack",
        value: 3,
      },
      {
        stat: "damage",
        value: 1,
      },
      {
        stat: "initiative",
        value: -1,
      },
    ],
  },
  {
    spriteId: "big_axe",
    name: "Hacha grande",
    desc: "Un hacha enorme",
    statModifiers: [
      {
        stat: "attack",
        value: 4,
      },
      {
        stat: "damage",
        value: 2,
      },
      {
        stat: "initiative",
        value: -2,
      },
    ],
  },
  {
    spriteId: "great_axe",
    name: "Gran hacha",
    desc: "Un hacha colosal",
    statModifiers: [
      {
        stat: "attack",
        value: 5,
      },
      {
        stat: "damage",
        value: 3,
      },
      {
        stat: "initiative",
        value: -3,
      },
    ],
  },
  {
    spriteId: "shield_1",
    name: "Escudo pequeño",
    desc: "Un escudo básico",
    statModifiers: [
      {
        stat: "defence",
        value: 1,
      },
    ],
  },
  {
    spriteId: "shield_2",
    name: "Escudo",
    desc: "Un escudo estándar",
    statModifiers: [
      {
        stat: "defence",
        value: 2,
      },
    ],
  },
  {
    spriteId: "shield_3",
    name: "Escudo grande",
    desc: "Un escudo grande",
    statModifiers: [
      {
        stat: "defence",
        value: 3,
      },
      {
        stat: "initiative",
        value: -1,
      },
    ],
  },
  {
    spriteId: "shield_4",
    name: "Escudo de torre",
    desc: "Un escudo enorme",
    statModifiers: [
      {
        stat: "defence",
        value: 4,
      },
      {
        stat: "initiative",
        value: -2,
      },
    ],
  },
  {
    spriteId: "shield_5",
    name: "Escudo de hierro",
    desc: "Un escudo reforzado",
    statModifiers: [
      {
        stat: "defence",
        value: 3,
      },
    ],
  },
  {
    spriteId: "shield_6",
    name: "Escudo de acero",
    desc: "Un escudo de alta calidad",
    statModifiers: [
      {
        stat: "defence",
        value: 4,
      },
    ],
  },
  {
    spriteId: "shield_7",
    name: "Escudo mágico",
    desc: "Un escudo encantado",
    statModifiers: [
      {
        stat: "defence",
        value: 3,
      },
      {
        stat: "initiative",
        value: 1,
      },
    ],
    metadata: {
      magic: true,
    },
  },
  {
    spriteId: "wizzard_hat",
    name: "Sombrero de mago",
    desc: "Un sombrero que otorga sabiduría",
    statModifiers: [
      {
        stat: "initiative",
        value: 1,
      },
    ],
    metadata: {
      magic: true,
    },
  },
  {
    spriteId: "red_necklace",
    name: "Collar rojo",
    desc: "Un collar que aumenta la vitalidad",
    statModifiers: [
      {
        stat: "health",
        value: 2,
      },
      {
        stat: "totalHealth",
        value: 2,
      },
    ],
  },
  {
    spriteId: "iron_necklace",
    name: "Collar de hierro",
    desc: "Un collar que fortalece la defensa",
    statModifiers: [
      {
        stat: "defence",
        value: 1,
      },
    ],
  },
  {
    spriteId: "crystal_necklace",
    name: "Collar de cristal",
    desc: "Un collar que mejora la puntería",
    statModifiers: [
      {
        stat: "aim",
        value: 2,
      },
    ],
  },
  {
    spriteId: "wood_necklace",
    name: "Collar de madera",
    desc: "Un collar que acelera la iniciativa",
    statModifiers: [
      {
        stat: "initiative",
        value: 2,
      },
    ],
  },
  {
    spriteId: "sacred_necklace",
    name: "Collar sagrado",
    desc: "Un collar bendito",
    statModifiers: [
      {
        stat: "defence",
        value: 2,
      },
      {
        stat: "health",
        value: 1,
      },
    ],
    metadata: {
      magic: true,
    },
  },
  {
    spriteId: "damned_necklace",
    name: "Collar maldito",
    desc: "Un collar oscuro",
    statModifiers: [
      {
        stat: "attack",
        value: 3,
      },
      {
        stat: "defence",
        value: -1,
      },
    ],
    metadata: {
      magic: true,
    },
  },
  {
    spriteId: "parchment",
    name: "Pergamino",
    desc: "Un pergamino antiguo",
    // Quest item, no stat modifiers
  },
  {
    spriteId: "coin",
    name: "Moneda",
    desc: "Una moneda de oro",
    // Currency, no stat modifiers
  },
  {
    spriteId: "coins_1",
    name: "Monedas",
    desc: "Un puñado de monedas",
    // Currency, no stat modifiers
  },
  {
    spriteId: "coins_2",
    name: "Más monedas",
    desc: "Varias monedas",
    // Currency, no stat modifiers
  },
  {
    spriteId: "coins_bag",
    name: "Bolsa de monedas",
    desc: "Una bolsa llena de monedas",
    // Currency, no stat modifiers
  },
  {
    spriteId: "cheese",
    name: "Queso",
    desc: "Un trozo de queso",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 2
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemByName(character, item.name)
        await playAnimation("health", character.position)
      },
    },
  },
  {
    spriteId: "bread",
    name: "Pan",
    desc: "Una hogaza de pan",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 3
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemByName(character, item.name)
        await playAnimation("health", character.position)
      },
    },
  },
  {
    spriteId: "apple",
    name: "Manzana",
    desc: "Una manzana fresca",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 1
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemByName(character, item.name)
        await playAnimation("health", character.position)
      },
    },
  },
  {
    spriteId: "wine",
    name: "Vino",
    desc: "Una botella de vino",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 2
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemByName(character, item.name)
        await playAnimation("health", character.position)
      },
    },
  },
  {
    spriteId: "water",
    name: "Agua",
    desc: "Una botella de agua",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        const amount = 1
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        removeItemByName(character, item.name)
        await playAnimation("health", character.position)
      },
    },
  },
  {
    spriteId: "brass_key",
    name: "Llave de latón",
    desc: "Una llave de latón",
    // Key item, no stat modifiers
  },
  {
    spriteId: "iron_key",
    name: "Llave de hierro",
    desc: "Una llave de hierro",
    // Key item, no stat modifiers
  },
  {
    spriteId: "silver_key",
    name: "Llave de plata",
    desc: "Una llave de plata",
    // Key item, no stat modifiers
  },
  {
    spriteId: "rusty_key",
    name: "Llave oxidada",
    desc: "Una llave vieja y oxidada",
    // Key item, no stat modifiers
  },
  {
    spriteId: "potion_red",
    name: "Poción de vida",
    desc: "Genial para la resaca",
    metadata: {
      uses: 1,
    },
    effectHandlers: {
      onUse: async (character: Character, item: Item) => {
        if (typeof item.metadata?.uses !== "number") {
          removeItemByName(character, item.name)
          return
        }

        const amount = Math.floor(1 + 2 * Math.random())
        const { health, totalHealth } = character.stats
        character.stats.health = Math.min(health + amount, totalHealth)

        item.metadata.uses--
        if (item.metadata.uses <= 0) {
          removeItemByName(character, item.name)
        }

        await playAnimation("health", character.position)
      },
    },
  },
]

const prefabsMap = new Map<string, Item>(
  itemPrefabs.map((item) => [item.name, item]),
)

export function createItem(name: string): Item {
  const prefab = prefabsMap.get(name)
  if (!prefab) {
    throw new Error(`Prefab with name "${name}" doen't exists"`)
  }
  const item: Item = {
    ...prefab,
  }

  // Create new metadata object if needed
  if (prefab.metadata) {
    item.metadata = { ...prefab.metadata }
  }

  return item
}
