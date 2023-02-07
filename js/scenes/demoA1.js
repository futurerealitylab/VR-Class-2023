import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {
   
   
   let robot = model.add().color(.7,.7,.7).move(0,1.5,0);
   //let base  = robot.add();
   let head  = robot.add('cube').scale(0.07);
   let trunk = robot.add();
   
   let neck  = trunk.add('sphere').move(0,-0.15,0).scale(0.03);;
   let leftS = neck.add('sphere').move(-3,0,0);
   let leftE = leftS.add('sphere').move(-3,3,0);

   let rightS = neck.add('sphere').move(3,0,0);
   let rightE = rightS.add('sphere').move(4,3,0);
   

   // SPINE 
   let spine = trunk.add('sphere').move(0,-0.3,0).scale(0.03);
   
   
   let crotch  = trunk.add('sphere').move(0,-0.45,0).scale(0.03);;
   let leftG = crotch.add('sphere').move(-3,0,0);
   let leftK = leftG.add('sphere').move(0,-5,0);

   let rightG = crotch.add('sphere').move(3,0,0);
   let rightK = rightG.add('sphere').move(0,-5,0);


   // EYES
   let eyes = head.add();
   
   let leye = eyes.add('sphere').move(-1.5,0,0);
   let reye = eyes.add('sphere').move(1.5,0,0);
   
   // PUPILS
   let leftEyePupil  = leye.add('sphere').color(0,0,0).scale(0.5);
   let rightEyePupil = reye.add('sphere').color(0,0,0).scale(0.5);
   
   eyes.move(0,0.5,0.9).scale(0.27);

   // NOSE
   let nose = head.add();
   nose.add('tubeZ').move(0,-0.1,1).color(.5,.5,.5).scale(0.24);

   // MOUTH
   let mouth = head.add('cube').move(0,-0.6,1).scale(.5,.05,.1).color(0.5,0.3,0.3);

   
   let limb = (a,b,c,r) => {
      if (r === undefined) r = 0.012;
      a.color(.7,.7,.7);
      let B = b.getGlobalMatrix().slice(12, 15);
      let C = c.getGlobalMatrix().slice(12, 15);
      a.setMatrix(cg.mMultiply(cg.mTranslate(cg.mix(B,C,.5)),
                  cg.mMultiply(cg.mAimZ(cg.subtract(C,B), [0,0,1]),
		               cg.mScale(r,r,.5*cg.distance(B,C)))));
   }

   let nh = model.add('tubeZ');
   let nS = model.add('tubeZ');
   let sC = model.add('tubeZ');

   let nLS = model.add('tubeZ');
   let nRS = model.add('tubeZ');

   let sLE = model.add('tubeZ');
   let sRE = model.add('tubeZ');

   let cLG = model.add('tubeZ');
   let cRG = model.add('tubeZ');
   
   let gLK = model.add('tubeZ');
   let gRK = model.add('tubeZ');
   

   robot.animate(() => {
      leftEyePupil.identity().move(0,0,0.9*Math.abs(Math.sin(model.time))).scale(0.5);                 
      rightEyePupil.identity().move(0,0,0.9*Math.abs(Math.sin(model.time))).scale(0.5);
      
      limb(nh, neck, head);
      limb(nS, neck, spine);
      limb(sC, spine, crotch);

      limb(nLS, neck, leftS);
      limb(nRS, neck, rightS);

      limb(sLE, leftS, leftE);
      limb(sRE, rightS, rightE);


      limb(cLG, crotch, leftG);
      limb(cRG, crotch, rightG);
      
      limb(gLK, leftG, leftK);
      limb(gRK, rightG, rightK);

      let wave = 3* Math.sin(3*model.time);
      leftE.identity().turnZ(-.1 * wave).move(-3,3,0);
      rightE.identity().turnZ(-.1 * wave).move(3,3,0);
      
      let walk =  Math.sin(5*model.time);
      leftK.identity().turnX(walk).move(0,-5,0);
      rightK.identity().turnX(-walk).move(0,-5,0);

      robot.turnY(0.005*Math.sin(model.time));
      
   });

   
   // -------
   // let leye = model.add();
   
   
   // model.move(0,1.5,0).scale(.02).animate(() => {
   //    leye.child(1).identity().color(0,0,0)
   //                 .move(0,0,1)
   //                 .scale(0.5)
   //                 .scale(1, Math.abs(Math.sin(model.time)), 1);                     
   //    reye.child(1).identity().color(0,0,0)
   //                 .move(0,0,1)
   //                 .scale(0.5)
   //                 .scale(1, Math.abs(Math.sin(model.time)), 1);    
   // });
   
   // let eye = model.add();
   // eye.add('sphere');
   // eye.add('sphere').color(0,0,0);

   // eye.identity().move(0,1.5,0)
   //               .turnX(Math.sin(2.1*model.time))
   //               .turnY(Math.sin(1.0*model.time)).scale(.3);
   // eye.child(1).identity()
   //               .move(0,0,.6).scale([.6,.6,.5])
   //               .color(0,0,.5 + .5 * Math.sin(3 * model.time));

   // model.move(0,1.5,0).scale(.3).animate(() => {
   //    cube.identity().move(Math.sin(model.time),0,0)
   //                   .turnX(model.time)
   //                   .turnY(model.time)
   //                   .turnZ(model.time)
   //                   .scale(.4);
   //    tube1.identity().move(0, .5,0).scale(.2);
   //    tube2.identity().move(0, .0,0).scale(.2);
   //    tube3.identity().move(0,-.5,0).scale(.2);
   //    ball.identity().move(-.5,Math.abs(Math.sin(3*model.time)),0).scale(.2);

   //    eye.identity().move(0,1.5,0)
   //                  .turnX(Math.sin(2.1*model.time))
   //                  .turnY(Math.sin(1.0*model.time)).scale(.3);
   //    eye.child(1).identity()
   //                .move(0,0,.6).scale([.6,.6,.5])
   //                .color(0,0,.5 + .5 * Math.sin(3 * model.time));
   // });

   // let robot = model.add();
   // robot.add('cube');
}

