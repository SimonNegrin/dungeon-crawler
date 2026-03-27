type AudioOptions = {
  volume?: number
}

const preloaded = new Set<string>()
let stepRight = true

export const zipSound = createAudioPreset("zip", { volume: 0.2 })
export const doorUnlockSound = createAudioPreset("door_unlock", { volume: 0.2 })
export const doorLockedSound = createAudioPreset("door_locked", { volume: 0.2 })
export const tiredSound = createAudioPreset("tired", { volume: 0.4 })
export const nextSound = createAudioPreset("next", { volume: 0.25 })
export const stepLeftSound = createAudioPreset("step_left", { volume: 0.15 })
export const stepRightSound = createAudioPreset("step_right", { volume: 0.15 })
export const fogClearSound = createAudioPreset("disapear", { volume: 0.2 })
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
  preloaded.add(audioName)
  const link = document.createElement("link")
  link.rel = "preload"
  link.as = "fetch"
  link.href = getSrc(audioName)
  document.head.appendChild(link)
}

function playAudio(audioName: string, options?: AudioOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio")
    audio.preload = "auto"
    audio.src = getSrc(audioName)
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
  })
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
