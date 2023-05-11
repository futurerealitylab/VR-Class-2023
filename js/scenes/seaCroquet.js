// import * as croquet from "../util/myCroquetlib.js";
import * as croquet from "../util/croquetlib.js";
import { controllerMatrix, buttonState } from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";
import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

// let ItemsToCollect =
//     [
//         { location: [0.2, 1, .5], scale: .3 /*[.3, .3, .3]*/ },
//         { location: [0, 1, .5], scale: .3/*[.1, .1, .1]*/ },
//         { location: [-0.2, 1, .5], scale: .3/*[.1, .1, .1]*/ },
//     ];

let ground = .2;
let targetScale = [0.5, .3, .5];
let targetLocation = [0.8, ground + targetScale[1] / 2, .2];

let failingOffset = .01;
let prevPos = [0, 0, 0];

// let leftTriggerPrev = false;
// let rightTriggerPrev = false;
let worldP = null;
let worldG = null;

let target = null;
let objsInScene = [];

let isInBox = (p, boxM) => {
    let q = cg.mTransform(cg.mInverse(boxM), p);
    return q[0] >= -1 & q[0] <= 1 &&
        q[1] >= -1 & q[1] <= 1 &&
        q[2] >= -1 & q[2] <= 1;
}

let ifHitAny = (controllerM) => {
    let m = controllerM.slice(12, 15);

    for (let i = 0; i < window.croquetModel.scene.length; i++) {
        // console.log(`ifhitany: ${i}`)
        // console.log(`ifHitAny: ${window.croquetModel.scene[i].matrix}`);
        const b = isInBox(m, window.croquetModel.scene[i].matrix);
        // console.log(b)
        if (b) {
            // console.log("color blue")
            // window.croquetModel.scene[i].color = [0, 0, 1];
            return i;
        } else {
            // console.log("reset")
            window.croquetModel.scene[i].color = [1, 1, 1];
        }
    }
    return -1;
}

let OnHit = (objIndex, trigger, triggerPrev, m) => {
    let hitObjInfo = window.croquetModel.scene[objIndex];
    hitObjInfo.color = [1, 0, 0];
    let B = m.slice(12, 15);
    if (!triggerPrev)
        prevPos = B;
    else
        hitObjInfo.matrix = cg.mMultiply(cg.mTranslate(cg.subtract(B, prevPos)), hitObjInfo.matrix);

    prevPos = B;
    hitObjInfo.activated = true;
}

let failing = () => {
    for (const objInfo of window.croquetModel.scene) {
        if (objInfo.activated) {
            objInfo.inMovement = true;
            objInfo.color = [1, 1, 1];
        }
    }
}

let ifSuccess = () => {
    if(objsInScene.length == 0) return false;
    // console.log("ifSuccess")
    let counter = 0;
    for (let i = 0; i < window.croquetModel.scene.length; i++) {
        // console.log(objsInScene[i].obj.getGlobalMatrix());
        const b = isInBox(objsInScene[i].getGlobalMatrix().slice(12, 15), target.getGlobalMatrix());

        if (b) {
            // console.log("Success")
            window.croquetModel.scene[i].color = [0, 1, 0];
            counter += 1;
        }
    }
    if (counter == objsInScene.length) {
        return true;
    }
    return false;
}

let gameEndW = null;
let GameEnd = () => {
    let EndWidget = worldP.add('cube').texture(() => {
        g2.setColor('white');
        // g2.fillRect(.1,0,.8,1);
        g2.fillRect(.1, 0, 1, .5);
        g2.textHeight(.09);
        g2.setColor('black');
        g2.fillText(`DONE!!!`, .5, .4, 'center');

        g2.drawWidgets(EndWidget);
    });
    return EndWidget;
}

export let initModel = () => {                                // INITIALIZE THE MODEL DATA.
    window.croquetModel.scene = [];
    // console.log(objsInScene.length);
    let items =
        [
            { location: [0.2, 1, .5], scale: .3 /*[.3, .3, .3]*/ },
            { location: [0, 1, .5], scale: .3/*[.1, .1, .1]*/ },
            { location: [-0.2, 1, .5], scale: .3/*[.1, .1, .1]*/ },
        ];

    for (const objInfo of items) {
        window.croquetModel.scene.push({ location: objInfo.location, scale: objInfo.scale, matrix: null, inMovement: false, activated: false, color: [1, 1, 1] });
    }
    // console.log(window.croquetModel.scene.length);
}

let drawObjects = () => {
    // console.log('drawObjects')
    if (objsInScene.length == 0) {
        worldG = new Gltf2Node({ url: './media/gltf/underwater_planet/untitled.gltf' });
        global.gltfRoot.addNode(worldG);

        worldP = window.clay.model.add();
        target = worldP.add('cube');

        for (const objInfo of window.croquetModel.scene) {
            let obj = window.clay.model.add('cube');
            objsInScene.push(obj);
        }
    }
    // console.log('drawObjects:passed')
    for (let i = 0; i < window.croquetModel.scene.length; i++) {
        let objInfo = window.croquetModel.scene[i];
        let obj = objsInScene[i];
        let scale = objInfo.scale;
        if (objInfo.matrix == null) {
            obj.identity().move(objInfo.location).color(objInfo.color).scale(scale);
            objInfo.matrix = obj.getMatrix();
            // console.log(`draw1: ${obj}`)
        } else {
            let objGround = Array.isArray(objInfo.scale) ? ground + (objInfo.scale[1] / 2) : (ground + objInfo.scale / 2);

            if (objInfo.inMovement && objInfo.matrix[13] > objGround) {
                objInfo.matrix[13] -= failingOffset;
            }
            obj.setMatrix(objInfo.matrix).color(objInfo.color).scale(scale);
            // console.log(`draw2: ${obj}`)
        }
    }
    target.identity().move(targetLocation).scale(targetScale).opacity(.7);
    worldG.translation = [0, -3,0];
}

export let drawView = () => {                          // TO DRAW MY VIEW OF THE SCENE,
    if (!window.croquetModel)                               // SET VIEW ANGLE AND PLACE ALL BOXES.
        return;
    drawObjects();
}

export let updateModel = e => {
    if (window.demoseaCroquetState) { // use window.demo[your-demo-name]State to see if the demo is active. Only update the croquet interaction when the demo is active.
        // e.where => controller matrix, e.info => if trigger previous pressed
        // console.log(e);
        if (objsInScene.length == 0) return;
        if (e.what == "rightTriggerPressed") {
            let mr = e.where;
            let rightTriggerPrev = e.info;
            // console.log(`revieve: ${mr}`);
            let rightInAny = ifHitAny(mr);

            // console.log(`hit: ${window.croquetModel.scene}`)
            if (rightInAny != -1) {
                OnHit(rightInAny, true, rightTriggerPrev, mr);
            }

        } else if (e.what == "leftTriggerPressed") {
            let ml = e.where;
            let leftTriggerPrev = e.info;
            let leftInAny = ifHitAny(ml);

            if (leftInAny != -1) {
                // left controller hit something
                OnHit(leftInAny, true, leftTriggerPrev, ml);
            }
        } else if (e.what == "rightTriggerRelease" || e.what == "leftTriggerRelease") {
            failing();
        }

        if (ifSuccess() && gameEndW == null) {
            //     // console.log("DONE");
            gameEndW = GameEnd();
        }
        if (gameEndW) {
            gameEndW.hud().scale(.4, .4, .0001);
        }
    }
}

export const init = async model => {
    croquet.register('croquetDemo_mydemo');
    model.setTable(false);
    model.setRoom(false);
    model.animate(() => {
    });
}