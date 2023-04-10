import {isNotNullish, isNullish} from "./utils";
import Store from "./store";

type UserNullish = object | null | undefined;
type GateHook = (user: UserNullish, ability: string, ...args: any[]) => boolean | void;
type GateDefinition = (user: UserNullish, ...args: any[]) => boolean | void;
type GateAbilities = { [ability: string]: GateDefinition };

interface GateOptions {
    user: UserNullish;
    store: Store;
    abilities?: GateAbilities;
    beforeCallbacks?: GateHook[];
    afterCallbacks?: GateHook[];
}

class Gate {
    readonly #abilities: GateAbilities = {};
    readonly #beforeCallbacks: GateHook[] = [];
    readonly #afterCallbacks: GateHook[] = [];
    #user: UserNullish;
    #userPromise!: Promise<UserNullish>;
    readonly #store: Store;
    #committer?: Function;

    constructor(
        {
            store,
            user,
            abilities = {},
            beforeCallbacks = [],
            afterCallbacks = []
        }: GateOptions
    ) {
        this.setUser(user);
        this.#abilities = abilities;
        this.#beforeCallbacks = beforeCallbacks;
        this.#afterCallbacks = afterCallbacks;
        this.#store = store;
        return this;
    }

    isUserPending(): boolean {
        return isNullish(this.#user);
    }

    resolveUser(): Promise<UserNullish> {
        return this.#userPromise;
    }

    getUser(): UserNullish {
        return this.#user;
    }

    setUser(user: object | Promise<UserNullish> | UserNullish) {
        if (user instanceof Promise) {
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

    forUser(user: object) {
        return new Gate({
            user,
            abilities: this.#abilities,
            beforeCallbacks: this.#beforeCallbacks,
            afterCallbacks: this.#afterCallbacks,
            store: this.#store,
        })
    }

    before(callback: GateHook) {
        this.#beforeCallbacks.push(callback);
    }

    after(callback: GateHook) {
        this.#afterCallbacks.push(callback);
    }

    committer(callback: (currentGate: Gate, force: boolean) => any) {
        this.#committer = callback;
    }

    define(ability: string, callback: GateDefinition) {
        this.#abilities[ability] = callback;
    }

    allows(ability: string, ...args: any[]) {
        return !!this.raw(ability, ...args);
    }

    denies(ability: string, ...args: any[]) {
        return !this.allows(ability, ...args);
    }

    check(abilities: string[], ...args: any[]) {
        return abilities.every((ability) => this.allows(ability, ...args));
    }

    any(abilities: string[], ...args: any[]) {
        return abilities.some((ability) => this.allows(ability, ...args));
    }

    none(abilities: string[], ...args: any[]) {
        return !this.any(abilities, ...args);
    }

    doesntHavePersistence() {
        return this.#store.get()?.isUserPending();
    }

    async persist(force = false) {
        if (this.isUserPending()) {
            await this.resolveUser();
        }
        this.#committer?.(this, force)
        return this;
    }

    raw(ability: string, ...args: any[]) {
        let result = this.#callBeforeCallbacks(this.#user, ability, args)
            ?? this.#abilities?.[ability]?.(this.#user, ...args);

        return this.#callAfterCallbacks(this.#user, ability, args, result);
    }

    #callBeforeCallbacks(user: UserNullish, ability: string, args: any[]) {
        for (const before of this.#beforeCallbacks) {
            let response = before(user, ability, ...args);
            if (isNotNullish(response)) {
                return response;
            }
        }
    }

    #callAfterCallbacks(user: UserNullish, ability: string, args: any[], result: any) {
        for (const after of this.#afterCallbacks) {
            let afterResult = after(user, ability, result, ...args);
            result ??= afterResult;
        }
        return result;
    }
}

export default Gate;