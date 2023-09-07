import * as cg from "../render/core/cg.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

export const init = async model => {
   let strokes = [], wires = model.add(), ST = null, mode = null, timer;

   matchCurves.addGlyphFromCurves('+',
      [ [ [0,1,0],[0,-1,0] ], [ [-1,0,0],[1,0,0] ] ],
      time => {
         let c = Math.cos(time), s = Math.sin(time);
	 return [ [ [s,c,0],[s,-c,0] ], [ [-c,s,0],[c,s,0] ] ];
      });

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
      console.log('animate');
      switch (controllerEventType()) {

      // DRAW

      case 'rightTriggerPress':
         strokes.push([]);
      case 'rightTriggerDrag':
         let m = cg.mMultiply(controllerMatrix.right,
                              cg.mInverse(model.getMatrix()));
	 strokes[strokes.length-1].push(cg.mTransform(m, [0,-.05,-.1]));
	 buildWires();
	 break;

      // ERASE

      case 'rightThumbRelease':
         strokes = [];
	 buildWires();
	 break;

      // INTERPRET

      case 'leftTriggerRelease':
         ST = matchCurves.recognize(strokes);
	 mode = 'morph';
	 timer = 0;
	 break;
      }

      if (ST) {
         switch (mode) {
	 case 'morph':
            timer += 1.4 * model.deltaTime;
	    if (timer < 1) {
	       strokes = matchCurves.mix(ST[0], ST[1], cg.ease(timer));
	       buildWires();
            }
            else {
	       let glyph = matchCurves.glyph(ST[2]);
	       let code = glyph.code;
	       if (code) {
                  strokes = code(timer - 1);
	          buildWires();
		  wires.color(1,0,0);
               }
	       else
		  wires.color(0,1,0);
            }
	    break;
         }
      }
   });
}

