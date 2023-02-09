import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState, time } from "../render/core/controllerInput.js";


let leftTriggerPrev = false;
let MPR = cg.mTranslate(-0.5,1,.5);
let MPG = cg.mTranslate(0,1,.5);
let MPB = cg.mTranslate(0.5,1,.5);

let A = [0,0,0];
let prevPosition = 0;
let velocity = 0;
let allBalls = [];

export const init = async model => {

   // CREATE THE BALL.
   let ballScale = 1;

   let redBall = model.add('sphere').scale(ballScale);
   let greenBall = model.add('sphere').scale(ballScale);
   let blueBall = model.add('sphere').scale(ballScale);

   //let pickerBalls = [redBall, greenBall, blueBall]

   //let firstBall = model.add('sphere').scale(ballScale);
   
   allBalls.push({
      ball: redBall,
      inMotion: false,
      lockVelocity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      MP: MPR,
      A: [0,0,0],
      B: [0,0,0],
      scolor: [1,0.5,0.5],
      color: [1,0,0]
   });

   allBalls.push({
      ball: greenBall,
      inMotion: false,
      lockVelocity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      MP: MPG,
      A: [0,0,0],
      B: [0,0,0],
      scolor: [0.5,1,0.5],
      color: [0,1,0]
   });

   allBalls.push({
      ball: blueBall,
      inMotion: false,
      lockVelocity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      MP: MPB,
      A: [0,0,0],
      B: [0,0,0],
      scolor: [0.5,0.5,1],
      color: [0,0,1]
   });
   

   // FUNCTION TO RETURN TRUE IF A POINT IS INSIDE THE BALL, OTHERWISE FALSE.
   let isInBall = (p) => {
      // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BALL'S MATRIX.
      for (let i = 0; i < allBalls.length; i++) {
         let currBall = allBalls[i].ball;
         let q = cg.mTransform(cg.mInverse(currBall.getMatrix()), p);
         // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.
         if(Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2]) < ballScale){
            return i;
         }
      }
      return -1;
   }


   model.animate(() => {

      // FETCH THE MATRIXES FOR THE LEFT CONTROLLER, GET POSITION AND CALCULATE VELOCITY
      let ml = controllerMatrix.left;
      let currentPosition = ml.slice(12,15);
      velocity = cg.subtract(currentPosition, prevPosition);
      let ballIndex  = isInBall(ml.slice(12,15));

      let isLeftInBall = ballIndex !== -1 ;
      
      
      // // IF NEITHER CONTROLLER IS INSIDE ANY BALL, COLOR ALL THE BALLS WHITE.
      if (! isLeftInBall){
         for (let i = 0; i < allBalls.length; i++) {
            if(!allBalls[i].inMotion){
               allBalls[i].ball.color(allBalls[i].scolor);
            }
         }         
      }

      // IF THE LEFT CONTROLLER IS INSIDE THE BALL
      if (isLeftInBall) {

         // COLOR THE BALL FULL.
         allBalls[ballIndex].ball.color(allBalls[ballIndex].color);

         // IF THE LEFT TRIGGER IS SQUEEZED
         let leftTrigger = buttonState.left[0].pressed;

         if(leftTriggerPrev && !leftTrigger){
            let r = 3;
            allBalls[ballIndex].lockVelocity = [0,0,0,0,0,0,0,0,0,0,0,0, 3*velocity[0], 3*velocity[1], 3*velocity[2],0];
            allBalls[ballIndex].inMotion = true;
            
         }

         if (leftTrigger) {
            // COLOR THE BALL RED AND MOVE THE BALL.
            // for (let i = 0; i < allBalls.length; i++) {
            //    allBalls[i].ball.color(1,0,0);
            // }
            //allBalls[ballIndex].ball.color(1,0,0);
            allBalls[ballIndex].B = ml.slice(12,15);
            if (! leftTriggerPrev){         // ON LEFT DOWN EVENT:
               allBalls[ballIndex].A = allBalls[ballIndex].B;                      // INITIALIZE PREVIOUS LOCATION.
               let newBall = model.add('sphere').scale(ballScale).color(allBalls[ballIndex].scolor);
               allBalls.push({
                  ball: newBall,
                  inMotion: false,
                  lockVelocity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                  MP: allBalls[ballIndex].MP,
                  A: [0,0,0],
                  B: [0,0,0],
                  scolor: allBalls[ballIndex].scolor,
                  color: allBalls[ballIndex].color
               });
            }
            else{
               //ball.color(0,1,0);
               allBalls[ballIndex].MP = cg.mMultiply(cg.mTranslate(cg.subtract(allBalls[ballIndex].B, allBalls[ballIndex].A)), allBalls[ballIndex].MP);
            }

            allBalls[ballIndex].A = allBalls[ballIndex].B;                         // REMEMBER PREVIOUS LOCATION.
         }
         leftTriggerPrev = leftTrigger;
      } 

     

      
      prevPosition = currentPosition;
      

      // ROOM X,Y,Z
      let roomX = 4.5;
      let roomY1 = 3, roomY2 = 0.1;
      let roomZ = 4.5;
      
      
      for (let i = 0; i < allBalls.length; i++) {
      // Velocity decay
         if(allBalls[i].inMotion){
            // BOUNCING
            // Check if ball it hits the wall in X - Index 12
            if(allBalls[i].MP[12] > roomX || allBalls[i].MP[12] < -roomX){
               allBalls[i].lockVelocity[12] = -allBalls[i].lockVelocity[12];
            }
            // Check if ball it hits the wall in Y - Index 13
            if(allBalls[i].MP[13] > roomY1 || allBalls[i].MP[13] < roomY2){
               allBalls[i].lockVelocity[13] = -allBalls[i].lockVelocity[13];
            }
            // Check if ball it hits the wall in Z - Index 14
            if(allBalls[i].MP[14] > roomZ || allBalls[i].MP[14] < -roomZ){
               allBalls[i].lockVelocity[14] = -allBalls[i].lockVelocity[14];
            }

            // Try doing gravity here only
            let oldMagnitude = Math.sqrt(
               allBalls[i].lockVelocity[12]*allBalls[i].lockVelocity[12] +
               allBalls[i].lockVelocity[13]*allBalls[i].lockVelocity[13] +
               allBalls[i].lockVelocity[14]*allBalls[i].lockVelocity[14]
               )
            let magnitude = oldMagnitude;
            if(magnitude > 0.0001){
               magnitude -= 0.0001;
            } else {
               magnitude = 0;
               allBalls[i].inMotion = false;
               
            }
            allBalls[i].lockVelocity[12] *= magnitude/ oldMagnitude;
            allBalls[i].lockVelocity[13] *= magnitude/ oldMagnitude;
            allBalls[i].lockVelocity[14] *= magnitude/ oldMagnitude;

            // Add gravity
            allBalls[i].lockVelocity[13] -= 0.001
            allBalls[i].MP = cg.add( allBalls[i].MP, allBalls[i].lockVelocity)
            //MP = cg.subtract( MP,gravity)  
         }
         allBalls[i].ball.setMatrix(allBalls[i].MP).scale(.1);
      }

      // redBall.setMatrix(MPR).scale(.1)
      // greenBall.setMatrix(MPG).scale(.1)
      // blueBall.setMatrix(MPB).scale(.1)
      
   });   
}


