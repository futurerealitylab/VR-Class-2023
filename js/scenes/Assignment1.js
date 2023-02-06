import { xrEntryUI } from "../global.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {
   const BASE_COLOR = [0, 0.1, 0.2];

   let robot = model.add('');
   let base = robot.add('');

   let head = base.add('');
   let mouth = head.add('');
   let l_eye = head.add('')
   let r_eye = head.add('')

   let arm_bar = base.add('');
   let l_arm = base.add('');
   let r_arm = base.add('');

   let wheels = base.add('');
   let l_wheel = wheels.add('');
   let r_wheel = wheels.add('');

   base.add('cube').scale(.5).color(...BASE_COLOR);

   head.add('tubeY').scale(0.01, 0.07, 0.01).move(0, 17, 0).color(1, 1, 1);
   head.add('sphere').scale(0.05).move(0, 25, 0).color('red');
   head.add('cube').scale(.3).move(0, 2.8, 0).color(...BASE_COLOR);

   mouth.add('cube').scale(0.2, 0.05, 0.01).move(0, 14, 30).color(0, 0, 0);
   l_eye.add('tubeZ').scale(0.1, 0.1, 0.01).move(1.7, 10, 30).color(1, 1, 1);
   r_eye.add('tubeZ').scale(0.1, 0.1, 0.01).move(-1.7, 10, 30).color(1, 1, 1);
   
   arm_bar.add('cube').scale(0.6, 0.05, 0.05).move(0, 8, -5).color(...BASE_COLOR)
   l_arm.add('cube').scale(0.05, 0.3, 0.05).move(-12, 2.1, -5).color(...BASE_COLOR)
   r_arm.add('cube').scale(0.05, 0.3, 0.05).move(12, 2.1, -5).color(...BASE_COLOR)

   l_wheel.add('tubeX').scale(0.1, 0.3, 0.3).move(5, -1, 0).color(0, 0, 0);
   r_wheel.add('tubeX').scale(0.1, 0.3, 0.3).move(-5, -1, 0).color(0, 0, 0);

   model.move(0,1.5,0).scale(.3).animate(() => {
      // robot.identity().turnY( Math.cos(model.time))//.move(0, -1.96, 1 * Math.sin(model.time))
      // head.identity().turnY(0.8* Math.cos(model.time))

      r_arm.identity().turnY(0.8 * Math.cos(model.time))
      l_arm.identity().turnY(0.8 * Math.cos(model.time))
   });
}

