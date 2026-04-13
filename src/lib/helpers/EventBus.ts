export default class EventBus<T> {
  private subscribers = new Set<(params: T) => void>()

  subscribe(subscriber: (params: T) => void): () => void {
    this.subscribers.add(subscriber)
    return () => this.unsubscribe(subscriber)
  }

  unsubscribe(subscriber: (params: T) => void): void {
    this.subscribers.delete(subscriber)
  }

  emit(params: T): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(params)
    })
  }
}
