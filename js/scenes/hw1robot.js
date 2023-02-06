import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {
   // let cube = model.add('cube').texture('../media/textures/brick.png');
   // let tube2 = model.add('tubeY').color(0,1,0);
   // let tube3 = model.add('tubeZ').color(0,0,1);
   // let ball = model.add('sphere').color(1,1,0);

   let head = model.add();
   head.add('tubeX').color(1,1,1);
   head.add('sphere').color(0,0,0);
   head.add('sphere').color(0,0,0);

   let neck = model.add('tubeY').color(1,1,1);

   let body = model.add('sphere').color(.75,.75,.75).texture('../media/textures/metal.png');

   let antenna = model.add();
   antenna.add('tubeY').color(1,1,1);
   antenna.add('sphere').color(1,0,0);

   model.move(0,1,0).scale(.3).turnY(-Math.PI/4).animate(() => {
      // cube.identity().move(Math.sin(model.time),0,0)
      //                .turnX(model.time)
      //                .turnY(model.time)
      //                .turnZ(model.time)
      //                .scale(.4);
      // tube1.identity().move(0, .5,0).scale(.2);
      // tube2.identity().move(0, .0,0).scale(.2);
      // tube3.identity().move(0,-.5,0).scale(.2);
      // ball.identity().move(-.5,Math.abs(Math.sin(3*model.time)),0).scale(.2);

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

      neck.identity().turnY(-Math.PI/4).move(.12+yMove,1.3,.01+xMove).scale(.15);

      body.identity().turnY(-Math.PI/4).move(.12+yMove,.4,xMove).scale(.8)
                  .turnX(xMove).turnY(yMove);

      antenna.identity().turnY(-Math.PI/4).move(.12+yMove,1.7,-.18+xMove);
      
      antenna.child(0).identity().scale(.01,.1,.01);

      antenna.child(1).identity().move(0,.1,0).scale(.03);
   });
}