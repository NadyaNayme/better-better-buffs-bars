declare const useStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<unknown>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<unknown, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: unknown) => void) => () => void;
        onFinishHydration: (fn: (state: unknown) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<unknown, unknown>>;
    };
}>;
export default useStore;
