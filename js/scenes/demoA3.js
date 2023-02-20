import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState, time } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';


let allBalls = [];
let  colors = [ [1,0.5,0.5],  [0.5, 1,0.5],  [0.5,0.5, 1] ];
let sColors = [ [1,  0,  0],  [  0, 1,  0],  [  0,  0, 1] ];

let maxAxisX = 2;
let maxAxisY = 1;
let maxAxisZ = 2;
let radius = 0.1;
let rt = false;
let rt_prev = false;
let numberOfBalls = 20;
let score = 0;
let bulletsRemaining = 10;
let allBullets = [];

// ROOM X,Y,Z
let roomX = 4.5;
let roomY1 = 3, roomY2 = 0.1;
let roomZ = 4.5;

let pointFix = 0;
let isOnScoreBoard = false;
let mr = [];
let uvz = null;

export const init = async model => {

   for (let i = 0; i < numberOfBalls; i++) {
      let randX = Math.random() * maxAxisX - 1;
      let randY = Math.random() * maxAxisY + 0.1;
      let randZ = Math.random() * maxAxisZ - 1;
      let pos = cg.mTranslate(randX, randY, randZ);
      let colorIndex = Math.floor(Math.random() * sColors.length);
      let ball = model.add('sphere').move(randX, randY, randZ).color(colors[colorIndex]).scale(radius);
      allBalls.push({
         ball: ball,
         inMotion: true,
         lockVelocity: [0,0,0,0,0,0,0,0,0,0,0,0, randX/30, randY/30, randZ/30,0],
         scolor: sColors[colorIndex],
         color: colors[colorIndex],
         pos: pos,
         hit:false
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
   // let obj3 = model.add('cube').move(2,0.93,-3).scale(1,1,0.0001).texture(() => {
   //    g2.setColor('black');
   //    g2.textHeight(.05);
   //    // g2.fillText(' Time Remaining : ' + model.time.toFixed(2), .5, .9 , 'center');
   //    // g2.fillText(' Balls Remaining : ' + numberOfBalls, .5, .8 , 'center');
   //    g2.fillText(' UVZ : ' + uvz), .5, .7 , 'center');
   // });

   // let obj4 = model.add('cube').move(2,0.93,-3).scale(1,1,0.0001).texture(() => {
   //    g2.setColor('black');
   //    g2.textHeight(.03);
   //    g2.fillText(' CM : ' + roundCM(mr).slice(0,3), .5, .6 , 'center');
   //    g2.fillText(' CM : ' + roundCM(mr).slice(3,6), .5, .5 , 'center');
   //    g2.fillText(' CM : ' + roundCM(mr).slice(6,9), .5, .4 , 'center');
   //    g2.fillText(' CM : ' + roundCM(mr).slice(9,12), .5, .3 , 'center');
   //    g2.fillText(' CM : ' + roundCM(mr).slice(15,16), .5, .2 , 'center');
   // });

   // SCORE BOARD
   let scoreBoardPos = [0,2,-4];
   let scoreBoard = model.add('cube').move(scoreBoardPos).scale(0.5,0.5,0.0001).texture(() => {
      g2.setColor('#111111');
      g2.fillRect(.1,0,.8,1);
      g2.setColor([1,0,0]);
      g2.textHeight(.17);
      g2.fillText('SCORE', .5, .85, 'center');
      g2.textHeight(.7);
      g2.setColor('#FF6600');
      g2.fillText(score + '', .5, .4, 'center');
   });
   

   model.animate(() => {

      mr = controllerMatrix.right;

      // BALL IN MOTION 
      for (let i = 0; i < allBalls.length; i++) {
         if(allBalls[i].inMotion){
            // BOUNCING
            // Check if ball it hits the wall in X - Index 12
            if(allBalls[i].pos[12] > roomX || allBalls[i].pos[12] < -roomX){
               allBalls[i].lockVelocity[12] = -allBalls[i].lockVelocity[12];
            }
            // Check if ball it hits the wall in Y - Index 13
            if(allBalls[i].pos[13] > roomY1 || allBalls[i].pos[13] < roomY2){
               allBalls[i].lockVelocity[13] = -allBalls[i].lockVelocity[13];
            }
            // Check if ball it hits the wall in Z - Index 14
            if(allBalls[i].pos[14] > roomZ || allBalls[i].pos[14] < -roomZ){
               allBalls[i].lockVelocity[14] = -allBalls[i].lockVelocity[14];
            }

            // Add gravity
            allBalls[i].lockVelocity[13] -= 0.0001
            allBalls[i].pos = cg.add( allBalls[i].pos, allBalls[i].lockVelocity)
         }
         allBalls[i].ball.setMatrix(allBalls[i].pos).scale(radius);
      }
      
      rt = buttonState.right[0].pressed;

      // BEAM INTERSECTION and HIT CODE
      for(let i=0;i<allBalls.length;i++){
         let center = allBalls[i].ball.getGlobalMatrix().slice(12,15);
         let point = rcb.projectOntoBeam(center);
         let diff = cg.subtract(point, center);
         let hit = cg.norm(diff) < radius;
         pointFix = point;
         
   
         if(hit){
            allBalls[i].ball.color(allBalls[i].scolor);
         } else {
            allBalls[i].ball.color(allBalls[i].color);
         }
         if (hit && rt && !rt_prev && !allBalls[i].hit){
            allBalls[i].ball.opacity(0.00001);
            score++;
            allBalls[i].hit = true;
         }
      }

      // Check if beam hits the score board
      

      // RELEASE BULLET on press down
      // if ( !isOnScoreBoard && rt && !rt_pred){
      //    if(bulletsRemaining > 0){
      //       let bullet = model.add('sphere').color([0,0,0]).scale(0.001);
      //       allBullets.push({
      //          bullet: bullet,
      //          inMotion: true,
      //          lockVelocity: [0,0,0,0,0,0,0,0,0,0,0,0, point[0]/30, point[1]/30, point[2]/30,0],
      //          color: [0,0,0],
      //          pos: cg.mTranslate(0, 0, 0)
      //       });
      //    }
      // }
      // CHECK IF BULLET HITS TARGET
      rt_prev = rt;
   });

   // Get pointer direction from controller using column 3 and 4 of controller matrix
   // Can reomve objects using ( model.remove or <obj>.remove )

}