// let roundCM = (m) => {
//    let len = m.length;
//    let controllerM = new Array(len);
//    while(len--){ 
//       controllerM[len] = m[len].toFixed(2); 
//    }
//    return controllerM;
// }
// let mle = controllerMatrix.left;
// let obj3 = model.add('cube').move(2,0.93,-3).scale(1,1,0.0001).texture(() => {
//    g2.setColor('black');
//    g2.textHeight(.05);
//    g2.fillText('Time : ' + Math.round(model.time * 100)/100, .5, .9, 'center');
//    g2.fillText('Curr Velocity : ' + roundCM(velocity), .5, .7, 'center');
//    g2.fillText('Ball Position : ' + roundCM(MP.slice(12,15)), .5, .6, 'center');
//    g2.fillText('Lock Velocity : ' + roundCM(lockVelocity).slice(12,15), .5, .5, 'center');
//    g2.fillText('Velocity Shape mle : ' + mle.length, .5, .4, 'center');
//    g2.fillText('Velocity Shape F : ' + lockVelocity.length, .5, .3, 'center');
//    g2.fillText('STOP: ' + stop, .5, .2, 'center');
//    g2.fillText('THROWN: ' + objectThrown, .5, .1, 'center');
   
   
// });
      
    // Adding air resistance
         // lockVelocity[12] += Math.abs(lockVelocity[12]) * (lockVelocity[12] > 0  && lockVelocity[12] !== 0 ? -0.0001 : 0.0001);
         // lockVelocity[13] += Math.abs(lockVelocity[13]) * (lockVelocity[13] > 0  && lockVelocity[13] !== 0 ? -0.0001 : 0.0001);
         // lockVelocity[14] += Math.abs(lockVelocity[14]) * (lockVelocity[14] > 0  && lockVelocity[14] !== 0 ? -0.0001 : 0.0001);
        
         // // Adding gravity
         // lockVelocity[13] += lockVelocity[13] > 0  && lockVelocity[13] !== 0 ? -0.0001 : 0.0001);
         // // Adding air resistance
         // lockVelocity[12] += lockVelocity[12] * (lockVelocity[12] > 0  && lockVelocity[12] !== 0 ? -0.0001 : 0.0001);
         // lockVelocity[13] += lockVelocity[13] * (lockVelocity[13] > 0  && lockVelocity[13] !== 0 ? -0.0001 : 0.0001);
         // lockVelocity[14] += lockVelocity[14] * (lockVelocity[14] > 0  && lockVelocity[14] !== 0 ? -0.0001 : 0.0001);
    
      
        // // Create a concrete wall
      // let cube = model.add('cube').move(0,0,-4.5).scale(4,2.8,0.5).texture('../media/textures/concrete.png');

   
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

      // if(lockVelocity !== undefined && objectThrown && !stop){



         
         
      //    if(Math.abs(lockVelocity[13]) < 0.0001 && MP[13] < roomY2 ){
      //       enableGravity = false;
      //       lockVelocity[13] = 0;
      //    }
         
      //    MP = cg.add( MP,lockVelocity)

      //    // lockVelocity[12] += lockVelocity[12] > 0  && lockVelocity[12] !== 0 ? -0.0001 : 0.0001;
      //    // lockVelocity[13] += lockVelocity[13] > 0  && lockVelocity[13] !== 0 ? -0.0001 : 0.0001; // Graviry adds extra reduction
      //    // lockVelocity[14] += lockVelocity[14] > 0  && lockVelocity[14] !== 0 ? -0.0001 : 0.0001;

      // }
      // if(!enableGravity || lockVelocity[13] === 0){
      //    MP[13] = 0.1;
      // }
      // // DISPLAY THE BALL.
      // ball.setMatrix(MP).scale(.1);
      
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

      