import * as cg from "../render/core/cg.js";
import { controllerEventTypes, controllerMatrix } from "../render/core/controllerInput.js";

if (! window.server)
   window.server = new Server();

let Ball = function(p) {
   this.pos = p;
   this.busy = false;
}

window.balls = [];
for (let i = 0 ; i < 3 ; i++)
   balls.push(new Ball([ .2*i-.2, 1, .7 ]));

let ballColor = ['red', 'white', 'blue'];

export const init = async model => {

   let radius = 0.05, index = { left: -1, right: -1 };
   for (let i = 0 ; i < balls.length ; i++)
      model.add('sphere').color(ballColor[i]);

   model.animate(() => {

      balls = server.synchronize('balls');

      let pos = {};
      for (let hand in index)
         pos[hand] = cg.mMultiply(controllerMatrix[hand], cg.mInverse(model.getMatrix())).slice(12, 15);

      let press = hand => {
	 for (let i = 0 ; i < model.nChildren() ; i++)
	    if (! balls[i].busy && cg.distance(pos[hand], balls[i].pos) <= 2 * radius) {
	       index[hand] = i;
	       balls[i].busy = true;
	       break;
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

      for (let i = 0 ; i < model.nChildren() ; i++)
         model.child(i).identity().move(balls[i].pos).scale(radius);
   });
}


