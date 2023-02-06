import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

/*********************************************************************************

This demo shows how you can do basic object manipulation with your controllers.


(1) Moving an object

    When you place your left controller inside the box, the box turns pink.

    Then when you squeeze the left trigger,
    the box turns red and moves together with your controller.


(2) Moving and rotating an object

    When you place your right controller inside the box, the box turns light blue.

    Then when you squeeze the right trigger,
    the box turns blue and both moves and rotates together with your controller.

*********************************************************************************/

let leftTriggerPrev = false;
let rightTriggerPrev = false;

let redMP  = cg.mTranslate(-0.3, 1.2, 1.1);
let blueMP = cg.mTranslate(0, 1.5, 1.1);
let greenMP = cg.mTranslate(.3, 1.2, 1.1);

let newCubeMP = cg.mTranslate(0, 1, 1.1);

let redNegMP  = cg.mTranslate(-0.3, 0.7, 1.1);
let blueNegMP = cg.mTranslate(0, 0.5, 1.1);
let greenNegMP = cg.mTranslate(.3, 0.7, 1.1);


let MP = cg.mTranslate(0,1,.5);
let A = [0,0,0];
let MA = cg.mIdentity();

let boxes = [];
let rgbs = [];
let MPs = [];
let As = [0,0,0];
let MAs = cg.mIdentity();

let redPercent = 0;
let greenPercent = 0;
let bluePercent = 0;

let currIndex = 0;
let currBox = null;
let currMP = null;
let currA = null;
let currMA = null;
let currRGB = null;

