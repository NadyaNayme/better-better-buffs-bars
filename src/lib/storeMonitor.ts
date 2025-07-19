import { type StoreApi } from 'zustand';

type MonitorHandler<T> = (current: T, previous: T) => void;
type StateSelector<T, S> = (state: S) => T;

type ZustandStoreApi<S> = StoreApi<S>;

/**
 * Creates a monitor for a Zustand store that allows subscribing to changes
 * of specific, selected parts of the state.
 *
 * @param useStore The Zustand store hook (e.g., `useStore`).
 * @returns An object with a `monitor` method.
 */
export function createStoreMonitor<TState>(storeApi: ZustandStoreApi<TState>) {
  const trackedSelectors = new Map<StateSelector<any, TState>, any>();

  // All our monitors will share this single subscription.
  const unsubscribe = storeApi.subscribe((currentState, previousState) => {
    for (const [selector, handler] of trackedSelectors.entries()) {
      const currentValue = selector(currentState);
      const previousValue = selector(previousState);

      if (!Object.is(currentValue, previousValue)) {
        handler(currentValue, previousValue);
      }
    }
  });

  function monitor<TValue>(
    selector: StateSelector<TValue, TState>,
    handler: MonitorHandler<TValue>
  ) {
    trackedSelectors.set(selector, handler);
    return () => {
      trackedSelectors.delete(selector);
    };
  }
  return {
    monitor,
    destroy: unsubscribe,
  };
}