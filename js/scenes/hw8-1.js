import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { g2 } from "../util/g2.js";
import { matchCurves } from "../render/core/matchCurves.js";

export const init = async model => {
    model.setTable(false);
    model.setRoom(false);
    let sw = true;
    let room = model.add('sphere').scale(100,100,-100).turnX(Math.PI/2).texture('media/textures/water.jpg');
    let ocean = new Audio('../../media/sound/ocean.mp3');
    let under_water = new Audio('../../media/sound/under_water.mp3')
    
    model.animate(() => {        
        let lx = joyStickState.left.x;
        let ly = joyStickState.left.y;
        let ry = joyStickState.right.y;
        if(sw){
            room.move(0,0,-.005*ry);
            ocean.play();
        }
        else{
            ocean.pause();
            under_water.play();
            room.move(-.003*lx, .003*ly ,-.003*ry);
        }
        
        //panel.zval = room.getMatrix().slice(12,15)[2];
        //panel.hud().move(.3,-.2,1).scale(.4,.4,.0001);;
        if(sw && room.getMatrix().slice(12,15)[2] > 6 * (10 ** -15)){
            sw = false;
            room.move(0,0,1.8).texture('media/textures/underwater.jpg');
        }

    });
}


