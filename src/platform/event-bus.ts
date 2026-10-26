/**
 * An in-process event bus. THIS IS A STUB - you finish it.
 *
 * Requirements:
 *   - a handler that throws must not stop the other handlers
 *   - publish returns the number of handlers it reached
 *   - subscribing the same function twice registers it twice (do not dedupe)
 *   - publishing a name nobody listens to is fine and returns 0
 */

/** The events this system publishes. Add to it as you need to. */
export interface DomainEvents {
  "order.placed": { orderId: string; email: string; amountPaise: number };
}

export type EventName = keyof DomainEvents;
export type Handler<K extends EventName> = (payload: DomainEvents[K]) => void;
export type Unsubscribe = () => void;

export interface EventBus {
  publish<K extends EventName>(name: K, payload: DomainEvents[K]): number;
  subscribe<K extends EventName>(name: K, fn: Handler<K>): Unsubscribe;
}

export function createEventBus(): EventBus {
  const handlers = new Map<EventName, Array<{ fn: Handler<EventName> }>>();

  return {
    subscribe(name, fn) {
      const registrations = handlers.get(name) ?? [];
      const registration = { fn: fn as Handler<EventName> };
      registrations.push(registration);
      handlers.set(name, registrations);

      return () => {
        const index = registrations.indexOf(registration);
        if (index >= 0) registrations.splice(index, 1);
      };
    },
    publish(name, payload) {
      const registrations = [...(handlers.get(name) ?? [])];
      for (const { fn } of registrations) {
        try {
          fn(payload as DomainEvents[EventName]);
        } catch {
          // A failing subscriber must not prevent later subscribers from running.
        }
      }
      return registrations.length;
    },
  };
}

export const eventBus = createEventBus();
