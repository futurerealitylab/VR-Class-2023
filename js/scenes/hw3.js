import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { g2 } from "../util/g2.js";
import { matchCurves } from "../render/core/matchCurves.js";

let center = [0,1.5,0];
let radius = 0.1;

export const init = async model => {

    // Create the ball
    let ball = model.add('sphere');
    let status = false;
    let array = new Array(0);

    // Create the panel
    let panel = model.add('cube').texture(() => {
        g2.setColor('white');
        g2.fillRect(.1,.6,.8,1);
        g2.setColor('black');
        g2.fillText('Opacity Controller', .5, .9, 'center');
        if (! g2.drawWidgets(panel)){
            if (g2.mouseState() == 'press') {
                if (panel.ST) {
                    //  panel.paths = [];
                    panel.ST = null;
                }
            }
        }
    });
    panel.opacity = .5;
    panel.ST = null;
    g2.addWidget(panel, 'slider', .5, .7, '#80ffff', 'opacity', value => panel.opacity = value);

    model.animate(() => {

        // SEE WHETHER LEFT CONTROLLER BEAM HITS THE BALL

        let lpoint = lcb.projectOntoBeam(center);
        let rpoint = rcb.projectOntoBeam(center);

        let ldiff = cg.subtract(lpoint, center);
        let rdiff = cg.subtract(rpoint, center);
        let lhit = cg.norm(ldiff) < radius;
        let rhit = cg.norm(rdiff) < radius;
        let lt = buttonState.left[0].pressed;
        let rt = buttonState.right[0].pressed;
        

        // IF SO, MOVE THE BALL WHEN THE TRIGGER IS DOWN

        if (lhit && rhit && lt && rt){
            center = rpoint;
            status = true;
        }
        if (!lhit || !rhit || !lt || !rt){
            if(status){
                let tempSphere = model.add('sphere');
                tempSphere.t = model.time;
                tempSphere.pos = center;
                array.push(tempSphere);
            }
            status = false;
        }

        // // When the controller is not pressec
        // if((!lt || !rt) && (status)){
        //     center = [0,1,0];
        // }
        // DISPLAY THE BALL

        ball.color(lhit ? lt ? [1,0,0] : [1,.5,.5] : [1,1,1]);
        ball.identity().move(center).scale(radius);
        ball.opacity(.001+panel.opacity);

        panel.identity().move(1,1,0).turnY(-Math.PI/4).turnX(-Math.PI/16).scale(.5,.5,.0001);

        for (let i = 0; i < array.length; i++){
            // array[i].identity().move(Math.sin((model.time - array[i].t)),0,0);
            array[i].identity().move(array[i].pos).scale(.1);
        }
    });
}

