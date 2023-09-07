import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

/*****************************************************************

   Demo of animated wire, with extra shading.

*****************************************************************/

export const init = async model => {
   let stroke = [];
   for (let t = 0 ; t <= 1 ; t += 1/10)
      stroke.push([2*t-1, 1.3 + t*(1-t), 0]);

   let wire = model.add();

   let f = (stroke, t) => {
      t = Math.min(t, .9999);
      let T = (stroke.length-1) * t;
      let i = T >> 0;
      let f = T - i;
      let a = stroke[i], b = stroke[i+1];
      return cg.mix(a, b, f);
   }

   model.animate(() => {
/*
      let isDown = buttonState.right[0].pressed;
      if (! wasDown && isDown)
         strokes.push([]);
      if (isDown) {
         let im = cg.mInverse(model.getMatrix());
         let m = mMultiply(controllerMatrix.right, im);
         strokes[strokes.length-1].push(m.slice(12,15));
      }
      wasDown = isDown;
*/
      model.remove(wire);
      wire = model.add(clay.wire(stroke.length,8));
      clay.animateWire(wire, .015, t => f(stroke, t));

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

