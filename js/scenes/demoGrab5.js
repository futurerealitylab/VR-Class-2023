import * as cg from "../render/core/cg.js";
import { controllerEventTypes, controllerMatrix } from "../render/core/controllerInput.js";

if (! window.server)
   window.server = new Server();

let Ball = function(p) {
   this.pos = p;
   this.busy = false;
}

let ballColor = 'red,orange,yellow,green,cyan,blue,indigo,violet'.split(',');
let radius = 0.05;

window.balls = [];
for (let i = 0 ; i < ballColor.length ; i++) {
   let theta = 2 * Math.PI * i / ballColor.length;
   let c = 4 * radius * Math.cos(theta);
   let s = 4 * radius * Math.sin(theta);
   balls.push(new Ball([ s, 1.5 + c, .7 ]));
}

export const init = async model => {

   let wasPinch = { left: false, right: false };

   let index = { left: -1, right: -1 };

   for (let i = 0 ; i < balls.length ; i++)
      model.add('sphere').color(ballColor[i]);

   let frameCount = 0;

   model.animate(() => {

      balls = server.synchronize('balls');

      // WHEN STARTING, IF THIS IS THE ONLY CLIENT, THEN FORCE ALL BALLS TO NOT BE BUSY.

      if (++frameCount == 30 && window.clients.length == 1)
         for (let i = 0 ; i < balls.length ; i++)
            balls[i].busy = false;

      let press = hand => {
         if (index[hand] >= 0)
	    release(hand);
         let dMin = 10000, iMin = -1;
	 for (let i = 0 ; i < model.nChildren() ; i++)
	    if (! balls[i].busy) {
	       let d = cg.distance(pos[hand], balls[i].pos);
	       if (d < dMin) {
	          dMin = d;
		  iMin = i;
               }
            }
	 if (dMin < 2 * radius) {
	    index[hand] = iMin;
	    balls[iMin].busy = true;
         }
      }

      let release = hand => {
         let i = index[hand];
         if (i >= 0) {
	    index[hand] = -1;
	    balls[i].busy = false;
            server.broadcastGlobalSlice('balls', i, i+1);
         }
      }

      let pos = {};
      for (let hand in index)
         pos[hand] = cg.mMultiply(controllerMatrix[hand], cg.mInverse(model.getMatrix())).slice(12, 15);

      for (let hand in index) {
         let isPinch = clay.handsWidget.pinch[hand] == 1;
	 if (isPinch) pos[hand] = clay.handsWidget.getMatrix(hand, 1, 4).slice(12,15);
	 if (isPinch && ! wasPinch[hand]) press(hand);
	 if (wasPinch[hand] && ! isPinch) release(hand);
         wasPinch[hand] = isPinch;
      }

      let eventTypes = controllerEventTypes();
      for (let i = 0 ; i < eventTypes.length ; i++)
         switch (eventTypes[i]) {
         case 'leftTriggerPress': press('left'); break;
         case 'rightTriggerPress': press('right'); break;
         case 'leftTriggerRelease': release('left'); break;
         case 'rightTriggerRelease': release('right'); break;
         }

      for (let hand in index)
         if (index[hand] >= 0) {
	    let i = index[hand];
            balls[i].pos = pos[hand];
            server.broadcastGlobalSlice('balls', i, i+1);
         }

      for (let i = 0 ; i < balls.length ; i++)
         model.child(i).identity().move(balls[i].pos).scale(radius * (balls[i].busy ? .7 : 1));
   });
}


