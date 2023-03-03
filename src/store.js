class Store {
    #store = {
        get() {
        },
        set(gate) {
        }
    };

    setter(callback) {
        this.#store.set = callback;
        return this;
    }

    getter(callback) {
        this.#store.get = callback;
        return this;
    }

    get() {
        return this.#store.get();
    }

    set(gate) {
        this.#store.set(gate);
    }
}

export default Store;