import { g2 } from "../util/g2.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";


let leftTriggerPrev = false;
let rightTriggerPrev = false;
let boxScale = 0.1;
const colorChangeSpeed = 0.01;
let boxColor = { r: 1, g: 1, b: 1 };

let MP = cg.mTranslate(0,1.5,.5);
let A = [0,0,0];
let MA = cg.mIdentity();
export const init = async model => {

   model.setTable(false);
   model.setRoom(false);

   let wallHeight = 0.5;
   let wallThickness = 0.01;
   let showWhiteboard = true;
   let leftButtonPrev = false;

   let Aswitch = false;
   let Condswitch = false;

   const roomScale = 20;

   // const floor = model.add('cube').move(0, -1, 0).scale(100, 0.01, 100)

   let whiteBoard = model.add('cube').move(0,2.2,0).scale(.5,.5,.5).texture(() => {
      g2.setColor('white');
      g2.fillRect(.1,0,.8,1);
      g2.setColor('black');
      g2.fillText('White Board', .5, .9, 'center');

      if (g2.mouseState() == 'press' && !whiteBoard.isDrawing ) {
         const uvz = g2.getUVZ(whiteBoard);
         if (uvz && uvz[0]>.1 && uvz[0]<.9) {
            whiteBoard.tmpPath[0] = uvz
            whiteBoard.isDrawing = true;
         }
      } else if (g2.mouseState() == 'drag' && whiteBoard.isDrawing) {
         const uvz = g2.getUVZ(whiteBoard);

         if (!Aswitch && uvz && uvz[0]>.1 && uvz[0]<.9) {
            whiteBoard.isDrawingTmp = true;
            const [prevU, prevV, _] =  whiteBoard.tmpPath[0];
            const [nextU, nextV, nextZ] =  uvz;

            if (Math.abs(prevU - nextU) > Math.abs(prevV - nextV)) {
               whiteBoard.tmpPath[1] = [nextU, prevV, nextZ];
            } else {
               whiteBoard.tmpPath[1] = [prevU, nextV, nextZ];
            }

         }

      } else if (!Aswitch && g2.mouseState() == 'release' && whiteBoard.isDrawing) {
         const uvz = g2.getUVZ(whiteBoard);

         const [prevU, prevV, _] =  whiteBoard.tmpPath[0];
         const [nextU, nextV, nextZ] =  uvz;

         if (Math.abs(prevU - nextU) > Math.abs(prevV - nextV)) {
            whiteBoard.tmpPath[1] = [nextU, prevV, nextZ];
         } else {
            whiteBoard.tmpPath[1] = [prevU, nextV, nextZ];
         }
        
         whiteBoard.paths.push(whiteBoard.tmpPath);
         whiteBoard.tmpPath = [null, null];
         whiteBoard.isDrawing = false;
         whiteBoard.isDrawingTmp = false;
      }

      g2.setColor([0,0,0]);
      g2.lineWidth(.008);

      for (let n = 0 ; n < whiteBoard.paths.length ; n++){
         g2.drawPath(whiteBoard.paths[n]);
      }

      if (!Aswitch && whiteBoard.tmpPath.length > 0 && whiteBoard.isDrawingTmp){
         g2.setColor([0.5,0.5,0.5]);
         g2.lineWidth(.009);

         g2.drawPath(whiteBoard.tmpPath);
      }

   });

   whiteBoard.tmpPath = [null, null];
   whiteBoard.paths = [[[0.2, 0.25, 0], [0.8, 0.25, 0]], [[0.2, 0.75, 0], [0.8, 0.75, 0]], [[0.25, 0.2, 0], [0.25, 0.8, 0]], [[0.75, 0.2, 0], [0.75, 0.8, 0]]];
   // whiteBoard.paths = [];
   whiteBoard.isDrawing = false;
   whiteBoard.isDrawingTmp = false;

   whiteBoard.getWalls = (scale) => {
      return whiteBoard.paths.map(wall => {
         const [[startU, startV, startZ], [endU, endV, endZ]] = wall;
         if (startU === endU){
            return {
               direction: "vertical",
               centerY:(-0.5 + (Math.min(startV, endV) + (Math.abs(startV - endV) / 2))) * scale,
               centerX: (-0.5 + (startU)) * scale,
               length: (Math.abs(startV - endV) / 2) * scale
            }

         } else {
            return {
               direction: "horizontal",
               centerX: (-0.5 + (Math.min(startU, endU) + (Math.abs(startU - endU) / 2))) * scale,
               centerY: (-0.5 + (startV)) * scale,
               length: (Math.abs(startU - endU) / 2) * scale
            }
         }
      })
   }
   
   let handPanel = model.add('cube').texture('media/textures/colors.jpg').opacity(.01);

   // A list of wallIds used to determine if a canvas path has
   // already been added to the model or not
   const drawnWalls = [];

   const floor = model.add("cube").move(0, 0.5, 0).scale(roomScale, 0.001, roomScale)



   // CREATE THE BOX.

   let box = model.add('cube');

   // FUNCTION TO RETURN TRUE IF A POINT IS INSIDE THE BOX, OTHERWISE FALSE.

   let isInBox = p => {

      // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.

      let q = cg.mTransform(cg.mInverse(box.getMatrix()), p);

      // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.

      return q[0] >= -1 & q[0] <= 1 &&
               q[1] >= -1 & q[1] <= 1 &&
               q[2] >= -1 & q[2] <= 1 ;
   }
      
   model.animate(() => {

      let leftButtonCurr = buttonState.left[2].pressed

      if (!leftButtonCurr && leftButtonPrev) {
         showWhiteboard = !showWhiteboard;
      }
      leftButtonPrev = leftButtonCurr

      whiteBoard.scale(1, 1, .0001).opacity(showWhiteboard ? 1 : 0);

      const walls = whiteBoard.getWalls(roomScale)

      walls.forEach(wall => {
         const { direction, centerX, centerY, length } = wall;
         const drawnWallId = `${direction} ${centerX}${centerY} ${length}`;
         // Only draw the wall if it has not been drawn already
         if (!drawnWalls.includes(drawnWallId)) {
            drawnWalls.push(drawnWallId);
            if (direction === 'horizontal') {
               model.add('cube')
                  .move(centerX, 0.5, centerY)
                  .scale(length, wallHeight, wallThickness)
                  .color('green')
               
            } else if (direction === 'vertical') {
               model.add('cube')
                  .move(centerX, 0.5, centerY)
                  .scale(wallThickness, wallHeight, length)
                  .color('red')

            }
         }
      })

      let m = views[0]._viewMatrix;
      let ml = controllerMatrix.left;
      handPanel.identity().scale(.3).move(3.35*ml.slice(12,15)[0],3.35*ml.slice(12,15)[1],3.35*ml.slice(12,15)[2]);
      let hP = handPanel.getMatrix().slice(12,15);
      handPanel.setMatrix([m[0],m[4],m[8],0,m[1],m[5],m[9],0,m[2],m[6],m[10],0,hP[0],hP[1],hP[2],1]).scale(.2,.2,.01);
      if(!Condswitch && buttonState.left[1].pressed){
         Condswitch = true;
         Aswitch = !Aswitch;
         if(Aswitch){
            handPanel.opacity(.8);
         }
         else{
            handPanel.opacity(.01);
         }
      }
      else if(!buttonState.left[1].pressed){
         Condswitch = false;
      }


      // FETCH THE MATRIXES FOR THE LEFT AND RIGHT CONTROLLER.

      //let ml = controllerMatrix.left;
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
      if (isRightInBox) {
           // SCALE THE BOX USING RIGHT JOYSTICK CONTROLLER

           let rightJoyX = joyStickState.right.x;
           if (rightJoyX > 0.5) {
               boxScale += 0.01;
           } else if (rightJoyX < -0.5) {
               boxScale -= 0.01;
               if (boxScale < 0.01) {
                   boxScale = 0.01;
               }
           }
   }
   /*  
   if (isRightInBox) {

      // COLOR THE BOX BASED ON CURRENT COLOR VALUES
      //ADJUST COLOR OF THE BOX USING RIGHT JOYSTICK CONTROLLER
   let rightJoyX = joyStickState.right.x;
   if (rightJoyX > 0.5) {
      boxColor.g = Math.min(boxColor.g + colorChangeSpeed, 1); 
      boxColor.b = Math.max(boxColor.b - colorChangeSpeed, 0); 
   } else if (rightJoyX < -0.5) {
      boxColor.g = Math.max(boxColor.g - colorChangeSpeed, 0); 
      boxColor.b = Math.min(boxColor.b + colorChangeSpeed, 1); 
   }

}

*/

       // Get joystick movement
       const joystickX = joyStickState.left.x;
       const joystickY = joyStickState.left.y;
       const joystickZ = joyStickState.right.y;
       const speed = 0.01;
       const moveVector = [joystickX * speed, - joystickZ * speed, joystickY * speed];
       MP = cg.mMultiply(cg.mTranslate(moveVector), MP);
      // DISPLAY THE BOX.
      box.color(boxColor.r, boxColor.g, boxColor.b);
      box.setMatrix(MP).scale(boxScale).scale(1, wallHeight, wallThickness+ 0.4).color('red');
   });
}
