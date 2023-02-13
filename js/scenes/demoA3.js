import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState, time } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';


let allBalls = [];
let allColors = [ [1,0.5,0.5],  [0.5,1,0.5],  [0.5,0.5,1] ];
let maxAxis = 2;

export const init = async model => {

   for (let i = 0; i < 20; i++) {
      let randX = Math.random() * maxAxis - 1;
      let randY = Math.random() * maxAxis - 1;
      let randZ = Math.random() * maxAxis - 1;
      let ball = model.add('sphere').move(randX, randY, randZ).color(allColors[Math.floor(Math.random() * allColors.length)]).scale(0.05);
      allBalls.push(ball);
   }   


   model.animate(() => {

      for(let i=0;i<allBalls.length;i++){

         let center = g2.getUVZ(allBalls[i]).slice(12,15);
         let point = rcb.projectOntoBeam(center);
         let diff = cg.subtract(point, center);
         let hit = cg.norm(diff) < radius;
         let rt = buttonState.right[0].pressed;
   
         if(hit){
            allBalls[i].color([1,0.5,0.2]);
         }
         if (hit && rt){
            allBalls[i].opacity(0);
         }
         
      }
   });

}
