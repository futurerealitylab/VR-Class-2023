import * as cg from "../render/core/cg.js"; 
import { controllerMatrix, buttonState, joyStickState, viewMatrix } from "../render/core/controllerInput.js";
import { SimulateMovement } from './simulateMovement.js';
import { lcb, rcb } from '../handle_scenes.js';
import { g2 } from "../util/g2.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";
import * as global from "../global.js";
import { quat } from "../render/math/gl-matrix.js";

export const init = async model => {
    model.setTable(false);
    model.setRoom(false)

    // let world = model.add('sphere').texture('media/textures/space.png');
    let world = model.add('sphere').texture('media/textures/space2.jpg');

    // let object = world.add('cube').scale(.001);

    // let timeLastClick = 0;

    let fuelBar = model.add('cube').texture(() => {
        g2.drawWidgets(fuelBar);
    });
    fuelBar.value = 1;
    let bar = g2.addWidget(fuelBar, 'slider', .375, .068, '#80ffff', 'fuel', value => {});
    // bar.setValue(fuelBar.value);

    let sm = new SimulateMovement(world.getMatrix().slice(12,15));
    // console.log(world.getMatrix().slice(12,15));

    let gltf1 = new Gltf2Node({ url: './media/gltf/space/space.gltf'});
    global.gltfRoot.addNode(gltf1);

    // global.gltfRoot.addNode(barrel);
    let barrelRot = quat.create()

    gltf1.scale = [10,10,10];
    
    // let obj = model.add("cube");
    let forceCost = .001;

    let isInBox = (p, boxObj) => {
      
        let m = boxObj.worldMatrix.slice(12,15);
        // console.log(`view M: ${p};; barrel location: ${m}`);
        // let q = cg.mTransform(cg.mInverse(boxObj.worldMatrix()), p);
    
      
        // return q[0] >= -1 & q[0] <= 1 &&
        //        q[1] >= -1 & q[1] <= 1 &&
        //        q[2] >= -1 & q[2] <= 1 ;
        const boxDimensions = { x: .5, y: .7, z: .5 };
        const boxCenter = { x: m[0], y: m[1]+.15, z: m[2] };

        // console.log(`BOX CENTER ${m}`);
        // console.log(`VIEW ${p}`);
        const distanceX = Math.abs(p[0] - boxCenter.x);
        const distanceY = Math.abs(p[1] - boxCenter.y);
        const distanceZ = Math.abs(p[2] - boxCenter.z);
        // console.log(`${distanceX} distanceX ${distanceY} distanceY ${distanceZ} distanceZ`);
        
        // Compare the distances to the half-dimensions of the box
        if (distanceX <= boxDimensions.x / 2 && 
            distanceY <= boxDimensions.y / 2 && 
            distanceZ <= boxDimensions.z / 2) {
            return true;
        } 
        return false;
     }

    //  let b = false;

     let barrels = [];
     let currentBarrelsCenter = cg.mInverse(views[0].viewMatrix).slice(12,15);
     let numOfBarrels = 40;
    // let numOfBarrels = 0;
     let barrelRadius = 10;
     let maxR = barrelRadius/2;
     let minR = -barrelRadius/2;
     let gain = new Audio('../../media/sound/Kirby/ability-gain.wav');
     let ammoutInBarrel = .2;
     let generateBarrels = () => {
        
        removeAllBarrels();
        let currentCenter = cg.mInverse(views[0].viewMatrix).slice(12,15);
        
        currentBarrelsCenter = world.getMatrix().slice(12,15);
        let offSet = cg.subtract(currentCenter, currentBarrelsCenter);

        let locations = [];
        for (let i = 0; i < numOfBarrels; i++) {
            let x = Math.random() * (barrelRadius) + minR;
            let y = Math.random() * ( barrelRadius) + minR;
            let z = Math.random() * ( barrelRadius) + minR;
            let barrelLocation = [x+currentCenter[0],y+currentCenter[1],z+currentCenter[2]];
            
            while (locations.includes(barrelLocation)) {
                let x = Math.random() * ( barrelRadius) + minR;
                let y = Math.random() * ( barrelRadius) + minR;
                let z = Math.random() * ( barrelRadius) + minR;
                barrelLocation = [x+currentCenter[0],y+currentCenter[1],z+currentCenter[2]];
            }
            // barrelLocation = cg.add(barrelLocation, offSet);
            locations.push(barrelLocation);

            let barrel = new Gltf2Node({ url: './media/gltf/barrel/barrel_03_4k.gltf'});
            barrel.translation = barrelLocation;
            barrel.scale = [.06,.06,.06];
            gltf1.addNode(barrel);
            // console.log(barrelLocation);
            barrels.push(barrel);
        }
     } 

     let removeAllBarrels = () => {
        barrels = [];
        for (const barrel of barrels){
            gltf1.removeNode(barrel);
        }
     }
     
     let rotateBarrels = () => {
        quat.rotateY(barrelRot, barrelRot, 0.01);
        for (const barrel of barrels){
            // console.log(barrel);
            barrel.rotation = barrelRot;
        }
     }

     let checkIfHitBarrels = () => {
        let index = 0;
        for (const barrel of barrels){
            const b = isInBox(cg.mInverse(views[0].viewMatrix).slice(12,15), barrel);
            if(b){ 
                OnHitBarrel(barrel);
                barrels.splice(index, 1);
                return;
            }
            index ++; 
        }
        
     }

     let OnHitBarrel = (barrel) => {
        gltf1.removeNode(barrel);
        fuelBar.value = Math.min(fuelBar.value + ammoutInBarrel, 1);
        gain.play();
     }

    model.animate(() => {
        let viewM = cg.mInverse(views[0].viewMatrix).slice(12,15);
        let worldM = world.getMatrix().slice(12,15);
        // cg.distance(currentBarrelsCenter, worldM) > 10 ||
        if ( barrels.length <3 ){
            generateBarrels();
        } 
        // console.log(`${viewM} viewM ${currentBarrelsCenter} currentBarrelsCenter`);
        // console.log(cg.distance(currentBarrelsCenter, worldM));
        rotateBarrels();
        // console.log(fuelBar.value);
        let rightTrigger = buttonState.right[0].pressed;
        if (rightTrigger){
            // let timeDiff = model.time - timeLastClick;
            if (fuelBar.value > 0) {
            //     last = model.time;
                let forceDir = cg.scale(rcb.beamMatrix().slice(8,11),-1);
                sm.applyForce(model.time, forceDir);
                fuelBar.value = Math.max(fuelBar.value - forceCost, 0);
                // console.log(fuelBar.value);
            // console.log(direction);
            }else{
                // fuelBar.label = "NO FUEL!!";
                // fuelBar.color = "red";
                g2.myAddWidget(fuelBar, 'MyTextbox', .35, .2, .4, .1, .1, 'red', '#ffffff', "NO FUEL!!", .6, () => { });
            }
        }
        // sm.getPosition(model.time);
        let newP = sm.getPosition(model.time);

        world.identity().move(cg.scale(newP,-.1)).scale(100,100,-100);
        gltf1.translation = cg.scale(newP,-.1);
        fuelBar.setMatrix(rcb.beamMatrix()).move(0,0.43,-0.6).scale(.2,.2,.0001);
        bar.setValue(fuelBar.value);

        checkIfHitBarrels();
        
        // obj.identity().move(cg.mInverse(views[0].viewMatrix).slice(12,15)).scale(.1,.15,.1);
        // if(!b){
        //     b = isInBox(viewM, barrel);
        // }
        
        // let matrix = obj.getGlobalMatrix();
        // const sx = Math.sqrt(matrix[0] * matrix[0] + matrix[1] * matrix[1] + matrix[2] * matrix[2]);
        // const sy = Math.sqrt(matrix[4] * matrix[4] + matrix[5] * matrix[5] + matrix[6] * matrix[6]);
        // const sz = Math.sqrt(matrix[8] * matrix[8] + matrix[9] * matrix[9] + matrix[10] * matrix[10]);
        // console.log(`Object size: ${sx} x ${sy} x ${sz}`);
        // if(b)
        // {
        //     gltf1.removeNode(barrel);
        // }
        // console.log(b);

    });
}