import { g2 } from "../util/g2.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {

   model.setTable(false);
   model.setRoom(false);

   let wallHeight = 0.5;
   let wallThickness = 0.01;
   let showWhiteboard = true;
   let leftButtonPrev = false;

   let Aswitch = false;
   let Condswitch = false;

   // const floor = model.add('cube').move(0, -1, 0).scale(100, 0.01, 100)

   let whiteBoard = model.add('cube').texture(() => {
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
      g2.lineWidth(.002);

      for (let n = 0 ; n < whiteBoard.paths.length ; n++){
         g2.drawPath(whiteBoard.paths[n]);
      }

      if (!Aswitch && whiteBoard.tmpPath.length > 0 && whiteBoard.isDrawingTmp){
         console.log(whiteBoard.tmpPath)
         g2.setColor([0.5,0.5,0.5]);
         g2.lineWidth(.002);

         g2.drawPath(whiteBoard.tmpPath);
      }

   });

   whiteBoard.tmpPath = [null, null];
   whiteBoard.paths = [];
   whiteBoard.isDrawing = false;
   whiteBoard.isDrawingTmp = false;

   whiteBoard.getWalls = (scale) => {
      return whiteBoard.paths.map(wall => {
         const [[startU, startV, startZ], [endU, endV, endZ]] = wall;
         if (startU === endU){
            return {
               direction: "vertical",
               centerX: startV + (Math.abs(startV - endV) / 2),
               centerY: startU,
               length: Math.abs(startV - endV) / 2
            }

         } else {
            return {
               direction: "horizontal",
               centerX: startU + (Math.abs(startU - endU) / 2),
               centerY: startV,
               length: Math.abs(startU - endU) / 2
            }
         }
      })
   }
   
   let handPanel = model.add('cube').texture('media/textures/colors.jpg').opacity(.01);

   // A list of wallIds used to determine if a canvas path has
   // already been added to the model or not
   const drawnWalls = [];
      
   model.animate(() => {

      let leftButtonCurr = buttonState.left[2].pressed

      if (!leftButtonCurr && leftButtonPrev) {
         showWhiteboard = !showWhiteboard;
      }
      leftButtonPrev = leftButtonCurr

      whiteBoard.hud().scale(1, 1, .0001).opacity(showWhiteboard ? 1 : 0);

      const walls = whiteBoard.getWalls()

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
               
            } else if (direction === 'vertical') {
               model.add('cube')
                  .move(centerX, 0.5, centerY)
                  .scale(wallThickness, wallHeight, length)
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
   });
}
