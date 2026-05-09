import { removeItemByName } from "./common"
import type { ICharacter, Item } from "../types"
import { playAnimation } from "./animations"

const itemPrefabs: Item[] = [
  {
    sprite: "dagger",
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
    sprite: "short sword",
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
    sprite: "long sword",
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
    sprite: "bastard sword",
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
    sprite: "zweihander",
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
    sprite: "great sword",
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
    sprite: "hand axe",
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
    sprite: "battle axe",
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
    sprite: "great axe",
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
    sprite: "buckler",
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
    sprite: "kite shield",
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
    sprite: "large shield",
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
    sprite: "round shield",
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
    sprite: "cross shield",
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
    sprite: "dark shield",
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
    sprite: "buckler 2",
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
    sprite: "wide-brimmed hat",
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
    sprite: "red pendant",
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
    sprite: "metal pendant",
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
    sprite: "crystal pendant",
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
    sprite: "stone pendant",
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
    sprite: "cross pendant",
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
    sprite: "ankh",
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
    sprite: "scroll",
    name: "Pergamino",
    desc: "Un pergamino antiguo",
    // Quest item, no stat modifiers
  },
  {
    sprite: "coin",
    name: "Moneda",
    desc: "Una moneda de oro",
    // Currency, no stat modifiers
  },
  {
    sprite: "small stacks of coins",
    name: "Monedas",
    desc: "Un puñado de monedas",
    // Currency, no stat modifiers
  },
  {
    sprite: "large stacks of coins",
    name: "Más monedas",
    desc: "Varias monedas",
    // Currency, no stat modifiers
  },
  {
    sprite: "coin purse",
    name: "Bolsa de monedas",
    desc: "Una bolsa llena de monedas",
    // Currency, no stat modifiers
  },
  // {
  //   sprite: "cheese",
  //   name: "Queso",
  //   desc: "Un trozo de queso",
  //   metadata: {
  //     uses: 1,
  //   },
  //   effectHandlers: {
  //     onUse: async (character: Character, item: Item) => {
  //       const amount = 2
  //       const { health, totalHealth } = character.stats
  //       character.stats.health = Math.min(health + amount, totalHealth)

  //       removeItemByName(character, item.name)
  //       await playAnimation("health", character.position)
  //     },
  //   },
  // },
  // {
  //   sprite: "bread",
  //   name: "Pan",
  //   desc: "Una hogaza de pan",
  //   metadata: {
  //     uses: 1,
  //   },
  //   effectHandlers: {
  //     onUse: async (character: Character, item: Item) => {
  //       const amount = 3
  //       const { health, totalHealth } = character.stats
  //       character.stats.health = Math.min(health + amount, totalHealth)

  //       removeItemByName(character, item.name)
  //       await playAnimation("health", character.position)
  //     },
  //   },
  // },
  // {
  //   sprite: "apple",
  //   name: "Manzana",
  //   desc: "Una manzana fresca",
  //   metadata: {
  //     uses: 1,
  //   },
  //   effectHandlers: {
  //     onUse: async (character: Character, item: Item) => {
  //       const amount = 1
  //       const { health, totalHealth } = character.stats
  //       character.stats.health = Math.min(health + amount, totalHealth)

  //       removeItemByName(character, item.name)
  //       await playAnimation("health", character.position)
  //     },
  //   },
  // },
  // {
  //   sprite: "bottle of beer",
  //   name: "Vino",
  //   desc: "Una botella de vino",
  //   metadata: {
  //     uses: 1,
  //   },
  //   effectHandlers: {
  //     onUse: async (character: Character, item: Item) => {
  //       const amount = 2
  //       const { health, totalHealth } = character.stats
  //       character.stats.health = Math.min(health + amount, totalHealth)

  //       removeItemByName(character, item.name)
  //       await playAnimation("health", character.position)
  //     },
  //   },
  // },
  // {
  //   sprite: "bottle of water",
  //   name: "Agua",
  //   desc: "Una botella de agua",
  //   metadata: {
  //     uses: 1,
  //   },
  //   effectHandlers: {
  //     onUse: async (character: Character, item: Item) => {
  //       const amount = 1
  //       const { health, totalHealth } = character.stats
  //       character.stats.health = Math.min(health + amount, totalHealth)

  //       removeItemByName(character, item.name)
  //       await playAnimation("health", character.position)
  //     },
  //   },
  // },
  {
    sprite: "gold key",
    name: "Llave de latón",
    desc: "Una llave de latón",
    // Key item, no stat modifiers
  },
  {
    sprite: "metal key",
    name: "Llave de hierro",
    desc: "Una llave de hierro",
    // Key item, no stat modifiers
  },
  {
    sprite: "ornate key",
    name: "Llave de plata",
    desc: "Una llave de plata",
    // Key item, no stat modifiers
  },
  {
    sprite: "primitive key",
    name: "Llave oxidada",
    desc: "Una llave vieja y oxidada",
    // Key item, no stat modifiers
  },
  {
    sprite: "scroll",
    name: "Pergamino de congelación",
    desc: "Congela a un enemigo durante 2 turnos",
    metadata: {
      spellId: "freeze",
      uses: 3,
    },
  },
  // {
  //   sprite: "red potion",
  //   name: "Poción de vida",
  //   desc: "Genial para la resaca",
  //   metadata: {
  //     uses: 1,
  //   },
  //   effectHandlers: {
  //     onUse: async (character: Character, item: Item) => {
  //       if (typeof item.metadata?.uses !== "number") {
  //         removeItemByName(character, item.name)
  //         return
  //       }

  //       const amount = Math.floor(1 + 2 * Math.random())
  //       const { health, totalHealth } = character.stats
  //       character.stats.health = Math.min(health + amount, totalHealth)

  //       item.metadata.uses--
  //       if (item.metadata.uses <= 0) {
  //         removeItemByName(character, item.name)
  //       }

  //       await playAnimation("health", character.position)
  //     },
  //   },
  // },
]

export const prefabsMap = new Map<string, Item>(
  itemPrefabs.map((item) => [item.name, item]),
)
