import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

/*****************************************************************

   Demo of animated wire, with extra shading.

*****************************************************************/

export const init = async model => {
   let wasDown = false;
   let stroke = [];
   for (let t = 0 ; t <= 1 ; t += 1/10)
      stroke.push([2*t-1, 1.3 + t*(1-t), 0]);

   let wire = model.add();

   model.animate(() => {
      let leftTrigger = buttonState.left[0].pressed;

      let isDown = buttonState.left[0].pressed;
/*
      if (! wasDown && isDown)
         strokes.push([]);
      if (isDown) {
         let im = cg.mInverse(model.getMatrix());
         let m = mMultiply(controllerMatrix.right, im);
         strokes[strokes.length-1].push(m.slice(12,15));
      }
*/
      if (isDown) {
         let im = cg.mInverse(model.getMatrix());
         let m = cg.mMultiply(controllerMatrix.left, im);
         stroke.push(m.slice(12,15));
      }
      wasDown = isDown;

      model.remove(wire);
      wire = model.add(clay.wire(stroke.length,8));
      if (leftTrigger)
         wire.color(1,0,0);
      clay.animateWire(wire, .015, t => cg.sample(stroke, t));

/*
      wire.flag('uWireTexture');
      model.customShader(`
         uniform int uWireTexture;
         --------------------------
         if (uWireTexture == 1) {
            float t = noise(70. * vAPos + 5. * vec3(0.,0.,uTime));
            opacity = 30. * pow(.5 + t, 9.);
	    color.g *= .01 * opacity;
         }
      `);
*/

   });
}

