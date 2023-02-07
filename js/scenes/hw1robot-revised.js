import * as cg from "../render/core/cg.js";

import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

let leftTriggerPrev = false;
let rightTriggerPrev = false;

let MP = cg.mTranslate(0,1,.5);
let A = [0,0,0];
let MA = cg.mIdentity();

export const init = async model => {

   let box = model.add('cube');

   let head = model.add();
   head.add('tubeX').color(1,1,1);
   head.add('sphere').color(0,0,0);
   head.add('sphere').color(0,0,0);

   let weaponconnector = head.add("cube");
   let weapon = weaponconnector.add("tubeZ").texture('../media/textures/metal.jpeg');
   

   let neck = head.add('tubeY').color(1,1,1);

   let body = neck.add('sphere').color(.75,.75,.75).texture('../media/textures/brick.png');

   let antenna = head.add();
   let a1 = antenna.add('tubeY').color(1,1,1);
   let a2 = a1.add('sphere').color(1,0,0);

   // let target = model.add('sphere').color(1,0,0).scale(.1);

   
   // FUNCTION TO RETURN TRUE IF A POINT IS INSIDE THE BOX, OTHERWISE FALSE.

   let isInBox = p => {

      // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.

      let q = cg.mTransform(cg.mInverse(box.getMatrix()), p);

      // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.

      return q[0] >= -1 & q[0] <= 1 &&
             q[1] >= -1 & q[1] <= 1 &&
             q[2] >= -1 & q[2] <= 1 ;
   }
   
   model.move(0,1,0).scale(.3).turnY(-Math.PI/4).animate(() => {

      let xMove =Math.sin(2*model.time);
      let yMove =Math.cos(1*model.time);
      head.identity().turnY(-Math.PI/4).move(yMove,1.5,xMove);
      // .turnX(Math.sin(2.1*model.time)).turnY(Math.sin(1.0*model.time));

      head.child(0).identity().move(.2,0,0)
                  .scale(.3,.15,.3);

      head.child(1).identity().move(.5,0,.1)
                  .scale(.18*Math.abs(Math.sin(model.time)))
                  .scale(.1,.3,.1);
      head.child(2).identity().move(.5,0,-.1)
                  .scale(.18*Math.abs(Math.sin(model.time)))
                  .scale(.1,.3,.1);

      weaponconnector.identity().move(.3,0,.4).turnY(Math.PI/2).scale(.2,.1,.1);

      weapon.identity().move(0,0,4).scale(.5,1,6);

      // box.identity().move(100,100,100);

      neck.identity().move(.3,-.2,0).turnY(-Math.PI/4).scale(.15);

      body.identity().move(0,-5,0)
                  .turnX(xMove).turnY(yMove).scale(4.5);

      antenna.identity().move(.15,.2,-.18).turnY(-Math.PI/4);
      
      a1.identity().move(0,-.05,0).turnX(.5*xMove).move(0,.05,0).scale(.01,.1,.01);

      a2.identity().move(0,1.3,0).scale(.5);


      // FETCH THE MATRIXES FOR THE LEFT AND RIGHT CONTROLLER.
      let ml = controllerMatrix.left;
      let mr = controllerMatrix.right;

      // EXTRACT THE LOCATION OF EACH CONTROLLER FROM ITS MATRIX,
      // AND USE IT TO SEE WHETHER THAT CONTROLLER IS INSIDE THE BOX.

      let isLeftInBox  = isInBox(ml.slice(12,15));
      let isRightInBox = isInBox(mr.slice(12,15));

      // IF NEITHER CONTROLLER IS INSIDE THE BOX, COLOR THE BOX WHITE.

      if (! isLeftInBox && ! isRightInBox)
         box.color(1,1,1);

      // IF THE LEFT CONTROLLER IS INSIDE THE BOX

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
      }

      // IF THE RIGHT CONTROLLER IS INSIDE THE BOX

      if (isRightInBox) {

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
   
      box.setMatrix(MP).scale(.1);
   });
}