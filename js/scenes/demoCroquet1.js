import * as croquet from "../util/croquetlib.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

let strokes = [], wires, ST = null, timer;

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

export let updateModel = e => {
   console.log('CROQUET EVENT', e);
   switch (e.what) {

   case 'leftTriggerPress':
      console.log('left trigger press');
      strokes.push([]);
      break;

   case 'leftTriggerDrag':
      console.log('left trigger drag');
      let im = cg.mInverse(model.getMatrix());
      let m = cg.mMultiply(controllerMatrix.left, im);
      strokes[strokes.length-1].push(cg.mTransform(m, [0,-.05,-.1]));
      buildWires();
      break;

   case 'rightTriggerRelease':
      console.log('right trigger release');
      strokes = [];
      buildWires();
      break;

   case 'leftThumbRelease':
      console.log('eft thumb release');
      ST = matchCurves.recognize(strokes);
      timer = 0;
   }
}

export const init = async model => {
   console.log('CROQUET INIT');
   croquet.register('croquetDemo_1.0');
   wires = model.add();

   model.animate(() => {
      if (ST) {
         timer = Math.min(1, timer + 1.4 * model.deltaTime);
         strokes = matchCurves.mix(ST[0], ST[1], cg.ease(timer));
         buildWires();
         if (timer == 1)
            ST = null;
      }
   });
}

