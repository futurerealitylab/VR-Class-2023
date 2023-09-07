import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

/*****************************************************************

   Demo of animated wire, with extra shading.

*****************************************************************/


export const init = async model => {
   let wasL0Down = false, isL0Down;
   let wasL1Down = false, isL1Down;
   let wasR0Down = false, isR0Down;
   let wasR1Down = false, isR1Down;
   let strokes = [];
   let wires = model.add();
   let ST = null, timer, strokesZ;

   let my3dPattern = [
      [ [-1,-1,-1], [1, .2, 1] ],
      [ [-1, 1,-1], [1,-.2, 1] ],
   ];
   matchCurves.addGlyphFromCurves('>', my3dPattern);

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
	    float u = 1. - vNor.x * vNor.x - vNor.y * vNor.y;
	    t = t * t * (3. - t - t);
            opacity = 30. * pow(t, 9.) * u * u;
	    color.g *= .02 * opacity;
         }
      `);
   }

   if (false) {
      let stroke;

      stroke = [];
      for (let t = 0 ; t <= 1 ; t += 1/10)
         stroke.push([t-.5, 1.7 - t*(1-t), t-.5]);
      strokes.push(stroke);

      stroke = [];
      for (let t = 0 ; t <= 1 ; t += 1/10)
         stroke.push([t-.5, 1.4 + t*(1-t), .5-t]);
      strokes.push(stroke);

      buildWires();
      let ST = matchCurves.recognize(strokes);
   }

   model.animate(() => {
      if (isL0Down = buttonState.left[0].pressed) {
         if (! wasL0Down)
            strokes.push([]);
         let im = cg.mInverse(model.getMatrix());
         let m = cg.mMultiply(controllerMatrix.left, im);
	 strokes[strokes.length-1].push(cg.mTransform(m, [0,-.05,-.1]));
	 buildWires();
      }
      wasL0Down = isL0Down;

      if (isR0Down = buttonState.right[0].pressed) {
      }
      else if (wasR0Down) {
         strokes = [];
	 buildWires();
      }
      wasR0Down = isR0Down;

      if (isL1Down = buttonState.left[1].pressed) {
      }
      else if (wasL1Down) {
         ST = matchCurves.recognize(strokes);
	 timer = 0;
      }
      wasL1Down = isL1Down;

      if (ST) {
         timer = Math.min(1, timer + 1.4 * model.deltaTime);
         strokes = matchCurves.mix(ST[0], ST[1], cg.ease(timer));
	 buildWires();
         if (timer == 1)
	    ST = null;
      }
   });
}

