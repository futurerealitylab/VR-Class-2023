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

let MP1 = cg.mTranslate(-.3,1,.5);
let MP2 = cg.mTranslate(.3,1,.5);
let MP3 = cg.mTranslate(0,1,0);
let A1 = [0,0,0];
let A2 = [0,0,0];
let MA = cg.mIdentity();

export const init = async model => {

   // CREATE THE BOX.

   let sphere1 = model.add('sphere');
   let sphere2 = model.add('sphere');
   let target = model.add('cube');

   // FUNCTION TO RETURN TRUE IF A POINT IS INSIDE THE BOX, OTHERWISE FALSE.

   let hit = p => {
      // let pc= p.getMatrix().slice(12,15);
      // let sc = sphere.getMatrix().slice(12,15);
      // if((pc[0]-sc[0])*(pc[0]-sc[0]) + (pc[1]-sc[1])*(pc[1]-sc[1]) + (pc[2]-sc[2])*(pc[2]-sc[2]) < .001){
      //    return true;
      // }
      // return false;
      let q = cg.mTransform(cg.mInverse(target.getMatrix()), p);
      return q[0] == 0 && q[1] == 0 && q[2] == 0;
      // return q[0] >= -1 & q[0] <= 1 &&
      //        q[1] >= -1 & q[1] <= 1 &&
      //        q[2] >= -1 & q[2] <= 1 ;
   }

   let isInsphere1 = p => {
      // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.
      let q = cg.mTransform(cg.mInverse(sphere1.getMatrix()), p);
      // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.
      // return q[0] >= -2 & q[0] <= 2 &&
      //        q[1] >= -2 & q[1] <= 2 &&
      //        q[2] >= -2 & q[2] <= 2 ;
      return true;
   }

   let isInsphere2 = p => {
      // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.
      let q = cg.mTransform(cg.mInverse(sphere2.getMatrix()), p);
      // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.
      // return q[0] >= -2 & q[0] <= 2 &&
      //        q[1] >= -2 & q[1] <= 2 &&
      //        q[2] >= -2 & q[2] <= 2 ;
      return true;
   }

   model.animate(() => {

      // FETCH THE MATRIXES FOR THE LEFT AND RIGHT CONTROLLER.
      let ml = controllerMatrix.left;
      let mr = controllerMatrix.right;

      // EXTRACT THE LOCATION OF EACH CONTROLLER FROM ITS MATRIX,
      // AND USE IT TO SEE WHETHER THAT CONTROLLER IS INSIDE THE BOX.

      let isLeftInsphere1  = isInsphere1(ml.slice(12,15));
      let isRightInsphere2 = isInsphere2(mr.slice(12,15));

      // IF NEITHER CONTROLLER IS INSIDE THE BOX, COLOR THE BOX WHITE.

      if (! isLeftInsphere1 && ! isRightInsphere2)
         sphere1.color(1,1,1);
         sphere2.color(1,1,1);

      // IF THE LEFT CONTROLLER IS INSIDE THE BOX

      if (isLeftInsphere1) {

         // COLOR THE BOX PINK.
         sphere1.color(1,.5,.5);

         // IF THE LEFT TRIGGER IS SQUEEZED
         let leftTrigger = buttonState.left[0].pressed;
         let lMiddleFingerTrigger = buttonState.left[1].pressed;
         if (leftTrigger) {
            // COLOR THE BOX RED AND MOVE THE BOX.
            sphere1.color(.8,0,0);
            let B1 = ml.slice(12,15);
            if (! leftTriggerPrev)         // ON LEFT DOWN EVENT:
               A1 = B1;                      // INITIALIZE PREVIOUS LOCATION.
            else{
               let t1 = cg.subtract(B1, A1);
               if(lMiddleFingerTrigger){
                  sphere1.color(1,0,0);
                  MP1 = cg.mMultiply(cg.mTranslate(3*t1[0],1.5*t1[1],3*t1[2]), MP1);
               }
               else{
                  MP1 = cg.mMultiply(cg.mTranslate(t1[0],t1[1],t1[2]), MP1);
               }
               // MP = cg.mMultiply(cg.mTranslate(t[0],t[1],t[2]), MP);
            }
            A1 = B1;                         // REMEMBER PREVIOUS LOCATION.
         }
         leftTriggerPrev = leftTrigger;
      }

      // IF THE RIGHT CONTROLLER IS INSIDE THE BOX

      if (isRightInsphere2) {

         // COLOR THE BOX LIGHT BLUE.
         sphere2.color(.5,.5,1);

         // IF THE RIGHT TRIGGGER IS SQUEEZED
         let rightTrigger = buttonState.right[0].pressed;
         let rMiddleFingerTrigger = buttonState.right[1].pressed;
         if (rightTrigger) {
            // COLOR THE BOX RED AND MOVE THE BOX.
            sphere2.color(.3,.3,1);
            let B2 = mr.slice(12,15);
            if (! rightTriggerPrev)         // ON LEFT DOWN EVENT:
               A2 = B2;                      // INITIALIZE PREVIOUS LOCATION.
            else{
               let t2 = cg.subtract(B2, A2);
               if (rMiddleFingerTrigger) {
                  sphere2.color(0,0,1);
                  MP2 = cg.mMultiply(cg.mTranslate(2*t2[0],1.2*t2[1],2*t2[2]), MP2);
               }
               MP2 = cg.mMultiply(cg.mTranslate(t2[0],t2[1],t2[2]), MP2);
            }
            A2 = B2;                         // REMEMBER PREVIOUS LOCATION.
         }
         // if (rightTrigger) {
         //    // COLOR THE BOX BLUE AND MOVE AND ROTATE THE BOX.
         //    sphere2.color(0,0,1);
         //    let MB = mr.slice();
         //    if (! rightTriggerPrev)        // ON RIGHT DOWN EVENT:
         //       MA = MB;                    // INITIALIZE PREVIOUS MATRIX.
         //    else
         //       MP2 = cg.mMultiply(cg.mMultiply(MB, cg.mInverse(MA)), MP2);

         //    MA = MB;                       // REMEMBER PREVIOUS MATRIX.
         // }
         rightTriggerPrev = rightTrigger;
      }

      if(hit(sphere1.getMatrix().slice(12,15))){
         target.color(1,0,0);
      }
      

      // DISPLAY THE BOX.
   
      sphere1.setMatrix(MP1).scale(.1);
      sphere2.setMatrix(MP2).scale(.1);
      target.setMatrix(MP3).scale(.1);
   });

}

