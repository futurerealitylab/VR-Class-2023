import { xrEntryUI } from "../global.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {
   let robot = model.add('')
   let head = robot.add('');
   let arms = robot.add('');

   let l_arm = arms.add('');
   let r_arm = arms.add('');

   let mouth = head.add('');
   let l_eye = head.add('')

   let wheels = robot.add('');
   let l_wheel = wheels.add('');
   let r_wheel = wheels.add('');

   head.add('cube').scale(.3).move(0, 2.8, 0).color(0, 0.1, 0.1);
   head.add('tubeZ').scale(0.1, 0.1, 0.01).move(1.7, 10, 30).color(1, 1, 1);
   head.add('tubeZ').scale(0.1, 0.1, 0.01).move(-1.7, 10, 30).color(1, 1, 1);
   head.add('tubeY').scale(0.01, 0.07, 0.01).move(0, 17, 0).color(1, 1, 1);
   head.add('sphere').scale(0.05).move(0, 25, 0).color('red');

   arms.add('cube').scale(0.6, 0.05, 0.05).move(0, 8, -5).color(0, 0.1, 0.1)

   l_arm.add('cube').turnX(-10).scale(0.05, 0.3, 0.05).move(-12, -0.5, 0).color(0, 0.1, 0.1)
   r_arm.add('cube').turnX(-10).scale(0.05, 0.3, 0.05).move(12, -0.5, 0).color(0, 0.1, 0.1)

   mouth.add('cube').scale(0.2, 0.05, 0.01).move(0, 14, 30).color(0, 0, 0);

   wheels.add('tubeX').scale(0.1, 0.3, 0.3).move(5, -1, 0).color(0, 0, 0);
   wheels.add('tubeX').scale(0.1, 0.3, 0.3).move(-5, -1, 0).color(0, 0, 0);

   robot.add('cube').scale(.5).color(0, 0.1, 0.1);


   const a = 0.00001

   model.move(0,1.5,0).scale(.3).animate(() => {
      robot.identity().turnY( Math.cos(model.time)).move(0, -1.96, 1 * Math.sin(model.time))
      head.identity().turnY(0.8* Math.cos(model.time))
   });
}

