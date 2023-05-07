import * as croquet from "../util/croquetlib.js";

export let updateModel = e => {
    if(window.demoDemoCroquetState) { // use window.demo[your-demo-name]State to see if the demo is active. Only update the croquet interaction when the demo is active.
        if(e.what == "rightTriggerRelease") {
            window.clay.model.add("cube").color(...e.info).setMatrix(e.where).scale(0.03);
        }
    }
}

export const init = async model => {
    croquet.register('croquetDemo_1.0');
    model.setTable(false);
    model.animate(() => {
    });
 }