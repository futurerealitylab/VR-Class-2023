import { g2 } from "../util/g2.js";
import { buttonState } from "../render/core/controllerInput.js";

export const init = async model => {

   model.setTable(false);
   model.setRoom(false);

   let wallHeight = 0.5;
   let wallThickness = 0.01;
   let showWhiteboard = true;
   let leftButtonPrev = false;

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

         if (uvz && uvz[0]>.1 && uvz[0]<.9) {
            whiteBoard.isDrawingTmp = true;
            const [prevU, prevV, _] =  whiteBoard.tmpPath[0];
            const [nextU, nextV, nextZ] =  uvz;

            if (Math.abs(prevU - nextU) > Math.abs(prevV - nextV)) {
               whiteBoard.tmpPath[1] = [nextU, prevV, nextZ];
            } else {
               whiteBoard.tmpPath[1] = [prevU, nextV, nextZ];
            }

         }

      } else if (g2.mouseState() == 'release' && whiteBoard.isDrawing) {
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

      if (whiteBoard.tmpPath.length > 0 && whiteBoard.isDrawingTmp){
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
      
   model.animate(() => {

      let leftButtonCurr = buttonState.left[2].pressed

      if (!leftButtonCurr && leftButtonPrev) {
         showWhiteboard = !showWhiteboard;
      }
      leftButtonPrev = leftButtonCurr

      whiteBoard.hud().scale(1, 1, .0001).opacity(showWhiteboard ? 1 : 0);

      const walls = whiteBoard.getWalls()
      console.log(walls)

      walls.forEach(wall => {
         const { direction, centerX, centerY, length } = wall;

         if (direction === 'horizontal') {
            model.add('cube')
               .move(centerX, 0.5, centerY)
               .scale(length, wallHeight, wallThickness)
            
         } else if (direction === 'vertical') {
            model.add('cube')
               .move(centerX, 0.5, centerY)
               .scale(wallThickness, wallHeight, length)
         }
      })

   });
}
