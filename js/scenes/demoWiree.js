import * as cg from "../render/core/cg.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

export const init = async model => {
   let strokes = [], wires = model.add(), ST = null, mode = null, timer;

   let strokes_rotY = (src, theta) => {
      let C = Math.cos(theta), S = Math.sin(theta);
      let dst = [];
      for (let n = 0 ; n < src.length ; n++) {
         dst.push([]);
         for (let i = 0 ; i < src[n].length ; i++)
            dst[n].push([ C * src[n][i][0] - S * src[n][i][2],
	                      src[n][i][1],
			  C * src[n][i][2] + S * src[n][i][0] ]);
      }
      return dst;
   }

   let strokes_xform = (src, m) => {
      let dst = [];
      for (let n = 0 ; n < src.length ; n++) {
         dst.push([]);
         for (let i = 0 ; i < src[n].length ; i++)
/*
            dst[n].push([ xyzs[0] + xyzs[3] * src[n][i][0],
                          xyzs[1] + xyzs[3] * src[n][i][1],
                          xyzs[2] + xyzs[3] * src[n][i][2] ]);
*/
            dst[n].push(cg.mTransform(m, src[n][i]));
      }
      return dst;
   }

   let strokes_resample = (src, ns) => {
      let dst = [];
      for (let n = 0 ; n < src.length ; n++)
         dst.push(matchCurves.resample(src[n], ns));
      return dst;
   }

   let s1 = [ [ [-1,1,0], [-1,-1,0], [1,-1,0], [1,1,0], [-1,1,0] ] ];
   let s2 = [ [ [-1, 1,-1], [-1,-1,-1], [1,-1,-1], [1, 1,-1], [-1, 1,-1] ],
              [ [-1, 1, 1], [-1,-1, 1], [1,-1, 1], [1, 1, 1], [-1, 1, 1] ],
	      [ [-1,-1,-1], [-1,-1, 1] ],
	      [ [ 1,-1,-1], [ 1,-1, 1] ],
	      [ [-1, 1,-1], [-1, 1, 1] ],
	      [ [ 1, 1,-1], [ 1, 1, 1] ], ];
   matchCurves.addGlyphFromCurves(
      '\\',
      s1,
      (time, T) => {
         let x = T[0], y = T[1], z = T[2], s = T[3];
         let m = [s,0,0,0, 0,s,0,0, 0,0,s*cg.ease(time/2),0, x,y,z,1];
         return strokes_resample(strokes_xform(strokes_rotY(s2, time), m), 30);
      }
   );

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

   if (false) {
      strokes = [ [ [-.3,1.8,0], [-.3,1.2,0], [.3,1.2,0], [.3,1.8,0], [-.3,1.8,0] ] ];
      ST = matchCurves.recognize(strokes);
      mode = 'morph';
      timer = 0;
   }

   model.animate(() => {
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
	 ST = null;
	 mode = null;
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
               if (glyph.code) {
                  strokes = glyph.code(timer - 1, ST[3]);
                  buildWires();
               }
            }
            break;
         }
      }
   });
}

