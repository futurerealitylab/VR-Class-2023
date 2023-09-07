import * as cg from "../render/core/cg.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

export const init = async model => {
   let strokes = [], wires = model.add(), ST = null, mode = null, timer;

   let strokes_animate = (strokes, m, time, T) => {
      m = cg.mMultiply(cg.mTranslate(T[0],T[1],T[2]),
          cg.mMultiply(cg.mScale(T[3],T[3],T[3]*cg.ease(time/2)), m));
      return strokes_transform(strokes, m);
   }

   let strokes_transform = (src, m) => {
      let dst = [];
      for (let n = 0 ; n < src.length ; n++) {
         let stroke = [];
         for (let i = 0 ; i < src[n].length ; i++)
            stroke.push(cg.mTransform(m, src[n][i]));
         dst.push(matchCurves.resample(stroke, 20));
      }
      return dst;
   }

   let square = [ [ [-1,1,0],[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0] ] ];

   let cube = [];
   for (let u = -1 ; u <= 1 ; u += 2)
   for (let v = -1 ; v <= 1 ; v += 2) {
      cube.push([ [u,v,-1], [u,v,1] ]);
      cube.push([ [v,-1,u], [v,1,u] ]);
      cube.push([ [-1,u,v], [1,u,v] ]);
   }

   let flapping = time => {
      let theta1 = Math.sin(2 * time + 2.2) * .4 - .6;
      let theta2 = Math.cos(2 * time + 2.2) * .8;
      let C1 = Math.cos(theta1), S1 = Math.sin(theta1);
      let C2 = Math.cos(theta2), S2 = Math.sin(theta2);
      let c = [0,.1 + .5 * S1,0];
      let b = [ c[0] - .5 * C1, c[1] - .5 * S1, c[2] ];
      let a = [ b[0] - .5 * C2, b[1] + .5 * S2, b[2] ];
      let d = [ c[0] + .5 * C1, c[1] - .5 * S1, c[2] ];
      let e = [ d[0] + .5 * C2, d[1] + .5 * S2, d[2] ];
      return [ [ a, b, c, d, e ] ];
   }

   matchCurves.addGlyphFromCurves('cube', square, (time, T) =>
      matchCurves.animate(() => cube, cg.mRotateY(time/2), time, T));

   matchCurves.addGlyphFromCurves('flap', flapping(0), (time,T) =>
      matchCurves.animate(time => flapping(time), cg.mIdentity(), time, T));

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

   if (true) {
      ST = matchCurves.recognize(
         strokes_transform(flapping(0),
	    cg.mMultiply(cg.mTranslate(0,1.7,0), cg.mScale(.2,.2,.2))));
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
            timer += .4 * model.deltaTime;
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

