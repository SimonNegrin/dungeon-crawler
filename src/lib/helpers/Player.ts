import type {
  IPlayer,
  IPlayerPreset,
  IPlayerConnection,
  IGlobalState,
} from "../types"
import { PKT_PLAYER_CONFIG, PKT_PLAYER_READY, setBaseStat } from "./common"

export default class Player {
  public isReady = false
  public isCurrentPlayer = false

  constructor(
    private connection: IPlayerConnection,
    private gameState: IGlobalState,
    public readonly actor: IPlayer,
  ) {
    this.setupHandlers()
  }

  private setupHandlers(): void {
    this.connection.channel.addEventListener(
      "message",
      this.onMessage.bind(this),
    )
  }

  private onMessage(event: MessageEvent): void {
    const pkt = new Uint8Array(event.data)
    const handlers: Record<number, (pkt: Uint8Array) => void> = {
      [PKT_PLAYER_CONFIG]: this.handlePlayerConfig.bind(this),
      [PKT_PLAYER_READY]: this.handlePlayerReady.bind(this),
    }
    const pktType = pkt[0]
    if (!handlers[pktType]) {
      console.warn(`Unknown packet number "${pktType}"`)
    }
    handlers[pktType](pkt)
  }

  private handlePlayerConfig(pkt: Uint8Array): void {
    if (this.isReady) {
      return
    }
    const decoder = new TextDecoder()
    const preset: IPlayerPreset = JSON.parse(decoder.decode(pkt.slice(1)))
    console.log("handlePlayerConfig", preset)

    this.actor.sprite = preset.sprite
    this.actor.name = preset.name
    setBaseStat("movement", preset.movement, this.actor)
    setBaseStat("actions", preset.actions, this.actor)
    setBaseStat("attack", preset.attack, this.actor)
    setBaseStat("defence", preset.defence, this.actor)
    setBaseStat("aim", preset.aim, this.actor)
    setBaseStat("magic", preset.magic, this.actor)
  }

  private handlePlayerReady(): void {
    if (this.isReady) {
      return
    }
    this.isReady = true
    const event = new CustomEvent("player_ready", {
      detail: this,
    })
    window.dispatchEvent(event)
  }
}
