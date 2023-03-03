import Gate from "./gate.js";
import Store from "./store.js";
import {isNullish} from "./utils.js";

const store = new Store();

function getStoredGate() {
    let gate = store.get();
    if (isNullish(gate)) {
        gate = new Gate({store});
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