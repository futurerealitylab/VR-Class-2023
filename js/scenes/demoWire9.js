import * as cg from "../render/core/cg.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

export const init = async model => {
   let strokes = [];
   let wires = model.add();
   let ST = null, timer, strokesZ;

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
      switch (controllerEventType()) {

      case 'leftTriggerPress':
         strokes.push([]);
      case 'leftTriggerDrag':
         let im = cg.mInverse(model.getMatrix());
         let m = cg.mMultiply(controllerMatrix.left, im);
	 strokes[strokes.length-1].push(cg.mTransform(m, [0,-.05,-.1]));
	 buildWires();
	 break;

      case 'leftThumbRelease':
         ST = matchCurves.recognize(strokes);
	 timer = 0;
	 break;

      case 'rightTriggerRelease':
         strokes = [];
	 buildWires();
	 break;
      }

      if (ST) {
         timer = Math.min(1, timer + 1.4 * model.deltaTime);
         strokes = matchCurves.mix(ST[0], ST[1], cg.ease(timer));
	 buildWires();
         if (timer == 1)
	    ST = null;
      }
   });
}

