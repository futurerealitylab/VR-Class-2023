import { controllerMatrix, buttonState, joyStickState, viewMatrix } from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";
import * as global from "../global.js";
import { quat } from "../render/math/gl-matrix.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";
const large = 1.25;
const small = .1;
const sea_size = [5, 1, 5];
const innerRadius =1.2;
const outerRadius =1.5;

const colors = [
    [1, .4, .5],// light pink
    [.2, .8, 1.],// light blue
    [0, .9, .4],// light green
    [.9, .9, .9],// light gray
    [.3 ,.3, .4], // mid gray
    [.0, .0, .0], // black
]
// Make positions large-scale
const l = (a) => {
    return a.map(x => x * large);
}
// Make positions small-scale
const s = (a) => {
    return a.map(x => x * small);
}

const ItemsToCollect =
    [
        { location: [0.2, .5, .5], scale: .3 /*[.3, .3, .3]*/ },
        { location: [0, .5, .5], scale: .3/*[.1, .1, .1]*/ },
        { location: [-0.2, .5, .5], scale: .3/*[.1, .1, .1]*/ },
    ];

const ground = -.2;
const targetScale = [0.5, .3, .5];
const targetLocation = [0.8, ground+targetScale[1]/2, .2];

const failingOffset = .001;

let prevPos = [0, 0, 0];

let leftTriggerPrev = false;
let rightTriggerPrev = false;

