import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {

   let head = model.add();
   head.add('tubeX').color(1,1,1);
   head.add('sphere').color(0,0,0);
   head.add('sphere').color(0,0,0);

   let neck = head.add('tubeY').color(1,1,1);

   let body = neck.add('sphere').color(.75,.75,.75).texture('../media/textures/metal.png');

   let antenna = head.add();
   let a1 = antenna.add('tubeY').color(1,1,1);
   let a2 = a1.add('sphere').color(1,0,0);

   
   model.move(0,1,0).scale(.3).turnY(-Math.PI/4).animate(() => {

      let xMove =Math.sin(2*model.time);
      let yMove =Math.cos(1*model.time);
      head.identity().turnY(-Math.PI/4).move(yMove,1.5,xMove);
      // .turnX(Math.sin(2.1*model.time)).turnY(Math.sin(1.0*model.time));

      head.child(0).identity().move(.2,0,0)
                  .scale(.3,.15,.3);

      head.child(1).identity().move(.5,0,.1)
                  .scale(.18*Math.abs(Math.sin(model.time)))
                  .scale(.1,.3,.1);
      head.child(2).identity().move(.5,0,-.1)
                  .scale(.18*Math.abs(Math.sin(model.time)))
                  .scale(.1,.3,.1);

      neck.identity().move(.3,-.2,0).turnY(-Math.PI/4).scale(.15);

      body.identity().move(0,-5,0)
                  .turnX(xMove).turnY(yMove).scale(4.5);

      antenna.identity().move(.15,.2,-.18).turnY(-Math.PI/4);
      
      a1.identity().move(0,-.05,0).turnX(.5*xMove).move(0,.05,0).scale(.01,.1,.01);

      a2.identity().move(0,1.3,0).scale(.5);


   });
}