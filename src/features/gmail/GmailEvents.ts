import {
  type GmailEventListener,
  type GmailEventMap,
  type GmailEventName,
  type GmailUnsubscribe,
} from './GmailTypes';

interface EventChannel<TPayload> {
  readonly listeners: Set<(payload: TPayload) => void>;
}

type GmailEventChannels = {
  [TEventName in GmailEventName]: EventChannel<GmailEventMap[TEventName]>;
};

/**
 * Strongly typed, synchronous event bus scoped to the Gmail engine.
 */
export class GmailEventBus {
  private readonly channels: GmailEventChannels = {
    'gmail:compose-closed': { listeners: new Set() },
    'gmail:compose-opened': { listeners: new Set() },
    'gmail:conversation-changed': { listeners: new Set() },
    'gmail:conversation-opened': { listeners: new Set() },
    'gmail:inbox-loaded': { listeners: new Set() },
    'gmail:loaded': { listeners: new Set() },
    'gmail:ready': { listeners: new Set() },
    'gmail:thread-changed': { listeners: new Set() },
    'gmail:url-changed': { listeners: new Set() },
  };

  /**
   * Registers a listener and returns an idempotent unsubscribe function.
   */
  subscribe<TEventName extends GmailEventName>(
    eventName: TEventName,
    listener: GmailEventListener<TEventName>,
  ): GmailUnsubscribe {
    this.getChannel(eventName).listeners.add(listener);

    return () => {
      this.unsubscribe(eventName, listener);
    };
  }

  /**
   * Removes a previously registered listener.
   */
  unsubscribe<TEventName extends GmailEventName>(
    eventName: TEventName,
    listener: GmailEventListener<TEventName>,
  ): void {
    this.getChannel(eventName).listeners.delete(listener);
  }

  /**
   * Emits an event to a stable snapshot of its current listeners.
   */
  emit<TEventName extends GmailEventName>(
    eventName: TEventName,
    payload: GmailEventMap[TEventName],
  ): void {
    const listeners = [...this.getChannel(eventName).listeners];

    for (const listener of listeners) {
      listener(payload);
    }
  }

  /**
   * Registers a listener that is removed before its first invocation.
   */
  once<TEventName extends GmailEventName>(
    eventName: TEventName,
    listener: GmailEventListener<TEventName>,
  ): GmailUnsubscribe {
    let unsubscribe: GmailUnsubscribe = () => undefined;
    const onceListener: GmailEventListener<TEventName> = (payload) => {
      unsubscribe();
      listener(payload);
    };

    unsubscribe = this.subscribe(eventName, onceListener);
    return unsubscribe;
  }

  /**
   * Removes listeners for one event, or every listener when no event is given.
   */
  removeAll(eventName?: GmailEventName): void {
    if (eventName) {
      this.getChannel(eventName).listeners.clear();
      return;
    }

    for (const channel of Object.values(this.channels)) {
      channel.listeners.clear();
    }
  }

  /**
   * Resolves the correctly typed listener channel for an event.
   */
  private getChannel<TEventName extends GmailEventName>(
    eventName: TEventName,
  ): EventChannel<GmailEventMap[TEventName]> {
    return this.channels[eventName] as EventChannel<GmailEventMap[TEventName]>;
  }
}
