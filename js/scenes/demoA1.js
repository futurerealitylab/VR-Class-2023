import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {
   // let cube = model.add('cube').texture('../media/textures/brick.png');
   // let tube1 = model.add('tubeX').color(1,0,0);
   // let tube2 = model.add('tubeY').color(0,1,0);
   // let tube3 = model.add('tubeZ').color(0,0,1);
   // let ball = model.add('sphere').color(1,1,0);

   let leye = model.add();
   leye.add('sphere');
   leye.add('sphere');

   let reye = model.add();
   reye.add('sphere');
   reye.add('sphere');
   reye.identity().move(3,0,0);

   model.move(0,1.5,0).scale(.02).animate(() => {
      leye.child(1).identity().color(0,0,0)
                   .move(0,0,1)
                   .scale(0.5)
                   .scale(1, Math.abs(Math.sin(model.time)), 1);;                     
      reye.child(1).identity().color(0,0,0)
                   .move(0,0,1)
                   .scale(0.5)
                   .scale(1, Math.abs(Math.sin(model.time)), 1);;    
   });
   
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

