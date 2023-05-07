import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";

const DEGREE_90 = 1.5708;
const G = 50.8;
const MASS = .4;

export const init = async model => {
    let fly = new Audio('../../media/sound/Kirby/jump.wav');
    let gain = new Audio('../../media/sound/Kirby/ability-gain.wav');

    let isAnimate = true, isBlending = true, isRubber = true, t = 0;
 
    model.control('a', 'animate' , () => isAnimate  = ! isAnimate );
    model.control('b', 'blending', () => isBlending = ! isBlending);
    model.control('r', 'rubber'  , () => isRubber   = ! isRubber  );
 
    // model.color(1,.5,.5);
 
    model.move(0,1.5,0).scale(.3);
    clay.defineMesh('grid', clay.createGrid(60, 60));
    clay.defineMesh('grid2', clay.createGrid(60, 60));
    let body = model.add('sphere').color(215/256,72/256,148/256);
    let eye1 = body.add('sphere').color(0,0,1);
    let eyeBlack = eye1.add('sphere').color(0,0,0);
    let eyeball = eye1.add('sphere').color(1,1,1);
    let eye2 = body.add('sphere').color(0,0,1);
    let eyeBlack2 = eye2.add('sphere').color(0,0,0);
    let eyeball2 = eye2.add('sphere').color(1,1,1);

    let leftArm = body.add('sphere').color(215/256,72/256,148/256);
    let rightArm  = body.add('sphere').color(215/256,72/256,148/256);
    let leftFeet = body.add('grid').color(175/256,20/256,20/256);//.opacity(.7);
    let rightFeet = body.add('grid').color(175/256,20/256,20/256);

    let a1 = [-1, 0, 0, -1, 0, 0], a2 = [1, 0, 0, 1, 0, 0],
        b1 = [0, -1.8, 0, 0, -1, 0], b2 = [0, -1.8, 0, 0, 1, 0],
        c1 = [0, 0, -1, 0, 0, -1], c2 = [0, 0, 1, 0, 0, 1];
    clay.defineMesh('arrow', clay.trianglesMesh([a1, b1, c2, a1, b2, c1, a2, b1, c1, a2, b2, c2, a1, c2, b2, a2, c1, b2, a2, c2, b1, a1, c1, b1]));
    
    // clay.defineMesh('star', clay.combineMeshes([
    //     // [ 'sphere', cg.mTranslate(0, 0, 0), [1,.5,.5]],
    //     // [ 'sphere', cg.mMultiply(cg.mScale(.04,.01,.01), cg.mTranslate(-1, -.5, 0)), [1,.5,.5]],
    //     // [ 'sphere', cg.mMultiply(cg.mScale(.04,.01,.01), cg.mTranslate(1, -.5, 0)), [1,.5,.5]],
    //     [ 'arrow',cg.mMultiply(cg.mRotateZ(DEGREE_90/2), cg.mTranslate(.07, -1.3, 0)), [1,.5,.5] ], // shape, matrix, color
    //     [ 'arrow',cg.mMultiply(cg.mRotateZ(-DEGREE_90/2), cg.mTranslate(-.07, -1.3, 0)), [1,.5,.5] ],
    //     [ 'arrow',cg.mMultiply(cg.mRotateZ(DEGREE_90), cg.mTranslate(.5, -1, 0)), [1,.5,.5]], 
    //     [ 'arrow',cg.mMultiply(cg.mRotateZ(-DEGREE_90), cg.mTranslate(-.5, -1, 0)), [1,.5,.5]],
    //     [ 'arrow',cg.mMultiply(cg.mRotateZ(DEGREE_90*2), cg.mTranslate(0, -1.1, 0)), [1,.5,.5]],
        
    // ]));
    //  let star = model.add('star');
    //  star.add('arrow');
    let star = model.add('cube').color([1,1,0]);
    // let a = star.add('sphere');
    // let b = star.add('sphere');

    let flyForce = 4;
    let curSpeed = 0;
    let upInitSpeed = 0;
    let timeReachMax = 0;
    let timeStarted = 0;
    let posStarted = 0;
    let curPos = -1.5;
    let onUp = false;
    let timeLastClick = 0;
    let timeLastClickL = 0;
    let bturned = false;

    let starThreshold = 3;
    let timeLastGain = 0;
    let gainPlayed = true;

    let smile = body.add('grid2').color(0,0,0);

    
   let isInBox = p => {

    // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.

    let q = cg.mTransform(cg.mInverse(star.getMatrix()), p);

    // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.

    return q[0] >= -1 & q[0] <= 1 &&
           q[1] >= -1 & q[1] <= 1 &&
           q[2] >= -1 & q[2] <= 1 ;
 }

    let mapFoot = (u,v) => {
        let theta = 2 * Math.PI * u;
            let phi   = Math.PI * (v - .5);
            if (phi >= Math.PI / 2) {
                // Flat surface
                return[
                    0,
                (1 - v)  * Math.cos(theta),
                (1 - v)  * Math.sin(theta),
                ];
                
              } else {
    
            return [
                Math.sin(theta) *Math.sin(phi),
                Math.cos(theta) * Math.sin(phi),
                Math.cos(phi),
            ];}
    }

    let getFallingPos = (time) => {
        
        // console.log(time**2);
        curSpeed = -G* time;
        let pos = curPos - .5 * G * time**2;
        if (pos < -1.5) pos = -1.5;
        return pos;
        // return time/10;
    }

    let applyForce = (time) => {
        // console.log(time);
        // console.log(upInitSpeed);
        let pos = -.5*G* time**2 + time*(upInitSpeed);
        pos = pos+posStarted;
        curSpeed = upInitSpeed-G* time;
        if (pos > 3) pos = 3;
        if (pos < -1.5) pos = -1.5;
        // console.log(pos/100);
        // console.log(pos);
        return pos;
    }

    let playFlyAnimation =(curTime) => 
    {
        const timeDuration = .1;
        let time = curTime % timeDuration;
        //         arm
        //-DEGREE_90*1.3 to -DEGREE_90/3
        //-.2 .5
        let armRot = (x) => {return -9.67*x-.33}
        let armPosY = (x) => {return 7*x-.2}
        let armR = armRot(time);
        let armY = armPosY(time);
        console.log(armR);
        console.log(armY);
        leftArm.identity().move(-1,armY,0).turnZ(DEGREE_90*armR).scale(.3,.4,.3);
        rightArm.identity().move(1,armY,0).turnZ(-DEGREE_90*armR).scale(.3,.4,.3);
        

// foot 0,-.4,-1.2  to -1.1,0
// -.8,.-.8 -.9,-.7
// rotation -DEGREE_90/1.8 to -DEGREE_90/3
    let footRot = (x) => {return 2.23*x-.556}
    let footPosY = (x) => {return 6*x-.8}
    let footPosZ = (x) => {return -6*x-.8}
    let fRot = footRot(time);
    let y = footPosY(time);
    let z = footPosZ(time);
    leftFeet.identity().move(-.4,y,z).turnX(DEGREE_90*fRot).scale(.3,.4,.3);
    rightFeet.identity().move(.45,y,z).turnX(DEGREE_90*fRot).scale(.3,.4,.3);
    }

    let isUp = false;
    model.control('u', 'up' , () => isUp  = true );

    let gameStat = model.add('cube').texture(() => {
        // g2.setColor('white');
        // g2.fillRect(.1,0,.8,1);
        // g2.fillRect(.1, 0, .8, .5);
        g2.textHeight(.1);
        g2.setColor('black');
        g2.fillText('Press Trigger to fly');

        g2.drawWidgets(gameStat);
    });


    model.animate(() => {
        star.blend(isBlending);
        star.melt(isAnimate && ! isRubber);
       t += isAnimate ? model.deltaTime : 0;
       gameStat.hud().move(0,1.5,-1).scale(.2,.2,.0001);
    //    a.identity().turnZ(DEGREE_90/2).move(-.5,.2,0).scale(.3,.2,.2);
    //    b.identity().turnZ(-DEGREE_90/2).move(-.5,0,0).scale(.3,.2,.2);
       
       eye1.identity().move(-.23,0,.99).scale(.13,.33,.03);
       eyeBlack.identity().move(0,.23,.4).scale(1,.75,1);
       eyeball.identity().move(0,.46,.8).scale(.9,.5,1);

       eye2.identity().move(.28,0,.99).scale(.13,.33,.03);
       eyeBlack2.identity().move(0,.23,.4).scale(1,.75,1);
       eyeball2.identity().move(0,.46,.8).scale(.9,.5,1);

       leftArm.identity().move(-1,-.2,0).turnZ(-DEGREE_90/3).scale(.3,.4,.3);
       rightArm.identity().move(1,-.2,0).turnZ(DEGREE_90/3).scale(.3,.4,.3);
       leftFeet.identity().move(-.4,-.8,-.8).turnX(-DEGREE_90/1.8).scale(.3,.4,.3);
       rightFeet.identity().move(.45,-.8,-.8).turnX(-DEGREE_90/1.8).scale(.3,.4,.3);

       leftFeet.setVertices((u,v) => {return mapFoot(u,v);});
        // rightFeet.setVertices((u,v) => {return mapFoot(u,v);});
        // .3,.3,.001
        smile.identity().move(0,-.1,1.09).turnX(DEGREE_90/4).turnZ(-DEGREE_90-DEGREE_90/3.5).scale(.3,.3,.001);
        smile.setVertices((u,v) => {
            let R = .9;
            let r = .5;
            return [ 
                (R + r * Math.cos(v)) * Math.cos(u),
                (R + r * Math.cos(v)) * Math.sin(u),
                r * Math.sin(v),
            ];
        });

        let rightTrigger = buttonState.right[0].pressed;
        if (rightTrigger|| isUp) {
            let timediff = model.time - timeLastClick;
                if (timediff > .25) {
                    // console.log("click");
                    timeLastClick = model.time;
                    upInitSpeed = curSpeed +flyForce/MASS;
                    timeReachMax = upInitSpeed/G;
                    onUp = true;
                    posStarted = curPos;
                    timeStarted = model.time;
                    isUp = false;
                    fly.play();
                }
        }

        if (upInitSpeed == 0) upInitSpeed = curSpeed +flyForce/MASS;
        curPos = getFallingPos(model.deltaTime);
        if (onUp){
            if (timeStarted+timeReachMax < model.time)
            {
                onUp = false;
            }else{
                curPos = applyForce(model.time-timeStarted);
                // console.log(curPos);
                playFlyAnimation(model.time-timeStarted);
            }
        }

        let bodyPos = body.getMatrix().slice(12,15);
        let topBodyPos = [bodyPos[0], bodyPos[1]+.5, bodyPos[2]];
        let btnBodyPos = [bodyPos[0], bodyPos[1]-.5, bodyPos[2]];
        let bIfTouched = isInBox(topBodyPos) || isInBox(btnBodyPos)
        if (bIfTouched || model.time - timeLastGain < starThreshold)
        {
            console.log(model.time - timeLastGain < starThreshold);  
            star.identity().move(0,.5,0).scale(0);
            if(!gainPlayed) 
            {
                gain.play();
                gainPlayed = true;
                timeLastGain = model.time;
            }
        }
        else
        {
            // console.log("show");
            star.identity().move(0,.5,0).scale(.3);
            gainPlayed = false;
        }

        let rightTriggerL = buttonState.right[1].pressed;
        if (rightTriggerL) {
            let timediff = model.time - timeLastClickL;
                if (timediff > .5) {
                    timeLastClickL = model.time;
                    bturned = !bturned;
                }
            }
            
        if (bturned){
            body.identity().move(0,curPos,0).turnY(DEGREE_90).scale(.5);
        }else{
            body.identity().move(0,curPos,0).scale(.5);
        }

        if (curPos == -1.5){
            leftFeet.identity().move(-.4,-1.1,.4).turnX(-DEGREE_90).scale(.3,.4,.3);
            rightFeet.identity().move(.45,-1.1,.4).turnX(-DEGREE_90).scale(.3,.4,.3);
        }

    });
 }