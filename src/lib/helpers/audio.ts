type AudioOptions = {
  volume?: number
}

const preloaded = new Map<string, Promise<string>>()
let stepRight = true

export const zipSound = createAudioPreset("zip", { volume: 0.2 })
export const doorUnlockSound = createAudioPreset("door_unlock", { volume: 0.2 })
export const doorLockedSound = createAudioPreset("door_locked", { volume: 0.2 })
export const tiredSound = createAudioPreset("tired", { volume: 0.4 })
export const nextSound = createAudioPreset("next", { volume: 0.25 })
export const stepLeftSound = createAudioPreset("step_left", { volume: 0.15 })
export const stepRightSound = createAudioPreset("step_right", { volume: 0.15 })
export const fogClearSound = createAudioPreset("reveal", { volume: 0.15 })
export const penClickSound = createAudioPreset("pen_click", { volume: 0.15 })
export const chestOpenSound = createAudioPreset("chest_open", { volume: 0.25 })
export const chestCloseSound = createAudioPreset("chest_close", {
  volume: 0.25,
})

// Attack sounds
export const attackSwordSound = createAudioPreset("attack_sword", {
  volume: 0.2,
})
export const attackFailSound = createAudioPreset("attack_fail", { volume: 0.2 })

// Monster
export const monsterHurtRandomSound = createRandomSound([
  createAudioPreset("monster_hurt_1", {
    volume: 0.2,
  }),
  createAudioPreset("monster_hurt_2", {
    volume: 0.2,
  }),
  createAudioPreset("monster_hurt_3", {
    volume: 0.2,
  }),
  createAudioPreset("monster_hurt_4", {
    volume: 0.2,
  }),
  createAudioPreset("monster_hurt_5", {
    volume: 0.2,
  }),
  createAudioPreset("monster_hurt_6", {
    volume: 0.2,
  }),
  createAudioPreset("monster_hurt_7", {
    volume: 0.2,
  }),
  createAudioPreset("monster_hurt_8", {
    volume: 0.2,
  }),
])
export const monsterDeathSound = createAudioPreset("monster_death", {
  volume: 0.2,
})

// Character
export const maleHurtSound = createRandomSound([
  createAudioPreset("male_hurt_1", { volume: 0.2 }),
  createAudioPreset("male_hurt_2", { volume: 0.2 }),
])

export const femaleHurtSound = createRandomSound([
  createAudioPreset("female_hurt_1", { volume: 0.2 }),
  createAudioPreset("female_hurt_2", { volume: 0.2 }),
])

// Weapons
export const arrowShootSound = createAudioPreset("arrow_shoot", { volume: 0.2 })

export function walkSound(): void {
  stepRight = !stepRight
  if (stepRight) {
    stepRightSound()
  } else {
    stepLeftSound()
  }
}

function preloadAudio(audioName: string): void {
  if (preloaded.has(audioName)) {
    return
  }
  preloaded.set(audioName, fetchAudio(audioName))
}

async function fetchAudio(audioName: string): Promise<string> {
  const response = await fetch(getSrc(audioName))
  if (!response.ok) {
    throw new Error(`Error fetching audio with name "${audioName}"`)
  }
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

async function playAudio(
  audioName: string,
  options?: AudioOptions,
): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>()
  const audio = document.createElement("audio")
  audio.preload = "auto"
  audio.src = await preloaded.get(audioName)!
  document.body.append(audio)
  audio.onended = () => {
    audio.remove()
    resolve()
  }
  audio.onerror = reject

  if (typeof options?.volume === "number") {
    audio.volume = options.volume
  }

  audio.play()
  return promise
}

function createAudioPreset(
  audioName: string,
  options?: AudioOptions,
): () => Promise<void> {
  preloadAudio(audioName)
  return () => playAudio(audioName, options)
}

function getSrc(audioName: string): string {
  return `/sounds/${audioName}.mp3`
}

function createRandomSound(sounds: Array<() => void>): () => void {
  return () => {
    const index = Math.floor(sounds.length * Math.random())
    sounds[index]()
  }
}
