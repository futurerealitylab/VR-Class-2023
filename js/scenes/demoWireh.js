import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

export const init = async model => {
   let drawings = [];

   let addGlyphFromCurves = (name, drawing, f) => {
      matchCurves.addGlyphFromCurves(name, drawing, f);
      drawings.push({name: name, drawing: drawing});
   }

   let obj1 = model.add('cube').texture(() => {
      g2.setColor('#ff00ff');
      g2.textHeight(.1);
      g2.fillText('Things you can draw', .5, .9, 'center');

      g2.textHeight(.05);
      g2.fillText('To draw: Hold down the right trigger'   , .05, .155, 'left');
      g2.fillText('To erase: Click the right thumb button' , .05, .095, 'left');
      g2.fillText('To animate: Click the left trigger'     , .05, .035, 'left');
      g2.fillText('To draw:'   , .052, .155, 'left');
      g2.fillText('To erase:'  , .052, .095, 'left');
      g2.fillText('To animate:', .052, .035, 'left');

      g2.lineWidth(.01);
      for (let n = 0 ; n < drawings.length ; n++) {
         let name    = drawings[n].name;
         let drawing = drawings[n].drawing;
	 let x = .125 + (n%4) * .25;
	 let y = .78 - .31 * (n/4>>0);
	 g2.fillText(name, x, y, 'center');
	 for (let i = 0 ; i < drawing.length ; i++) {
            let path = [];
	    let nj = drawing[i].length;
	    for (let j = 0 ; j < nj ; j++) {
	       let p = drawing[i][j];
	       path.push([x + .08 * p[0], y - .13 + .08 * p[1]]);
	    }
	    g2.drawPath(path.slice(0, nj-1));
	    g2.arrow(path[nj-2], cg.mix(path[nj-2], path[nj-1], .85));
	 }
      }
   });

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
      let theta1 = Math.sin(2 * time - 2.8) * .4 - .6;
      let theta2 = Math.cos(2 * time - 2.8) * .8;
      let C1 = Math.cos(theta1), S1 = Math.sin(theta1);
      let C2 = Math.cos(theta2), S2 = Math.sin(theta2);
      let c = [0,.1 + .5 * S1,0];
      let b = [ c[0] - .7 * C1, c[1] - .7 * S1, c[2] ];
      let a = [ b[0] - .7 * C2, b[1] + .7 * S2, b[2] ];
      let d = [ c[0] + .7 * C1, c[1] - .7 * S1, c[2] ];
      let e = [ d[0] + .7 * C2, d[1] + .7 * S2, d[2] ];
      return [ [ a, b, c, d, e ] ];
   }

   for (let n = 0 ; n < 1 ; n++) {
      addGlyphFromCurves('cube', square, (time, T) =>
         matchCurves.animate(() => cube, cg.mRotateY(time/2), time, T));

      addGlyphFromCurves('bird', flapping(0), (time,T) =>
         matchCurves.animate(time => flapping(time), cg.mIdentity(), time, T));
   }

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
      ST = matchCurves.recognize(
         strokes_transform(flapping(0),
	    cg.mMultiply(cg.mTranslate(0,1.7,0), cg.mScale(.2,.2,.2))));
      mode = 'morph';
      timer = 0;
   }

   model.animate(() => {
      obj1.identity().turnY(-.8).move(.9,1.5,0).scale(.2,.2,.0001);

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

