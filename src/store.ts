import Gate from "./gate";

type StoreGet = () => Gate;
type StoreSet = (gate: Gate) => void;

class Store {
    #store: { get?: StoreGet, set?: StoreSet } = {};

    setter(callback: StoreSet) {
        this.#store.set = callback;
        return this;
    }

    getter(callback: StoreGet) {
        this.#store.get = callback;
        return this;
    }

    get(): Gate | undefined {
        return this.#store?.get?.();
    }

    set(gate: Gate): void {
        this.#store?.set?.(gate);
    }
}

export default Store;