export const init = async model => {

   // CREATE THE BOX.

   let red = model.add('sphere').color(1,0,0);
   let green = model.add('sphere').color(0,1,0);
   let blue = model.add('sphere').color(0,0,1);

//    let newCube = model.add('cube').color(0.7,0.7,0.7);

   let redNeg = model.add('sphere').color(0.1,0,0);
   let greenNeg = model.add('sphere').color(0,0.1,0);
   let blueNeg = model.add('sphere').color(0,0,0.1);

   let box = model.add('cube');

   // FUNCTION TO RETURN TRUE IF A POINT IS INSIDE THE BOX, OTHERWISE FALSE.

   let isInBox = (p, b) => {

      // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.

      let q = cg.mTransform(cg.mInverse(b.getMatrix()), p);

      // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.

      return q[0] >= -1 & q[0] <= 1 &&
             q[1] >= -1 & q[1] <= 1 &&
             q[2] >= -1 & q[2] <= 1 ;
   }


    model.animate(() => {

        // FETCH THE MATRIXES FOR THE LEFT AND RIGHT CONTROLLER.

        let ml = controllerMatrix.left;
        let mr = controllerMatrix.right;

        // EXTRACT THE LOCATION OF EACH CONTROLLER FROM ITS MATRIX,
        // AND USE IT TO SEE WHETHER THAT CONTROLLER IS INSIDE THE BOX.

        let isLeftInBox  = isInBox(ml.slice(12,15), box);
        let isRightInBox = isInBox(mr.slice(12,15), box);

        // let isTouchingNewLeft  = isInBox(ml.slice(12,15), newCube) 
        // let isTouchingNewRight = isInBox(mr.slice(12,15), newCube);

        let isTouchingRed  = isInBox(ml.slice(12,15), red) || isInBox(mr.slice(12,15), red);
        let isTouchingGreen  = isInBox(ml.slice(12,15), green) || isInBox(mr.slice(12,15), green);
        let isTouchingBlue  = isInBox(ml.slice(12,15), blue) || isInBox(mr.slice(12,15), blue);
        let isTouchingNegRed  = isInBox(ml.slice(12,15), redNeg) || isInBox(mr.slice(12,15), redNeg);
        let isTouchingNegGreen  = isInBox(ml.slice(12,15), greenNeg) || isInBox(mr.slice(12,15), greenNeg);
        let isTouchingNegBlue  = isInBox(ml.slice(12,15), blueNeg) || isInBox(mr.slice(12,15), blueNeg);


        // IF NEITHER CONTROLLER IS INSIDE THE BOX, COLOR THE BOX WHITE.
        if (! isLeftInBox && ! isRightInBox){
            box.color(1,1,1);
        } else {
            if (isTouchingRed)
                redPercent = Math.min(1, redPercent + 0.01);

            if (isTouchingGreen)
                greenPercent = Math.min(1, greenPercent + 0.01);
            
            if (isTouchingBlue)
                bluePercent = Math.min(1, bluePercent + 0.01);

            if (isTouchingNegRed)
                redPercent = Math.max(0, redPercent - 0.01);

            if (isTouchingNegGreen)
                greenPercent = Math.max(0, greenPercent - 0.01);
            
            if (isTouchingNegBlue)
                bluePercent = Math.max(0, bluePercent - 0.01);
        }

        // if (isTouchingNewLeft){
        //     let leftTrigger = buttonState.left[0].pressed;
        //     if (leftTrigger) {

        //         // COLOR THE BOX RED AND MOVE THE BOX.
        //         currBox = model.add('cube');
        //         currMP = cg.mTranslate(0,1,.5);
        //         currA = [0,0,0];
        //         currMA = cg.mIdentity();
        //         currRGB = [0,0,0];

        //         boxes.push(currBox);
        //         MPs.push(currMP);
        //         As.push(currA);
        //         MAs.push(currMA)
        //         rgbs.push(currRGB);

        //         let B = ml.slice(12,15);
        //         if (! leftTriggerPrev)         // ON LEFT DOWN EVENT:
        //             currMA = B;                      // INITIALIZE PREVIOUS LOCATION.
        //         else
        //             currMP = cg.mMultiply(cg.mTranslate(cg.subtract(B, currA)), currMP);
        //         currA = B;                         // REMEMBER PREVIOUS LOCATION.
        //     }
        //     leftTriggerPrev = leftTrigger;

        // } else 
        if (isLeftInBox) {

            // COLOR THE BOX PINK.
            box.color(1,.5,.5);

            // IF THE LEFT TRIGGER IS SQUEEZED
            let leftTrigger = buttonState.left[0].pressed;
            if (leftTrigger) {
                // COLOR THE BOX RED AND MOVE THE BOX.
                box.color(1,0,0);
                let B = ml.slice(12,15);
                if (! leftTriggerPrev)         // ON LEFT DOWN EVENT:
                    A = B;                      // INITIALIZE PREVIOUS LOCATION.
                else
                    MP = cg.mMultiply(cg.mTranslate(cg.subtract(B, A)), MP);
                A = B;                         // REMEMBER PREVIOUS LOCATION.
            }
            leftTriggerPrev = leftTrigger;
        } else if (isRightInBox) {
            // COLOR THE BOX LIGHT BLUE.
            box.color(.5,.5,1);

            // IF THE RIGHT TRIGGGER IS SQUEEZED
            let rightTrigger = buttonState.right[0].pressed;
            if (rightTrigger) {
                // COLOR THE BOX BLUE AND MOVE AND ROTATE THE BOX.
                box.color(0,0,1);
                let MB = mr.slice();
                if (! rightTriggerPrev)        // ON RIGHT DOWN EVENT:
                    MA = MB;                    // INITIALIZE PREVIOUS MATRIX.
                else
                    MP = cg.mMultiply(cg.mMultiply(MB, cg.mInverse(MA)), MP);

                MA = MB;                       // REMEMBER PREVIOUS MATRIX.
            }
            rightTriggerPrev = rightTrigger;
        }

        // DISPLAY THE BOX.
        red.setMatrix(redMP).scale(.1);
        green.setMatrix(greenMP).scale(.1);
        blue.setMatrix(blueMP).scale(.1);

        // newCube.setMatrix(newCubeMP).scale(.1).turnY(Math.sin(model.time)*.3);

        redNeg.setMatrix(redNegMP).scale(.1);
        greenNeg.setMatrix(greenNegMP).scale(.1);
        blueNeg.setMatrix(blueNegMP).scale(.1);

        box.color(redPercent, greenPercent, bluePercent)
        box.setMatrix(MP).scale(.1);
   });
}

