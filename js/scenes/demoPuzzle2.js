import * as cg from "../render/core/cg.js";
import { InputEvents } from "../render/core/InputEvents.js";

export const init = async model => {

   let inputEvents = new InputEvents(model);

   let i = n => n % 3 - 1;
   let j = n => (n/3>>0) % 3 - 1;
   let k = n => (n/9>>0) - 1;

   let swap = (a,b) => {
      let tmp = C[a];
      C[a] = C[b];
      C[b] = tmp;
   }

   let B = [], C = [];
   for (let n = 0 ; n < 27 ; n++) {
      B.push([.1 * i(n), .1 * j(n) + 1, .1 * k(n)]);
      C.push(n==0||n==2||n==6||n==8||n==18||n==20||n==24||n==26 ? 1 : 0);
   }

   for (let k = 0 ; k < 100 ; k++) {
      let a = 26.9 * (.5 + .5 * Math.sin(k * 31415)) >> 0;
      let b = 26.9 * (.5 + .5 * Math.sin(k * 92653)) >> 0;
      swap(a, b);
   }

   for (let n = 0 ; n < 27 ; n++)
      model.add('sphere');

   let findBox = hand => {
      for (let n = 0 ; n < 27 ; n++) {
         let p = cg.subtract(inputEvents.pos(hand), B[n]);
	 if (Math.min(p[0],p[1],p[2]) > -.05 && Math.max(p[0],p[1],p[2]) < .05)
	    return n;
      }
      return -1;
   }

   let N = 13;

   inputEvents.onPress = hand => {
      let n = findBox(hand), a = i(n)-i(N), b = j(n)-j(N), c = k(n)-k(N);
      if (a*a + b*b + c*c == 1) {
         swap(n, N);
         N = n;
      }
   }

   model.animate(() => {
      inputEvents.update();
      for (let n = 0 ; n < 27 ; n++)
         model.child(n).identity().move(B[n]).scale(n == N ? 0 : .03).color(C[n] ? 'red' : 'cyan');
   });
}