export const init = async model => {
    model.setTable(false);
    model.setRoom(false);
    // add underwater setup
    // set up the glft part
    console.log("hello?");
    let gltf1 = new Gltf2Node({ url: './media/gltf/underwater_planet/untitled.gltf'});
    gltf1.scale = [.5,.5,.5];
    gltf1.translation = [-.1, -2.5, -.1];

    // set up the primitive part
    let largeView = model.add();
    // add sphere for restricting vision
    let viewSpheres = largeView.add();
    let inner = viewSpheres.add();
    let outer = viewSpheres.add();
    inner.add('sphere').color(colors[1]).opacity(.2);
    outer.add('sphere').color(colors[1]).opacity(.4).flag('uNoiseTexture');

    global.gltfRoot.addNode(gltf1);

    let world = model.add();

    let objsInScene = [];
    // let generateObjects = () => {
    let counter = 0;
    for (const objInfo of ItemsToCollect) {
        let obj = world.add('cube');
        objsInScene.push({ obj: obj, index: counter, location: objInfo.location, scale: objInfo.scale, matrix: null, inMovement: false, color: [1,1,1]});
        counter += 1;
    }

    let target = world.add('cube');
    // }

    let placeObjects = () => {
        for (const objInfo of objsInScene) {
            let obj = objInfo.obj;
            let scale = objInfo.scale;
            if (objInfo.matrix == null) {
                obj.identity().move(objInfo.location).color(objInfo.color).scale(scale);
                objInfo.matrix = obj.getMatrix();
            } else {
                let objGround = Array.isArray(objInfo.scale) ? ground+(objInfo.scale[1]/2) : (ground+objInfo.scale/2);

                if (objInfo.inMovement && objInfo.matrix[13] > objGround) {

                    objInfo.matrix[13] -= failingOffset;
                    //failing
                    // console.log(` failing : ${objInfo.matrix[13]}`);
                    // obj.identity().move(0,-failingOffset,0).scale(scale);
                    // objInfo.matrix = obj.getMatrix();

                }
                obj.setMatrix(objInfo.matrix).color(objInfo.color).scale(scale);
            }
        }

    }

    let isInBox = (p, box) => {

        // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.
        // console.log(`controller: ${p};; box: ${box.getMatrix()}`);
        let q = cg.mTransform(cg.mInverse(box.getGlobalMatrix()), p);

        // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.

        return q[0] >= -1 & q[0] <= 1 &&
            q[1] >= -1 & q[1] <= 1 &&
            q[2] >= -1 & q[2] <= 1;
    }

    let ifHitAny = (controllerM) => {
        let m = controllerM.slice(12, 15);

        for (let i = 0; i < objsInScene.length; i++) {
            const b = isInBox(m, objsInScene[i].obj);
            // console.log(b)
            if (b) {
                objsInScene[i].color = [0, 0, 1];
                return i;
            }else{
                objsInScene[i].color = [1, 1, 1];
            }
        }
        return -1;
    }

    let OnHit = (objIndex, trigger, triggerPrev, m) => {
        let hitObjInfo = objsInScene[objIndex];
        hitObjInfo.color= [0, 0, 1];

        // console.log(` pressed: ${trigger}`);
        if (trigger) {
            hitObjInfo.color= [1, 0, 0];
            let B = m.slice(12, 15);
            if (!triggerPrev)
                prevPos = B;
            else
                hitObjInfo.matrix = cg.mMultiply(cg.mTranslate(cg.subtract(B, prevPos)), hitObjInfo.matrix);

            prevPos = B;
        } else if (triggerPrev) {
            hitObjInfo.inMovement = true;
        }

        // croquet update each object matrix using objIndex
    }

    let isSuccess = () => {
        let counter = 0;
        for (let i = 0; i < objsInScene.length; i++) {
            // console.log(objsInScene[i].obj.getGlobalMatrix());
            const b = isInBox(objsInScene[i].obj.getGlobalMatrix().slice(12,15), target);

            if (b) {
                objsInScene[i].color = [0,1,0];
                counter +=1;
            }
        }
        if (counter == objsInScene.length)
        {
            return true;
        }
    }

    let gameEndW = null;
    let GameEnd = () => {
        let EndWidget = model.add('cube').texture(() => {
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

    // generateObjects();

    model.animate(() => {
        placeObjects();
        // set view-restriction sphere
        let vm = clay.views[0].viewMatrix;
        inner.identity().scale(-1*innerRadius);
        outer.identity().scale(-1*outerRadius);
        viewSpheres.setMatrix(cg.mInverse(vm));


        target.identity().move(targetLocation).scale(targetScale).opacity(.7);
        let ml = controllerMatrix.left;
        let mr = controllerMatrix.right;

        let leftInAny = ifHitAny(ml);
        if (leftInAny != -1) {
            // left controller hit something
            OnHit(leftInAny, buttonState.left[0].pressed, leftTriggerPrev, ml);
            leftTriggerPrev = buttonState.left[0].pressed;
        } else {
            let rightInAny = ifHitAny(mr);
            if (rightInAny != -1) {
                OnHit(rightInAny, buttonState.right[0].pressed, rightTriggerPrev, mr);
                rightTriggerPrev = buttonState.right[0].pressed;
            }
        }

        if (isSuccess() && gameEndW == null) {
            // console.log("DONE");
            gameEndW = GameEnd();
        }
        if (gameEndW)
        {
            gameEndW.hud().scale(.4, .4, .0001);
        }
    });
}
// import * as global from "../global.js";
// import { quat } from "../render/math/gl-matrix.js";
// import { Gltf2Node } from "../render/nodes/gltf2.js";
// const PI = 3.1415926;
// const grid_size = 60;
// const center = [0, 1.5, 0];
// const radius = 0.0001;
// const collisionSphereRad = .16;
// const large = 1.25;
// const small = .1;
// const sea_size = [5, 1, 5];
// const seabed_size = [5., .125, 5.];
// const seabed_pos= [.0, -.95, .0];
// const terrain_pos= [.0, -.8, .0];
// const iPositions = [[-2, 0, 0], [0, 1, 1], [1.2, 2, -1]]; // Island positions
// const lPositions = [[-1, .5, .5], [.6, 1.5, 0]]; // Ladder positions
// const innerRadius =.6;
// const outerRadius =.8;
//
//
// export const init = async model => {
//     console.log("hello?");
//
//     let gltf1 = new Gltf2Node({ url: './media/gltf/box-gltf/box.gltf' });
//     let gltf2 = new Gltf2Node({ url: './media/gltf/sunflower/sunflower.gltf' });
//     let rotation1 = quat.create();
//     let rotation2 = quat.create();
//
//     gltf1.addNode(gltf2);
//     gltf1.translation = [0, 1.5, 0];
//     gltf1.scale = [.1,.1,.1];
//
// //  gltf2.matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.5,0,1]; // You can also set the matrix directly.
//     gltf2.translation = [0, 1, 0];
//     gltf2.scale = [5,5,5];
//
//     global.gltfRoot.addNode(gltf1);
//     model.animate(() => {
//         quat.rotateY(rotation1, rotation1, -0.003);
//         quat.rotateY(rotation2, rotation2,  0.030);
//
//         gltf1.rotation = rotation1;
//
//         gltf2.translation = [0, 1.5 + .5 * Math.sin(model.time * 10), 0];
//         gltf2.rotation = rotation2;
//     });
// }
// //
// //
// // import { controllerMatrix, buttonState, joyStickState, viewMatrix } from "../render/core/controllerInput.js";
// // import * as cg from "../render/core/cg.js";
// // import { g2 } from "../util/g2.js";
// // import * as global from "../global";
// // import {Gltf2Node} from "../render/nodes/gltf2";
// //
// // const ItemsToCollect =
// //     [
// //         { location: [0.2, 1, .5], scale: .3 /*[.3, .3, .3]*/ },
// //         { location: [0, 1, .5], scale: .3/*[.1, .1, .1]*/ },
// //         { location: [-0.2, 1, .5], scale: .3/*[.1, .1, .1]*/ },
// //     ];
// //
// // const ground = .2;
// // const targetScale = [0.5, .3, .5];
// // const targetLocation = [0.8, ground+targetScale[1]/2, .2];
// //
// // const failingOffset = .001;
// //
// // let prevPos = [0, 0, 0];
// //
// // let leftTriggerPrev = false;
// // let rightTriggerPrev = false;
// //
// // export const init = async model => {
// //     console.log("hello hello!");
// //
// //     let world = model.add();
// //
// //     let objsInScene = [];
// //     // let generateObjects = () => {
// //     let counter = 0;
// //     for (const objInfo of ItemsToCollect) {
// //         let obj = world.add('cube');
// //         objsInScene.push({ obj: obj, index: counter, location: objInfo.location, scale: objInfo.scale, matrix: null, inMovement: false, color: [1,1,1]});
// //         counter += 1;
// //     }
// //
// //     let target = world.add('cube');
// //     // }
// //
// //     let placeObjects = () => {
// //         for (const objInfo of objsInScene) {
// //             let obj = objInfo.obj;
// //             let scale = objInfo.scale;
// //             if (objInfo.matrix == null) {
// //                 obj.identity().move(objInfo.location).color(objInfo.color).scale(scale);
// //                 objInfo.matrix = obj.getMatrix();
// //             } else {
// //                 let objGround = Array.isArray(objInfo.scale) ? ground+(objInfo.scale[1]/2) : (ground+objInfo.scale/2);
// //
// //                 if (objInfo.inMovement && objInfo.matrix[13] > objGround) {
// //
// //                     objInfo.matrix[13] -= failingOffset;
// //                     //failing
// //                     // console.log(` failing : ${objInfo.matrix[13]}`);
// //                     // obj.identity().move(0,-failingOffset,0).scale(scale);
// //                     // objInfo.matrix = obj.getMatrix();
// //
// //                 }
// //                 obj.setMatrix(objInfo.matrix).color(objInfo.color).scale(scale);
// //             }
// //         }
// //
// //     }
// //
// //     let isInBox = (p, box) => {
// //
// //         // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.
// //         // console.log(`controller: ${p};; box: ${box.getMatrix()}`);
// //         let q = cg.mTransform(cg.mInverse(box.getGlobalMatrix()), p);
// //
// //         // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.
// //
// //         return q[0] >= -1 & q[0] <= 1 &&
// //             q[1] >= -1 & q[1] <= 1 &&
// //             q[2] >= -1 & q[2] <= 1;
// //     }
// //
// //     let ifHitAny = (controllerM) => {
// //         let m = controllerM.slice(12, 15);
// //
// //         for (let i = 0; i < objsInScene.length; i++) {
// //             const b = isInBox(m, objsInScene[i].obj);
// //             // console.log(b)
// //             if (b) {
// //                 objsInScene[i].color = [0, 0, 1];
// //                 return i;
// //             }else{
// //                 objsInScene[i].color = [1, 1, 1];
// //             }
// //         }
// //         return -1;
// //     }
// //
// //     let OnHit = (objIndex, trigger, triggerPrev, m) => {
// //         let hitObjInfo = objsInScene[objIndex];
// //         hitObjInfo.color= [0, 0, 1];
// //
// //         // console.log(` pressed: ${trigger}`);
// //         if (trigger) {
// //             hitObjInfo.color= [1, 0, 0];
// //             let B = m.slice(12, 15);
// //             if (!triggerPrev)
// //                 prevPos = B;
// //             else
// //                 hitObjInfo.matrix = cg.mMultiply(cg.mTranslate(cg.subtract(B, prevPos)), hitObjInfo.matrix);
// //
// //             prevPos = B;
// //         } else if (triggerPrev) {
// //             hitObjInfo.inMovement = true;
// //         }
// //
// //         // croquet update each object matrix using objIndex
// //     }
// //
// //     let isSuccess = () => {
// //         let counter = 0;
// //         for (let i = 0; i < objsInScene.length; i++) {
// //             // console.log(objsInScene[i].obj.getGlobalMatrix());
// //             const b = isInBox(objsInScene[i].obj.getGlobalMatrix().slice(12,15), target);
// //
// //             if (b) {
// //                 objsInScene[i].color = [0,1,0];
// //                 counter +=1;
// //             }
// //         }
// //         if (counter == objsInScene.length)
// //         {
// //             return true;
// //         }
// //     }
// //
// //     let gameEndW = null;
// //     let GameEnd = () => {
// //         let EndWidget = model.add('cube').texture(() => {
// //             g2.setColor('white');
// //             // g2.fillRect(.1,0,.8,1);
// //             g2.fillRect(.1, 0, 1, .5);
// //             g2.textHeight(.09);
// //             g2.setColor('black');
// //             g2.fillText(`DONE!!!`, .5, .4, 'center');
// //
// //             g2.drawWidgets(EndWidget);
// //         });
// //         return EndWidget;
// //     }
// //
// //     // generateObjects();
// //
// //     model.animate(() => {
// //         placeObjects();
// //         target.identity().move(targetLocation).scale(targetScale).opacity(.7);
// //         let ml = controllerMatrix.left;
// //         let mr = controllerMatrix.right;
// //
// //         let leftInAny = ifHitAny(ml);
// //         if (leftInAny != -1) {
// //             // left controller hit something
// //             OnHit(leftInAny, buttonState.left[0].pressed, leftTriggerPrev, ml);
// //             leftTriggerPrev = buttonState.left[0].pressed;
// //         } else {
// //             let rightInAny = ifHitAny(mr);
// //             if (rightInAny != -1) {
// //                 OnHit(rightInAny, buttonState.right[0].pressed, rightTriggerPrev, mr);
// //                 rightTriggerPrev = buttonState.right[0].pressed;
// //             }
// //         }
// //
// //         if (isSuccess() && gameEndW == null) {
// //             // console.log("DONE");
// //             gameEndW = GameEnd();
// //         }
// //         if (gameEndW)
// //         {
// //             gameEndW.hud().scale(.4, .4, .0001);
// //         }
// //     });
// //}