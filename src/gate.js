import {isNotNullish, isNullish} from "./utils.js";

class Gate {
    #abilities = {};
    #beforeCallbacks = [];
    #afterCallbacks = [];
    #user;
    #userPromise;
    #store;
    #committer;

    constructor({user, abilities = {}, beforeCallbacks = [], afterCallbacks = [], store} = {}) {
        this.setUser(user);
        this.#abilities = abilities;
        this.#beforeCallbacks = beforeCallbacks;
        this.#afterCallbacks = afterCallbacks;
        this.#store = store;
        return this;
    }

    isUserPending() {
        return isNullish(this.#user);
    }

    resolveUser() {
        return this.#userPromise;
    }

    getUser() {
        return this.#user;
    }

    setUser(user) {
        const isUserPromise = user instanceof Promise;

        if (isUserPromise) {
            this.#user = null;
            this.#userPromise = user;
        } else {
            this.#user = user;
            this.#userPromise = Promise.resolve(user);
        }

        this.resolveUser()
            .then((user) => {
                this.#user = user
                return user;
            })

        return this;
    }

    forUser(user) {
        return new Gate({
            user,
            abilities: this.#abilities,
            beforeCallbacks: this.#beforeCallbacks,
            afterCallbacks: this.#afterCallbacks,
            store: this.#store,
        })
    }

    before(callback) {
        this.#beforeCallbacks.push(callback);
    }

    after(callback) {
        this.#afterCallbacks.push(callback);
    }

    committer(callback) {
        this.#committer = callback;
    }

    define(ability, callback) {
        this.#abilities[ability] = callback;
    }

    allows(ability, ...args) {
        return !!this.raw(ability, ...args);
    }

    denies(ability, ...args) {
        return !this.allows(ability, ...args);
    }

    check(abilities, ...args) {
        return abilities.every((ability) => this.allows(ability, ...args));
    }

    any(abilities, ...args) {
        return abilities.some((ability) => this.allows(ability, ...args));
    }

    none(abilities, ...args) {
        return !this.any(abilities, ...args);
    }

    doesntHavePersistence(key) {
        return this.#store.get(key).isUserPending();
    }

    async persist({force = false} = {}) {
        if (this.isUserPending()) {
            await this.resolveUser();
        }
        this.#committer?.(this, force)
        return this;
    }

    raw(ability, ...args) {
        let result = this.#callBeforeCallbacks(this.#user, ability, args)
            ?? this.#abilities?.[ability]?.(this.#user, ability, ...args);

        return this.#callAfterCallbacks(this.#user, ability, args, result);
    }

    #callBeforeCallbacks(user, ability, args) {
        for (const before of this.#beforeCallbacks) {
            let response = before(user, ability, ...args);
            if (isNotNullish(response)) {
                return response;
            }
        }
    }

    #callAfterCallbacks(user, ability, args, result) {
        for (const after of this.#afterCallbacks) {
            let afterResult = after({}, ability, result, ...args);
            result ??= afterResult;
        }
        return result;
    }
}

export default Gate;