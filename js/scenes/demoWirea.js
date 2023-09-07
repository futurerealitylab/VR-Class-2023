import * as cg from "../render/core/cg.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

export const init = async model => {
   let strokes = [], wires = model.add(), ST = null, mode = null, timer;

   let my3dPattern = [
      [ [-1,-1,-1], [1, .2, 1] ],
      [ [-1, 1,-1], [1,-.2, 1] ],
   ];
   matchCurves.addGlyphFromCurves('>', my3dPattern, time => window.isRed = true);

   let buildWires = () => {
      model.remove(wires);
      wires = model.add();
      for (let n = 0 ; n < strokes.length ; n++)
         if (strokes[n].length > 1) {
            let outer = wires.add(clay.wire(strokes[n].length, 6, n));
            let inner = wires.add(clay.wire(strokes[n].length, 6, n + 100));
            clay.animateWire(outer, .014, t => cg.sample(strokes[n], t));
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

   model.animate(() => {
      switch (controllerEventType()) {

      case 'leftTriggerPress':
         strokes.push([]);
      case 'leftTriggerDrag':
         let m = cg.mMultiply(controllerMatrix.left,
                              cg.mInverse(model.getMatrix()));
	 strokes[strokes.length-1].push(cg.mTransform(m, [0,-.05,-.1]));
	 buildWires();
	 break;

      case 'leftThumbRelease':
         ST = matchCurves.recognize(strokes);
	 mode = 'morph';
	 timer = 0;
	 break;

      case 'rightTriggerRelease':
         strokes = [];
	 buildWires();
	 break;
      }

      if (window.isRed)
         ST.color(1,0,0);

      if (ST) {
         switch (mode) {
	 case 'morph':
            timer = Math.min(1, timer + 1.4 * model.deltaTime);
            strokes = matchCurves.mix(ST[0], ST[1], cg.ease(timer));
	    buildWires();
            if (timer >= 1)
	       if (matchCurves.glyph(ST[2]).code) {
	          timer = 0;
	          mode = 'code';
               }
               else
	          ST = null;
	    break;
         case 'code':
	    matchCurves.glyph(ST[2]).code(timer);
            timer += model.deltaTime;
	    break;
         }
      }
   });
}

