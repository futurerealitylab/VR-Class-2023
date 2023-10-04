import * as cg from "../render/core/cg.js";
import { InputEvents } from "../render/core/InputEvents.js";

export const init = async model => {

   let inputEvents = new InputEvents(model);

   let B = [];
   for (let n = 0 ; n < 27 ; n++)
      B.push([.1 * (n % 3 - 1),
              .1 * ((n/3>>0) % 3 - 1) + .5,
              .1 * ((n/9>>0) - 1)]);

   for (let n = 0 ; n < 27 ; n++)
      model.add('cube').move(B[n]).scale(.03);

   let findBox = hand => {
      for (let n = 0 ; n < 27 ; n++) {
         let p = cg.subtract(inputEvents.pos(hand), B[n]);
	 if (Math.min(p[0],p[1],p[2]) > -.05 && Math.max(p[0],p[1],p[2]) < .05)
	    return n;
      }
      return -1;
   }

   let N = -1;

   inputEvents.onPress = hand => {
      N = findBox(hand);
   }

   inputEvents.onRelease = hand => {
   }

   model.animate(() => {
      inputEvents.update();
      for (let n = 0 ; n < 27 ; n++)
         model.child(n).color(n == N ? 'red' : 'white');
   });
}


