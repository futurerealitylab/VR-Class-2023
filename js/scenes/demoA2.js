import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState, time } from "../render/core/controllerInput.js";


let leftTriggerPrev = false;
let rightTriggerPrev = false;

let MP = cg.mTranslate(0,1,.5);
let A = [0,0,0];
let MA = cg.mIdentity();
let cml = [];
let prevPosition = 0;
let velocity = 0;
let lockVelocity = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
let gravity      = [0,0,0,0,0,0,0,0,0,0,0,0,0,0.001,0,0];
let ObjectThrown = false;
let stop = false;

export const init = async model => {

   // // Create a concrete wall
   // let cube = model.add('cube').move(0,0,-4.5).scale(4,2.8,0.5).texture('../media/textures/concrete.png');

   // Create Text Box for display
   let obj1 = model.add('cube').move(2,1.5,-3).scale(1,1,0.0001).texture(() => {
      g2.setColor('black');
      g2.textHeight(.05);
      g2.fillText('Time : ' + Math.round(model.time * 100)/100, .5, .9, 'center');
   });

   // CREATE THE BALL.
   let ballScale = 1;
   let ball = model.add('sphere').scale(ballScale);

   // FUNCTION TO RETURN TRUE IF A POINT IS INSIDE THE BALL, OTHERWISE FALSE.
   let isInBall = p => {
      // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BALL'S MATRIX.
      let q = cg.mTransform(cg.mInverse(ball.getMatrix()), p);

      // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.
      return Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2]) < ballScale;
   }

  

   let roundCM = (m) => {
      let len = m.length;
      let controllerM = new Array(len);
      while(len--){ 
         controllerM[len] = m[len].toFixed(2); 
      }
      return controllerM;
   }

   let mle = controllerMatrix.left;
   let obj3 = model.add('cube').move(2,0.93,-3).scale(1,1,0.0001).texture(() => {
      g2.setColor('black');
      g2.textHeight(.05);
      g2.fillText('Curr Velocity : ' + roundCM(velocity), .5, .7, 'center');
      g2.fillText('Ball Position : ' + roundCM(MP.slice(12,15)), .5, .6, 'center');
      g2.fillText('Lock Velocity : ' + roundCM(lockVelocity).slice(12,15), .5, .5, 'center');
      g2.fillText('Velocity Shape mle : ' + mle.length, .5, .4, 'center');
      g2.fillText('Velocity Shape F : ' + lockVelocity.length, .5, .3, 'center');
      g2.fillText('STOP: ' + stop, .5, .2, 'center');
      
      
   });

   model.animate(() => {

      // FETCH THE MATRIXES FOR THE LEFT AND RIGHT CONTROLLER.
      let ml = controllerMatrix.left;
      let mr = controllerMatrix.right;
      let currentPosition = ml.slice(12,15);
      // EXTRACT THE LOCATION OF EACH CONTROLLER FROM ITS MATRIX,
      // AND USE IT TO SEE WHETHER THAT CONTROLLER IS INSIDE THE BALL.
      velocity = cg.subtract(currentPosition, prevPosition);

      let isLeftInBall  = isInBall(ml.slice(12,15));
      let isRightInBall = isInBall(mr.slice(12,15));

      // IF NEITHER CONTROLLER IS INSIDE THE BALL, COLOR THE BALL WHITE.
      if (! isLeftInBall && ! isRightInBall)
         ball.color(1,1,1);

      // IF THE LEFT CONTROLLER IS INSIDE THE BALL
      if (isLeftInBall) {

         // COLOR THE BALL PINK.
         ball.color(1,.5,.5);

         // IF THE LEFT TRIGGER IS SQUEEZED
         let leftTrigger = buttonState.left[0].pressed;

         if(leftTriggerPrev && !leftTrigger){
            let r = 3;
            lockVelocity = [0,0,0,0,0,0,0,0,0,0,0,0, 3*velocity[0], 3*velocity[1], 3*velocity[2],0];
            ObjectThrown = true;
         }

         if (leftTrigger) {
            // COLOR THE BALL RED AND MOVE THE BALL.
            ball.color(1,0,0);
            let B = ml.slice(12,15);
            if (! leftTriggerPrev){         // ON LEFT DOWN EVENT:
               //ball.color(1,0,0);
               A = B;                      // INITIALIZE PREVIOUS LOCATION.
            }
            else{
               //ball.color(0,1,0);
               MP = cg.mMultiply(cg.mTranslate(cg.subtract(B, A)), MP);
            }

            A = B;                         // REMEMBER PREVIOUS LOCATION.
         }
         leftTriggerPrev = leftTrigger;
      }

      // // IF THE RIGHT CONTROLLER IS INSIDE THE BALL

      // if (isRightInBall) {
      //    // COLOR THE BALL LIGHT BLUE.
      //    ball.color(.5,.5,1);

      //    // IF THE RIGHT TRIGGGER IS SQUEEZED
      //    let rightTrigger = buttonState.right[0].pressed;
      //    if (rightTrigger) {
      //       // COLOR THE BALL BLUE AND MOVE AND ROTATE THE BALL.
      //       ball.color(0,0,1);
      //       let MB = mr.slice();
      //       if (! rightTriggerPrev)        // ON RIGHT DOWN EVENT:
      //          MA = MB;                    // INITIALIZE PREVIOUS MATRIX.
      //       else{
               
      //          MP = cg.mMultiply(cg.mMultiply(MB, cg.mInverse(MA)), MP);
      //       }

      //       MA = MB;                       // REMEMBER PREVIOUS MATRIX.
      //    }
      //       rightTriggerPrev = rightTrigger;
      // }

      

      
      prevPosition = currentPosition;
      

      // ROOM X,Y,Z
      let roomX = 4.5;
      let roomY1 = 3, roomY2 = 0.1;
      let roomZ = 4.5;
      
      // Check if ball it hits the wall in X - Index 12
      if(MP[12] > roomX || MP[12] < -roomX){
         lockVelocity[12] = -lockVelocity[12];
      }
      // Check if ball it hits the wall in Y - Index 13
      if(MP[13] > roomY1 || MP[13] < roomY2){
         lockVelocity[13] = -lockVelocity[13];
      }
      // Check if ball it hits the wall in Z - Index 14
      if(MP[14] > roomZ || MP[14] < -roomZ){
         lockVelocity[14] = -lockVelocity[14];
      }
      
      // Velocity decay
      if(!stop){

         // ADD Gravity
         lockVelocity = cg.subtract( lockVelocity, gravity)
         
         lockVelocity[12] += lockVelocity[12] > 0  && lockVelocity[12] !== 0 ? -0.0001 : 0.0001;
         lockVelocity[13] += lockVelocity[13] > 0  && lockVelocity[12] !== 0 ? -0.0001 : 0.0001; // Graviry adds extra reduction
         lockVelocity[14] += lockVelocity[14] > 0  && lockVelocity[12] !== 0 ? -0.0001 : 0.0001;

         if(ObjectThrown){
            if(Math.abs(lockVelocity[12]) < 0.0001){
               lockVelocity[12]=0;
            }
            if(Math.abs(lockVelocity[13]) < 0.0001){
               lockVelocity[13]=0;
            }
            if(Math.abs(lockVelocity[14]) < 0.0001){
               lockVelocity[14]=0;
            }

            if(lockVelocity[12]===0 && lockVelocity[13]===0 && lockVelocity[14]===0){
               stop = true;
            }
         }
      }

      // Check when to stop the ball on Y axis
      // if(!stop && ObjectThrown &&
      //    Math.abs(lockVelocity[13]) < 0.0001){
      //       lockVelocity[13]=0;
      //       stop = true;
      // } 
      // if(!stop && ObjectThrown &&
      //    Math.abs(lockVelocity[12]) < 0.0001 &&
      //    Math.abs(lockVelocity[13]) < 0.0001 &&
      //    Math.abs(lockVelocity[14]) < 0.0001){

      //       lockVelocity[12]=0;
      //       lockVelocity[13]=0;
      //       lockVelocity[14]=0;
      //       stop = true;
      // } 
      if(lockVelocity !== undefined && ObjectThrown && !stop){
         // ADD Gravity
         MP = cg.add( lockVelocity, MP)
      }
      // DISPLAY THE BALL.
      ball.setMatrix(MP).scale(.1);

   });


   

}





   // Create Text Box for display
   // let obj2 = model.add('cube').move(2,1.3,-3).scale(1,1,0.0001).texture(() => {
   //    g2.setColor('black');
   //    g2.textHeight(.05);
   //    g2.fillText('CM Left: ' + Math.round(controllerMatrix.left * 100) / 100, .5, .9, 'center');
   // });

   // // Create Text Box for display
   // let obj3 = model.add('cube').move(2,1.1,-3).scale(1,1,0.0001).texture(() => {
   //    g2.setColor('black');
   //    g2.textHeight(.05);
   //    g2.fillText('CM Right: ' + Math.round(controllerMatrix.right * 100000) / 100, .5, .9, 'center');
   // });

   

   
   // // Create Text Box for display
   // let obj4 = model.add('cube').move(2,0.9,-3).scale(1,1,0.0001).texture(() => {
   //    g2.setColor('black');
   //    g2.textHeight(.05);
   //    g2.fillText('CM Left - Round: ' + roundCM(controllerMatrix.left).slice(0,8), .5, .9, 'center');
   //    g2.fillText('CM Left - Round: ' + roundCM(controllerMatrix.left).slice(8,16), .5, .8, 'center');

   //    //g2.fillText('CM Left - Round: ' + controllerMatrix.left[0], .5, .9, 'center');
   // });

   // Create Text Box for display
   // let obj5 = model.add('cube').move(2,0.9,-3).scale(1,1,0.0001).texture(() => {
   //    g2.setColor('black');
   //    g2.textHeight(.05);
   //    g2.fillText('Left:' + controllerMatrix.left.length + ' Right :' + controllerMatrix.right.length, .5, .9, 'center');
   //    //g2.fillText('CM Left - Round: ' + controllerMatrix.left[0], .5, .9, 'center');
   // });