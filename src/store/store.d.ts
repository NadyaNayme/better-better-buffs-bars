import { Store } from "./types/Store";

declare const useStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<Store>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<Store, keyof Store>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: Store) => void) => () => void;
        onFinishHydration: (fn: (state: Store) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<Store, keyof Store>>;
    };
}>;
export default useStore;
