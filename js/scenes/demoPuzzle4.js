import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";
import { InputEvents } from "../render/core/InputEvents.js";

window.puzzle = [
   1,1,1, 1,2,1, 1,2,1,
   2,1,2, 2,0,2, 1,1,1,
   1,1,1, 1,2,1, 1,2,1,
];

let isSolved = () => {
   let solution = [
      2,1,2, 1,1,1, 2,1,2,
      1,1,1, 1,0,1, 1,1,1,
      2,1,2, 1,1,1, 2,1,2,
   ];
   for (let n = 0 ; n < puzzle.length ; n++)
      if (puzzle[n] != solution[n])
         return false;
   return true;
}

let createNewPuzzle = () => {
   for (let k = 0 ; k < 100 ; k++) {
      if (k >= 10 && puzzle[13] == 0)
         return;
      swap(26.9 * Math.random() >> 0,
           26.9 * Math.random() >> 0);
   }
}

let swap = (a,b) => {
   let tmp = puzzle[a];
   puzzle[a] = puzzle[b];
   puzzle[b] = tmp;
}

let i = n => n % 3 - 1;
let j = n => (n/3>>0) % 3 - 1;
let k = n => (n/9>>0) - 1;

let B = [];
for (let n = 0 ; n < 27 ; n++)
   B.push([.1 * i(n), .1 * j(n) + 1, .1 * k(n)]);

export const init = async model => {

   for (let n = 0 ; n < 27 ; n++)
      model.add('sphere');

   let helpMenu = model.add();
   let doneMenu = model.add();

   helpMenu.add('cube').move(0,1.3,0).scale(.25,.25,.0001).texture(() => {
      g2.setColor('#ffffff');
      g2.fillRect(.2,.3,.6,.4);
      g2.setColor('#000000');
      g2.textHeight(.04);
      g2.fillText(
`Goal: Move the 8 red balls
into the corners, with the
empty space in the middle.

To play: Click on a ball
to move it into an
empty space next to it.
`, .5, .625, 'center');
   });

   doneMenu.add('cube').move(0,1.3,0).scale(.25,.25,.0001).texture(() => {
      g2.setColor('#ffffff');
      g2.fillRect(.2,.3,.6,.4);
      g2.setColor('#000000');
      g2.textHeight(.04);
      g2.fillText(
`Congratulations,
you did it!


Click on any ball
to start a new game.
`, .5, .625, 'center');
   });

   let inputEvents = new InputEvents(model);

   let findBox = hand => {
      for (let n = 0 ; n < 27 ; n++) {
         let p = cg.subtract(inputEvents.pos(hand), B[n]);
	 if (Math.min(p[0],p[1],p[2]) > -.05 && Math.max(p[0],p[1],p[2]) < .05)
	    return n;
      }
      return -1;
   }

   inputEvents.onPress = hand => {
      if (isSolved()) {
         createNewPuzzle();
         server.broadcastGlobal('puzzle');
         return;
      }

      let N = 0;
      for (let n = 0 ; n < 27 ; n++)
         if (puzzle[n] == 0)
            N = n;

      let n = findBox(hand), a = i(n)-i(N), b = j(n)-j(N), c = k(n)-k(N);
      if (a*a + b*b + c*c == 1) {
         swap(n, N);
         server.broadcastGlobalSlice('puzzle', n, n+1);
         server.broadcastGlobalSlice('puzzle', N, N+1);
      }
   }

   model.animate(() => {
      puzzle = server.synchronize('puzzle');
      inputEvents.update();
      helpMenu.identity().scale(isSolved() ? 0 : 1);
      doneMenu.identity().scale(isSolved() ? 1 : 0);
      for (let n = 0 ; n < 27 ; n++)
         model.child(n).identity().move(B[n]).scale(puzzle[n]==0 ? 0 : .03)
	                                     .color(puzzle[n]==1 ? 'cyan' : 'red');
   });
}


