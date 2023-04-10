import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

import * as global from "../global.js";
import { quat } from "../render/math/gl-matrix.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";
import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";

let t = Date.now() / 1000;
let offset = [-.0025, .005, -.03];
let bend = Math.PI / 4;
let prevTranslation = [0,0,0];
let prevLT = 0;
let prevRT = 0;
let oscillation = 1;
let upCount = 0;
let forwardCount = 0;
let rightCount = 0;


export const init = async model => {

    let gltf1 = new Gltf2Node({ url: './media/gltf/bbcourt/scene.gltf' });
    let gltf2 = new Gltf2Node({ url: './media/gltf/sky/scene.gltf' });
    let rotation1 = quat.create();
    let rotation2 = quat.create();

    let backgroundWidget = model.add();
    let obj5 = backgroundWidget.add('cube')
        .texture(() => {
            g2.setColor('white');
            g2.fillRect(0,0,1.5,1);
            g2.setColor('black');
            g2.textHeight(.05);
            g2.drawWidgets(obj5);
        });
    obj5.value = [.8,.8];
    g2.addWidget(obj5, 'button', .2, .5, '#8080ff', 'L', value => {rightCount = -1},2);
    g2.addWidget(obj5, 'button', .8, .5, '#ff8080', 'R', value => {rightCount = 1},2);
    g2.addWidget(obj5, 'button', .5, .2, '#80ffff', 'backward', value => {forwardCount = 1},2);
    g2.addWidget(obj5, 'button', .5, .8, '#80ffff', 'forward', value => {forwardCount = -1},2);


    // gltf1.addNode(gltf2);
    gltf1.translation = [0, 0, 0];
    gltf1.scale = [1.5,1.5,1.5];


    global.gltfRoot.addNode(gltf1);
    global.gltfRoot.addNode(gltf2);
    gltf2.translation = [0, 4, 0];
    gltf1.scale = [.5,.5,.5];

    model.setTable(false);
    model.setRoom(false);


    model.animate(() => {
        backgroundWidget.hud().scale(.2,.2,.0001).move(3,-3,3);
        let lt = buttonState.left[0].pressed;
        let lt2 = buttonState.left[1].pressed;
        if ( buttonState.right[0].pressed){
            forwardCount = 1;
        }
        else if ( buttonState.right[1].pressed){
            forwardCount = -1;
        }
        else{
            forwardCount = 0;
        }
        if (lt){

            prevLT ++;
            if (prevLT > 0){
                upCount = Math.min(10,1 * Math.pow(1.05,prevLT));
            }
            else{
                upCount = 1;
            }
        }
        else{
            prevLT = 0;
        }

        if (lt2){
            prevRT ++;
            if (prevRT > 0){
                upCount = Math.max(-10,-1 * Math.pow(1.05,prevRT));
            }
            else{
                upCount = -1;
            }
        }
        else{
            prevRT = 0;
        }

        if (!lt && !lt2){
            upCount = 0;
        }

        // global.gltfRoot.translation = cg.add(prevTranslation,cg.scale(m.slice(12, 15) * 0.01));
        if (upCount == 0){
            if (prevTranslation[1] < -5){
                oscillation = Math.random()*4 - 2;
            }
            else{
                oscillation = 0;
            }
            global.gltfRoot.translation = cg.add(prevTranslation, [-.01 * oscillation,-.01 * oscillation, .02 * forwardCount]);
        }else{
            global.gltfRoot.translation = cg.add(prevTranslation, [0,-.01 * upCount, 0.02 * forwardCount]);
        }

        prevTranslation = global.gltfRoot.translation;
    });
}