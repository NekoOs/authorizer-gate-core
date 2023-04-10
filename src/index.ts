import Gate from "./gate";
import Store from "./store";
import {isNullish} from "./utils";

const store = new Store();

function getStoredGate() {
    let gate: Gate|undefined = store.get();
    if (isNullish(gate)) {
        gate = new Gate({user: undefined, store});
        store.set(gate);
    }
    if (!(gate instanceof Gate)) {
        throw "The Store.getter resolution should be returns Gate instance"
    }
    return gate;
}

const gate = getStoredGate();

gate.committer((currentGate, force) => store.set(force ? currentGate : gate))

export default gate;
export {
    gate as Gate,
    store as Store,
};