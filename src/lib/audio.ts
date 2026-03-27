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
  const src = preloaded.get(audioName)
  if (!src) {
    throw new Error(`Audio with name "${audioName}" is not preloaded`)
  }
  const audio = document.createElement("audio")
  audio.preload = "auto"
  audio.src = await src
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
