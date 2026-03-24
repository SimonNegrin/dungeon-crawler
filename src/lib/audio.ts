const preloaded = new Set<string>()

export function preloadAudio(audioName: string): void {
  if (preloaded.has(audioName)) {
    return
  }
  preloaded.add(audioName)
  const link = document.createElement("link")
  link.rel = "preload"
  link.as = "audio"
  link.href = getSrc(audioName)
  document.head.appendChild(link)
}

type AudioOptions = {
  volume?: number
}

export function playAudio(
  audioName: string,
  options?: AudioOptions,
): Promise<void> {
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

export function createAudioPreset(
  audioName: string,
  options?: AudioOptions,
): () => Promise<void> {
  preloadAudio(audioName)
  return () => playAudio(audioName, options)
}

function getSrc(audioName: string): string {
  return `/sounds/${audioName}.mp3`
}
