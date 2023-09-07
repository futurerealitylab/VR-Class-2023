import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves.js";

/*****************************************************************

   Demo of animated wire, with extra shading.

*****************************************************************/

export const init = async model => {
   let wasLeftDown = false, isLeftDown;
   let wasRightDown = false, isRightDown;
   let strokes = [];
   let wires = model.add();

   let buildWires = () => {
      model.remove(wires);
      wires = model.add();
      for (let n = 0 ; n < strokes.length ; n++)
         if (strokes[n].length > 1) {
            let outer = wires.add(clay.wire(strokes[n].length, 6, n));
            clay.animateWire(outer, .014, t => cg.sample(strokes[n], t));
            let inner = wires.add(clay.wire(strokes[n].length, 6, n + 100));
            clay.animateWire(inner, .007, t => cg.sample(strokes[n], t));
         }

      wires.flag('uWireTexture');
      model.customShader(`
         uniform int uWireTexture;
         --------------------------
         if (uWireTexture == 1) {
            float t = .5 + noise(400. * vAPos + 5. * vec3(0.,0.,uTime));
	    t = t * t * (3. - t - t);
	    float z = max(0., dot(vNor, eye));
            opacity = 30. * pow(t, 9.) * pow(z, 4.);
	    color.g *= .02 * opacity;
         }
      `);
   }

   model.animate(() => {
      if (isLeftDown = buttonState.left[0].pressed) {
         if (! wasLeftDown)
            strokes.push([]);
         let im = cg.mInverse(model.getMatrix());
         let m = cg.mMultiply(controllerMatrix.left, im);
	 strokes[strokes.length-1].push(cg.mTransform(m, [0,-.05,-.1]));
	 buildWires();
      }
      wasLeftDown = isLeftDown;

      if (isRightDown = buttonState.right[0].pressed)
         ;
      else if (wasRightDown) {
         strokes = [];
	 buildWires();
      }
      wasRightDown = isRightDown;
   });
}

