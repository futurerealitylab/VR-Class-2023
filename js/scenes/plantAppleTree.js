import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

let bHasWater = false;
let timeLastClick = 0;

let rightTriggerPrev = false;
let prevPos = [0,0,0];
let treeScaleInc = 0;
let rootScaleInc = 0;

let bLeftApplePicked = false;
let bRightApplePicked = false;
let leftApplePickedS = 0;
let rightApplePickedS = 0;

export const init = async model => {
    let tree = model.add();
    let root = model.add('cube');
    // let trunk = tree.add("tubeY").color(82/256, 72/256, 53/256);
    let trunk = tree.add("tubeY").texture('../media/textures/trunk.jpg');
    // let branch = tree.add('sphere').texture('../media/textures/bush.jpg');
    let branch = tree.add('sphere').color(0/256, 160/256, 0/256);

    let apples = tree.add();
    let apple1 = apples.add();
    let b1 = apple1.add('tubeY').color(0,0,0).move(-.1, .875, 0).scale(.003,.01,.003);
    let fruit1 = apple1.add('sphere').color(1,0,0).move(-.1, .82, 0).scale(.045,.045,.045);

    let appless = tree.add();
    let apple3 = appless.add();
    let fruit3 = apple3.add('sphere').color(1,0,0).move(-.1, .82, 0).scale(.045,.045,.045);
    // let fruit5 = apple1.add('sphere').color(1,0,0).move(-.1, .82, 0).scale(.045,.045,.045);

    let apple2 = apples.add();
    let b2 = apple2.add('tubeY').color(0,0,0).move(.1, .875, 0).scale(.003,.01,.003);
    let fruit2 = apple2.add('sphere').color(1,0,0).move(.1, .82, 0).scale(.045,.045,.045);

    let apple4 = appless.add();
    let fruit4 = apple4.add('sphere').color(1,0,0).move(.1, .82, 0).scale(.045,.045,.045);
    // let fruit6 = apple1.add('sphere').color(1,0,0).move(-.1, .82, 0).scale(.045,.045,.045);

    let bLeftApplePicked = false;
    let bRightApplePicked = false;

    let growning = 0;
    let gSet = false;

    let MP1 = fruit1.getMatrix();
    let MP2 = fruit2.getMatrix();
    let MP3 = fruit3.getMatrix();
    let MP4 = fruit4.getMatrix();

    
    let soil = model.add();
    let soil1 = soil.add('cube').texture('../media/textures/soil.jpg').move(0,.8,0).scale(.3, .05, .3);
    let soil2 = soil.add('cube').texture('../media/textures/soil.jpg').move(.6,.8,0).scale(.3, .05, .3); 
    let soil3 = soil.add('cube').texture('../media/textures/soil.jpg').move(-.6,.8,0).scale(.3, .05, .3);  
    let soil4 = soil.add('cube').texture('../media/textures/soil.jpg').move(0,.8,.6).scale(.3, .05, .3); 
    let soil5 = soil.add('cube').texture('../media/textures/soil.jpg').move(.6,.8,.6).scale(.3, .05, .3);
    let soil6 = soil.add('cube').texture('../media/textures/soil.jpg').move(-.6,.8,.6).scale(.3, .05, .3);  
    let soil7 = soil.add('cube').texture('../media/textures/soil.jpg').move(0,.8,-.6).scale(.3, .05, .3);  
    let soil8 = soil.add('cube').texture('../media/textures/soil.jpg').move(.6,.8,-.6).scale(.3, .05, .3);  
    let soil9 = soil.add('cube').texture('../media/textures/soil.jpg').move(-.6,.8,-.6).scale(.3, .05, .3); 
    soil.add('cube').texture('../media/textures/soil.jpg').move(0,.8,-1.2).scale(.3, .05, .3);  
    soil.add('cube').texture('../media/textures/soil.jpg').move(-.6,.8,-1.2).scale(.3, .05, .3);
    soil.add('cube').texture('../media/textures/soil.jpg').move(.6,.8,-1.2).scale(.3, .05, .3);
    soil.add('cube').texture('../media/textures/soil.jpg').move(0,.8,1.2).scale(.3, .05, .3);  
    soil.add('cube').texture('../media/textures/soil.jpg').move(-.6,.8,1.2).scale(.3, .05, .3);
    soil.add('cube').texture('../media/textures/soil.jpg').move(.6,.8,1.2).scale(.3, .05, .3);         

    let water = model.add();

    let isInObj = (Obj, p) => {

        // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.

        let q = cg.mTransform(cg.mInverse(Obj.getMatrix()), p);

        // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.

        return q[0] >= -1 & q[0] <= 1 &&
            q[1] >= -1 & q[1] <= 1 &&
            q[2] >= -1 & q[2] <= 1;
    }

    let storeApple = (target, bTriggerX) => {

        target.color(204/256,0,0);
        if(bTriggerX)
        {
            // bRightAppleKept = true;
            // MP2 = fruit2.getMatrix();
            target.identity().scale(0);
        }
    }

    model.animate(() => {      
        // soil1.identity().move(0,.8,0).scale(.3, .05, .3);
        // soil2.identity().move(.6,.8,0).scale(.3, .05, .3);
        // soil3.identity().move(-.6,.8,0).scale(.3, .05, .3);
        // soil4.identity().move(0,.8,.6).scale(.3, .05, .3);
        // soil5.identity().move(.6,.8,.6).scale(.3, .05, .3);
        // soil6.identity().move(-.6,.8,.6).scale(.3, .05, .3);
        // soil7.identity().move(0,.8,-.6).scale(.3, .05, .3);
        // soil8.identity().move(.6,.8,-.6).scale(.3, .05, .3);
        // soil9.identity().move(-.6,.8,-.6).scale(.3, .05, .3);
        
        let ml = controllerMatrix.left;
        let mr = controllerMatrix.right;
        let rightTriggerX = buttonState.right[1].pressed;

        if(bLeftApplePicked && bRightApplePicked && !gSet) 
        {
            gSet = true;
            growning = treeScaleInc;
        }

        if (rightTriggerX )
        {
            let timediff = model.time - timeLastClick;
            if (timediff > .5) 
            {
                timeLastClick = model.time;
                if(!bHasWater)
                {
                    bHasWater = true;
                    water.add('sphere').texture('../media/textures/water.jpg')
                    .setMatrix(mr).scale(.1);  
                }else{
                    water.remove(water.child(0));
                    bHasWater = false;
                }
            }
        }

        if (bHasWater)
        {
            root.color(0,0,1);
            let waterMatrix = water.child(0).getMatrix();
            let bifWatering = isInObj(root, waterMatrix.slice(12, 15))
            if(bifWatering) 
            {
                root.color(1,.5,.5);
                treeScaleInc += .005;
                rootScaleInc += .00025;
            }

            water.child(0).setMatrix(mr).scale(.1);
        }else{
            root.color(0,0,0);
        }

        // apple
        if(treeScaleInc < .6)
        {
            apples.identity().scale(0);
            appless.identity().scale(0);
        }
        else if(bLeftApplePicked && bRightApplePicked && (treeScaleInc-growning) > 1)
        {
            appless.identity().scale(1);
            MP3 = fruit3.getMatrix();
            MP4 = fruit4.getMatrix();

            if (!bHasWater)
            {
                let trans = cg.mTransform(cg.mInverse(tree.getMatrix()), mr.slice(12,15));
                
                // left apple
                let bifPicking3 = isInObj(fruit3, trans);
                if(bifPicking3)
                {
                    fruit3.color(204/256,0,0);
                    let rightX = buttonState.right[0].pressed;
                    if(rightX)
                    {
                        let curPos = trans;
                        if (rightTriggerPrev)        
                        { 
                            MP3 = cg.mMultiply(cg.mTranslate(cg.subtract(curPos, prevPos)), MP3);
                        }
                        prevPos = curPos; 
                    }
                    rightTriggerPrev = rightX;
                }
                else
                {
                    fruit3.color(1,0,0);
                }
                fruit3.setMatrix(MP3);
                // if(bLeftApplePicked)
                //     fruit1.identity().scale(1+leftApplePickedS);

                // right apple
                let bifPicking4 = isInObj(fruit4, trans);
                if(bifPicking4)
                {
                    fruit4.color(204/256,0,0);
                    let rightX = buttonState.right[0].pressed;
                    if(rightX)
                    {
                        let curPos = trans;
                        if (rightTriggerPrev)        
                        { 
                            MP4 = cg.mMultiply(cg.mTranslate(cg.subtract(curPos, prevPos)), MP4);
                        }
                        
                        prevPos = curPos; 
                    }
                    rightTriggerPrev = rightX;
                }
                else
                {
                    fruit4.color(1,0,0);
                }
            }

            fruit4.setMatrix(MP4);
        }
        else 
        {
            appless.identity().scale(0);
            apples.identity().scale(1);
            MP1 = fruit1.getMatrix();
            MP2 = fruit2.getMatrix();

            if (!bHasWater)
            {
                let trans = cg.mTransform(cg.mInverse(tree.getMatrix()), mr.slice(12,15));
                
                // left apple
                let bifPicking1 = isInObj(fruit1, trans);
                if(bifPicking1)
                {
                    fruit1.color(204/256,0,0);
                    let rightX = buttonState.right[0].pressed;
                    if(rightX)
                    {
                        let curPos = trans;
                        bLeftApplePicked = true;
                        if (rightTriggerPrev)        
                        { 
                            MP1 = cg.mMultiply(cg.mTranslate(cg.subtract(curPos, prevPos)), MP1);
                        }

                        prevPos = curPos; 
                    }
                    rightTriggerPrev = rightX;
                }
                else
                {
                    fruit1.color(1,0,0);
                }
                fruit1.setMatrix(MP1);
                // if(bLeftApplePicked)
                //     fruit1.identity().scale(1+leftApplePickedS);

                // right apple
                let bifPicking2 = isInObj(fruit2, trans);
                if(bifPicking2)
                {
                    fruit2.color(204/256,0,0);
                    let rightX = buttonState.right[0].pressed;
                    if(rightX)
                    {
                        let curPos = trans;
                        bRightApplePicked = true;
                        if (rightTriggerPrev)        
                        { 
                            MP2 = cg.mMultiply(cg.mTranslate(cg.subtract(curPos, prevPos)), MP2);
                        }                   
                        prevPos = curPos; 
                    }
                    rightTriggerPrev = rightX;
                }
                else
                {
                    fruit2.color(1,0,0);
                }
            }

            fruit2.setMatrix(MP2);
            // if(bRightApplePicked)
            // fruit2.identity().scale(1+rightApplePickedS);
        }

        // left
        let trans = cg.mTransform(cg.mInverse(tree.getMatrix()), ml.slice(12,15));       
        // left apple
        let bifLeft1 = isInObj(fruit1, trans);
        // right apple
        let bifRight1 = isInObj(fruit2, trans);
        // left apple
        let bifLeft2 = isInObj(fruit3, trans);
        // right apple
        let bifRight2 = isInObj(fruit4, trans);

        let leftTriggerX = buttonState.left[0].pressed;
        if(bifLeft1)
        {
            storeApple(fruit1, leftTriggerX);
        }

        if(bifRight1)
        {
            storeApple(fruit2, leftTriggerX);
        }

        if(bifLeft2)
        {
            storeApple(fruit3, leftTriggerX);
        }

        if(bifRight2)
        {
            storeApple(fruit4, leftTriggerX);
        }

        tree.identity().move(0,.14-(treeScaleInc/1.5),0).scale(1+treeScaleInc, 1+treeScaleInc, 1+treeScaleInc);
        root.identity().move(0,.79,0).scale(.3+rootScaleInc, .05, .3+rootScaleInc);
        trunk.identity().move(0,.8,0).scale(.03, .15, .03);
        branch.identity().move(0,1.05,0).turnX(1.4).scale(.22, .19, .19);
    });
}