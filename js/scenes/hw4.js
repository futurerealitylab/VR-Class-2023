import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';
import { g2 } from "../util/g2.js";
import { matchCurves } from "../render/core/matchCurves.js";

let center1 = [0,1.5,0];
let center2 = [0,1.5,0];
let radius = 0.1;

export const init = async model => {
    
    model.setTable(false);

    let a = [-1, 0, 0, -1, 0, 0], A = [ 1, 0, 0,  1, 0, 0],
       b = [ 0,-1, 0,  0,-1, 0], B = [ 0, 1, 0,  0, 1, 0],
       c = [ 0, 0,-1,  0, 0,-1], C = [ 0, 0, 1,  0, 0, 1];
    clay.defineMesh('smooth_octahedron', clay.trianglesMesh([
        a,b,C, a,B,c, A,b,c, A,B,C, a,C,B, A,c,B, A,C,b, a,c,b
    ]));
    clay.defineMesh('special_object', clay.combineMeshes([
        [ 'smooth_octahedron', cg.mScale(.5), [.8,.8,.5] ], // shape, matrix, color
        [ 'donut', cg.mScale(1), [.5,.5,.5  ] ], // shape, matrix, color
     ]));
    
    // Create the ball1
    let ball1 = model.add('special_object');
    let ball2 = model.add('special_object');
    let status = true;
    let shoot = true;
    let array = new Array(0);
    let score = 0;
    let highestScore = 0;
    let timeLimit = 30;
    let countDown = timeLimit;
    let startTime;


    // Main Menu
    let menu = model.add('cube').texture(() => {
        g2.setColor('white');
        g2.fillRect(.1,.4,.8,.35);
        g2.setColor('black');
        g2.fillText('Mode', .5, .65, 'center');
        if (! g2.drawWidgets(menu)){
            if (g2.mouseState() == 'press') {
                if (menu.ST) {
                    //  panel.paths = [];
                    menu.ST = null;
                }
            }
        }
    });
    menu.ST = null;
    menu.mode = 0;
    g2.addWidget(menu, 'button', .35, .5, '#8080ff', 'Create', () => { menu.mode = 0; });
    g2.addWidget(menu, 'button', .65, .5, '#ff8080', 'Game', () => { menu.mode = 1; scoreBoard.reset = true;  });


    // Create the panel
    let panel = model.add('cube').texture(() => {
        g2.setColor('white');
        g2.fillRect(.2,.1,.6,1);
        g2.setColor('black');
        g2.fillText('Controller', .5, .9, 'center');
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
    panel.Rcolor = .5;
    panel.Gcolor = .5;
    panel.Bcolor = .5;
    panel.ST = null;
    g2.addWidget(panel, 'slider', .5, .7, '#80ffff', 'opacity', value => panel.opacity = value);
    g2.addWidget(panel, 'slider', .5, .55, [panel.Rcolor, 0, 0, 1], 'R', value => panel.Rcolor = value);
    g2.addWidget(panel, 'slider', .5, .4, [0, panel.Gcolor, 0, 1], 'G', value => panel.Gcolor = value);
    g2.addWidget(panel, 'slider', .5, .25, [0, 0, panel.Bcolor, 1], 'B', value => panel.Bcolor = value);

    // Score Board
    // Main Menu
    let scoreBoard = model.add('cube').texture(() => {
        g2.setColor('white');
        g2.fillRect(.2,.2,.62,.7);
        g2.setColor('red');
        if(countDown > timeLimit){
            let cd = "Ready: " + (countDown-timeLimit);
            g2.fillText(cd.slice(0,12), .5, .8, 'center');
        }
        else if(countDown >= 0){
            let cd = "Timer: " + countDown; 
            g2.fillText(cd.slice(0,12), .5, .8, 'center');       
        }
        else{
            let cd = "Game Ended";
            g2.fillText(cd, .5, .8, 'center');
        }
        // g2.fillText(cd.slice(0,18), .5, .8, 'center');
        g2.setColor('black');
        g2.fillText('Score: ' + score, .5, .65, 'center');
        g2.setColor('blue');
        g2.fillText('Highest: ' + highestScore, .5, .5, 'center');
        if (! g2.drawWidgets(scoreBoard)){
            if (g2.mouseState() == 'press') {
                if (scoreBoard.ST) {
                    //  panel.paths = [];
                    scoreBoard.ST = null;
                }
            }
        }
    });
    scoreBoard.ST = null;
    scoreBoard.reset = true;
    g2.addWidget(scoreBoard, 'button', .5, .35, '#ff8080', 'Restart', () => { scoreBoard.reset = true; });

    model.animate(() => {        
        // let rt = buttonState.right[0].pressed;
        if(menu.mode == 0){
            let lpoint = lcb.projectOntoBeam(center1);
            let ldiff = cg.subtract(lpoint, center1);
            let lhit = cg.norm(ldiff) < radius;
            let lt = buttonState.left[0].pressed;

            if (lhit && lt){
                if(status && (menu.mode == 0)){
                    let tempSphere = model.add('special_object');
                    tempSphere.t = model.time;
                    tempSphere.pos = center1;
                    tempSphere.opa = panel.opacity;
                    tempSphere.col = [panel.Rcolor, panel.Gcolor, panel.Bcolor];
                    array.push(tempSphere);
                }
                center1 = lpoint;
                status = false;
            }
            if (!lhit || !lt){
                status = true;
            }

            ball1.color(lhit ? lt ? 
                [(panel.Rcolor*1.4)>1? 1:(panel.Rcolor*1.4), (panel.Gcolor*1.4)>1? 1:(panel.Gcolor*1.4), (panel.Bcolor*1.4)>1? 1:(panel.Bcolor*1.4)]
                : [(panel.Rcolor*1.2)>1? 1:(panel.Rcolor*1.2), (panel.Gcolor*1.2)>1? 1:(panel.Gcolor*1.2), (panel.Bcolor*1.2)>1? 1
                :(panel.Bcolor*1.2)] : [panel.Rcolor, panel.Gcolor, panel.Bcolor]);
            ball1.identity().move(center1).scale(radius);
            ball1.opacity(.001+panel.opacity);
            ball2.identity().move(center2).scale(radius).opacity(.01);
            panel.hud().move(.3,-.2,1).scale(.3,.3,.0001);
            scoreBoard.hud().move(.3,-.2,1).scale(.001,.001,.0001);
            // panel.identity().move(1,1.2,0).turnY(-Math.PI/4).turnX(-Math.PI/16).scale(.4,.4,.0001);
            for (let i = 0; i < array.length; i++){
                // array[i].identity().move(Math.sin((model.time - array[i].t)),0,0);
                array[i].identity().move(array[i].pos).opacity(array[i].opa).color(array[i].col).scale(.1);
            }
        }
        else{
            if(countDown < 0){
                highestScore = highestScore>score? highestScore:score;
            }
            if(scoreBoard.reset){
                startTime = model.time+3;
                scoreBoard.reset = false;
                score = 0;
            }
            if(shoot){
                center2 = [2*Math.random()-1,.5+Math.random(),2*Math.random()-1];
                shoot = false;
            }
            countDown = model.time - startTime;
            countDown = timeLimit - countDown;
            // SEE WHETHER LEFT CONTROLLER BEAM HITS THE ball1
            let lpoint = lcb.projectOntoBeam(center2);
            let rpoint = rcb.projectOntoBeam(center2);
            let ldiff = cg.subtract(lpoint, center2);
            let rdiff = cg.subtract(rpoint, center2);
            let lhit = cg.norm(ldiff) < radius;
            let rhit = cg.norm(rdiff) < radius;
            let lt = buttonState.left[0].pressed;
            let rt = buttonState.right[0].pressed;
            if(lhit && rhit && lt && rt && (countDown>=0) && (countDown<=timeLimit)){
                score += 2;
                shoot = true;
            }
            else if(((lhit && lt) || (rhit && rt)) && (countDown>=0) && (countDown<=timeLimit)){
                score += 1;
                shoot = true;
            }
            ball2.identity().move(center2).scale(radius).opacity(1);
            scoreBoard.hud().move(.35,-.2,1).scale(.3,.3,.0001);

            // zero opacity
            ball1.identity().move(center2).scale(radius).opacity(.01);
            panel.hud().move(.3,-.2,1).scale(.001,.001,.0001);
            for (let i = 0; i < array.length; i++){
                array[i].identity().move(array[i].pos).opacity(0.01).scale(.1);
            }

        }
        menu.hud().move(0,.25,1).scale(.3,.3,.0001);

    });
}


