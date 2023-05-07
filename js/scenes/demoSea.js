import { Gltf2Node } from "../render/nodes/gltf2.js";
import * as global from "../global.js";
import { controllerMatrix, buttonState, joyStickState, viewMatrix } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import * as cg from "../render/core/cg.js"; 
import { SimulateMovement } from './simulateMovement.js';
import { quat } from "../render/math/gl-matrix.js";

const ItemsToCollect =
    [
        { location: [1, 0, 0], scale: [.6,.6,.6], gltf: './media/gltf/barrel/barrel_03_4k.gltf', collisionBox: [.5, .7, .5] },
        { location: [0, 0, 0], scale: [.6,.6,.6], gltf: './media/gltf/barrel/barrel_03_4k.gltf', collisionBox: [.5, .7, .5] },
        { location: [-1, 0, 0], scale: [.6,.6,.6], gltf: './media/gltf/barrel/barrel_03_4k.gltf', collisionBox: [.5, .7, .5] },
    ];

export const init = async model => {
    let world = model.add('sphere').texture('media/textures/space2.jpg');
    let objsInScene = [];
    let gltf1 = new Gltf2Node({ url: './media/gltf/space/space.gltf' });
    global.gltfRoot.addNode(gltf1);
    model.setTable(false);
    model.setRoom(false);

    let gain = new Audio('../../media/sound/Kirby/ability-gain.wav');

    let box = null;
    let generateObjects = () => {
        let counter = 0;
        for (const objInfo of ItemsToCollect) {
            let obj = new Gltf2Node({ url: objInfo.gltf });
            obj.translation = objInfo.location;
            obj.scale = objInfo.scale;
            gltf1.addNode(obj);
            // console.log(barrelLocation);
            objsInScene.push({ obj: obj, index: counter });
            if (box == null){box =world.add('cube').scale(objInfo.scale);}
            
            counter += 1;
        }
    }

    let isInBox = (p, object) => {
        let boxObj = object.obj;
        let itemIndex = object.index;
        let m = boxObj.worldMatrix.slice(12, 15);

        const collisionBox = ItemsToCollect[itemIndex].collisionBox;
        const objScale = ItemsToCollect[itemIndex].scale;
        const boxDimensions = { x: collisionBox[0] * objScale[0], y: collisionBox[1] * objScale[0], z: collisionBox[2] * objScale[0] };
        const boxCenter = { x: m[0], y: m[1] + .15, z: m[2] };

        const distanceX = Math.abs(p[0] - boxCenter.x);
        const distanceY = Math.abs(p[1] - boxCenter.y);
        const distanceZ = Math.abs(p[2] - boxCenter.z);

        // Compare the distances to the half-dimensions of the box
        if (distanceX <= boxDimensions.x / 2 &&
            distanceY <= boxDimensions.y / 2 &&
            distanceZ <= boxDimensions.z / 2) {
            return true;
        }
        return false;
    };

    let ifHitAny = (controllerM) => 
    {
        let m = controllerM.slice(12,15);

        for (let i = 0; i < objsInScene.length; i++){
            const b = isInBox(m, objsInScene[i]);
            if(b){ 
                return i;
            }
        }
        return -1;
    }

    let OnHit = (objIndex) => {
        let hitObj = objsInScene[objIndex];
        gltf1.removeNode(hitObj);
        objsInScene.splice(objIndex, 1);
        gain.play();

        // update the list hud 
        // croquet

     }
    let sm = new SimulateMovement(world.getMatrix().slice(12,15));
    generateObjects();
    model.animate(() => {

        let ml = controllerMatrix.left;
        let mr = controllerMatrix.right;

        let leftInAny = ifHitAny(ml);
        if (leftInAny != -1){
            // left controller hit something
            OnHit(leftInAny);
        }else{
            let rightInAny = ifHitAny(mr);
            if(rightInAny != -1){
                OnHit(rightInAny);
            }
        }

        let rightTrigger = buttonState.right[4].pressed;
        if (rightTrigger){
            // let timeDiff = model.time - timeLastClick;
            // if (fuelBar.value > 0) {
            //     last = model.time;
                let forceDir = cg.scale(rcb.beamMatrix().slice(8,11),-1);
                sm.applyForce(model.time, forceDir);
                // fuelBar.value = Math.max(fuelBar.value - forceCost, 0);
                // console.log(fuelBar.value);
            // console.log(direction);
            // }else{
            //     g2.myAddWidget(fuelBar, 'MyTextbox', .35, .2, .4, .1, .1, 'red', '#ffffff', "NO FUEL!!", .6, () => { });
            // }
        }
        // sm.getPosition(model.time);
        let newP = sm.getPosition(model.time);

        world.identity().move(cg.scale(newP,-.1)).scale(100,100,-100);
        gltf1.translation = cg.scale(newP,-.1);
        box.identity().scale([.005, .007, .005]);
        // world.identity().scale(100,100,-100);
    });
}