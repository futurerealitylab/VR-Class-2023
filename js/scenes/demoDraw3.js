import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";
import { InputEvents } from "../render/core/inputEvents.js";
import { matchCurves } from "../render/core/matchCurves3D.js";

export const init = async model => {
   let drawings = [];

   let addGlyphFromCurves = (name, drawing, f) => {
      matchCurves.addGlyphFromCurves(name, drawing, f);
      drawings.push({name: name, drawing: drawing});
   }

   // RED ORANGE YELLOW GREEN BLUE INDIGO VIOLET PINK WHITE GRAY BLACK BROWN

   let colors = [
      'red',
      '#ff8000',
      'yellow',
      '#40ff40',
      '#2080ff',
      '#9000ff',
      '#ff00a0',
      '#ff80c0',
      'white',
      '#606060',
      'black',
      '#400000',
   ];

   let helpMenu = model.add('cube').texture(() => {
      g2.setColor('#ff80ff80');
      g2.fillRect(0,0,1,1);
      g2.setColor('#ff80ff');
      g2.textHeight(.07);
      g2.fillText('Things you can draw', .02, .95, 'left');

      g2.textHeight(.05);
      g2.fillText('Stroke order:', .02, .86, 'left');
      for (let i = 0 ; i < colors.length ; i++) {
         g2.setColor(colors[i]);
         g2.fillRect(.33 + i * .05, .84, .04, .04);
      }

      g2.setColor('#ff80ff');
      let msg = (a,b,y) => {
         g2.fillText(a+b, .01, y, 'left');
         g2.fillText(a,  .012, y, 'left');
      }
      msg('To draw:'   ,' Hold down the right trigger', .155);
      msg('To erase:'  ,' Click the right trigger'    , .095);
      msg('To animate:',' Click the left trigger'     , .035);

      g2.lineWidth(.01);
      for (let n = 0 ; n < drawings.length ; n++) {
         let name    = drawings[n].name;
         let drawing = drawings[n].drawing;
         let x = .128 + .24 * (n%4);
         let y = .760 - .31 * (n/4>>0);
         g2.setColor('#ff80ff');
         g2.fillText(name, x, y, 'center');
         for (let i = 0 ; i < drawing.length ; i++) {
            g2.setColor(colors[i]);
            let path = [];
            let nj = drawing[i].length;
            for (let j = 0 ; j < nj ; j++) {
               let p = drawing[i][j];
               path.push([x + .08 * p[0], y - .13 + .08 * p[1]]);
            }
            g2.drawPath(path.slice(0, nj-1));
            g2.arrow(path[nj-2], cg.mix(path[nj-2], path[nj-1], .8));
         }
      }
   });

   let strokes = [], wires = model.add(), ST = null, mode = null, timer;

   let strokes_animate = (strokes, m, time, T) => {
      m = cg.mMultiply(cg.mTranslate(T[0],T[1],T[2]),
          cg.mMultiply(cg.mScale(T[3],T[3],T[3]*cg.ease(time/2)), m));
      return strokes_transform(strokes, m);
   }

   let resample = (src, ns) => {
      ns = ns !== undefined ? ns : 20;
      let dst = [];
      for (let n = 0 ; n < src.length ; n++)
         dst.push(matchCurves.resample(src[n], ns));
      return dst;
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

   let bird = time => {
      let theta1 = Math.sin(2 * time - 2.8) * .4 - .6;
      let theta2 = Math.cos(2 * time - 2.8) * .8;
      let C1 = .7 * Math.cos(theta1), S1 = .7 * Math.sin(theta1);
      let C2 = .7 * Math.cos(theta2), S2 = .7 * Math.sin(theta2);
      let c = [ 0, .1 + .5 * S1, 0 ];
      let b = [ c[0] - C1, c[1] - S1, 0 ];
      let a = [ b[0] - C2, b[1] + S2, 0 ];
      let d = [ c[0] + C1, c[1] - S1, 0 ];
      let e = [ d[0] + C2, d[1] + S2, 0 ];
      return [ [ a, b, c, d, e ] ];
   }

   let fish = time => {
      let S = .1 * Math.sin(4 * time);
      let dst = [
         cg.spline([
            [-1-.2*S,.3-S,0],
            [-.3,0,0],
            [.7,-.3,0],
            [1.05,0,0],
            [.7,.3,0],
            [-.3,0,0],
            [-1+.2*S,-.3-S,0]
         ]),
         [ [-1-.2*S,.3-S,0], [-1+.2*S,-.3-S,0] ],
      ];
      if (time > 0)
         dst.push([ [.55,.1,0], [.7,.1,0] ]);
      return dst;
   }

   let moon = time => {
      let hanzi = [
         [ [-.5,1,0],[-.5,-1,0] ],
         [ [-.5,1,0],[.5,1,0],[.5,-1,0] ],
         [ [-.5,.5,0],[.5,.5,0] ],
         [ [-.5,0,0],[.5,0,0] ],
      ];
      let shape = [
         cg.spline([[0,1,0],[0,0,0],[-.5,-1,0]]),
         cg.spline([[0,1,0],[.6,.4,0],[.6,-.3,0],[.25,-.75,0],[-.5,-1,0]]),
         [ [0,.1,0],[0,.11,0] ],
         [ [0,0,0],[0,.01,0] ],
      ];

      let t = cg.ease(time);

      let dst = [];
      for (let n = 0 ; n < hanzi.length ; n++) {
         dst.push([]);
         let a = cg.resampleCurve(hanzi[n], 20);
         let b = cg.resampleCurve(shape[n], 20);
         for (let i = 0 ; i < a.length ; i++)
            dst[n].push(cg.mix(a[i], b[i], t));
      }
      return dst;
   }

   addGlyphFromCurves('cube', square, (time, T) =>
      matchCurves.animate(() => cube, cg.mRotateY(time/2), time, T));

   addGlyphFromCurves('bird', bird(0), (time,T) =>
      matchCurves.animate(time => bird(time), cg.mIdentity(), time, T));

   addGlyphFromCurves('fish', fish(0), (time,T) =>
      matchCurves.animate(time => fish(time), cg.mIdentity(), time, T));

   addGlyphFromCurves('moon', moon(0), (time,T) =>
      matchCurves.animate(time => moon(time), cg.mIdentity(), time, T));

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
         strokes_transform(moon(0),
            cg.mMultiply(cg.mTranslate(0,1.7,0), cg.mScale(.2))));
      mode = 'morph';
      timer = 0;
   }

   let inputEvents = new InputEvents(model);

   let isLeftDown = false, isRightDown = false;

   inputEvents.onPress = hand => {
      if (hand == 'left') {
         isLeftDown = true;
      }
      if (hand == 'right') {
         isRightDown = true;
         strokes.push([]);
      }
   }

   inputEvents.onDrag = hand => {
      if (hand == 'right') {
         if (! isLeftDown && strokes.length > 0) {
            strokes[strokes.length-1].push(inputEvents.pos('right'));
            buildWires();
         }
      }
   }

   inputEvents.onRelease = hand => {
      if (hand == 'left') {
         isLeftDown = false;
         if (strokes.length > 0 && strokes[0].length > 1) {
            ST = matchCurves.recognize(strokes);
            mode = 'morph';
            timer = 0;
         }
      }
      if (hand == 'right') {
         isRightDown = false;
         if (mode == 'morph' || strokes.length > 0 && strokes[strokes.length-1].length < 10) {
            ST = null;
            mode = null;
            strokes = [];
            buildWires();
         }
      }
   }

   model.animate(() => {
      inputEvents.update();

      helpMenu.setMatrix(inputEvents.adjustToWorld())
              .move(.65,1.5,.5).turnY(-.8).scale(.25,.25,.0001);
      wires.setMatrix(inputEvents.adjustToWorld());

      if (ST && mode == 'morph') {
         timer += 1.8 * model.deltaTime;
         if (timer < 1) {                         // MORPH AFTER RECOGNIZING
            strokes = matchCurves.mix(ST[0], ST[1], cg.ease(timer));
            buildWires();
         }
         else {                                   // ANIMATE AFTER MORPHING
            let glyph = matchCurves.glyph(ST[2]);
            if (glyph.code) {
               strokes = glyph.code(timer - 1, ST[3]);
               buildWires();
            }
         }
      }
   });
}

