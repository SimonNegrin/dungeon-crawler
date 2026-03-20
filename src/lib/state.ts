import type { Character, Item, Stage } from "./types"
import { loadSpritesheet } from "./common"
import { writable } from "svelte/store"
import Vec2 from "./Vec2"

export const stage = writable<Stage | null>(null)

const colganteEtereo: Item = {
  name: "Colgante etéreo",
  desc: "Trasciende tu cuerpo físico",
  ethereal: true,
}

export const players = writable<Character[]>([
  {
    name: "Ladelbar",
    position: new Vec2(2, 2),
    origin: new Vec2(2, 2),
    steps: 8,
    items: [
      // colganteEtereo
    ],
  },
])

export async function loadStage(name: string): Promise<void> {
  stage.set(null)
  const data: Stage = await loadSpritesheet(name)
  stage.set(data)
}
