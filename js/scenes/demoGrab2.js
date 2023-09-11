import * as cg from "../render/core/cg.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";

if (! window.server)
   window.server = new Server();

let Grab = function(p) {
   this.constructorName = this.constructor.name;
   this.position  = p;
   this.isGrabbed = false;
}

window.grabState = [];
for (let i = 0 ; i < 3 ; i++)
   grabState.push(new Grab([ .2*i-.2, 1, .7 ]));

export const init = async model => {

   let radius = 0.05, n = -1;
   for (let i = 0 ; i < grabState.length ; i++)
      model.add('sphere').color(i==0 ? 'red' : i==1 ? 'white' : 'blue');

   model.animate(() => {

      grabState = server.synchronize('grabState');

      let release = () => {
         if (n >= 0) {
	    grabState[n].isGrabbed = false;
            server.broadcastGlobalSlice('grabState', n, n + 1);
         }
	 n = -1;
      }
      let isPress = false, hand = null;
      switch (controllerEventType()) {
      case 'leftTriggerPress'   : hand = 'left' ; isPress = true; break;
      case 'rightTriggerPress'  : hand = 'right'; isPress = true; break;
      case 'leftTriggerDrag'    : hand = 'left' ; break;
      case 'rightTriggerDrag'   : hand = 'right'; break;
      case 'leftTriggerRelease' : release(); break;
      case 'rightTriggerRelease': release(); break;
      }
      if (hand) {
         let p = cg.mMultiply(controllerMatrix[hand], cg.mInverse(model.getMatrix())).slice(12, 15);
         if (n < 0 && isPress)
	    for (let i = 0 ; i < model.nChildren() ; i++) {
	       if (! grabState[i].isGrabbed && cg.distance(p, grabState[i].position) <= radius) {
	          n = i;
		  grabState[i].isGrabbed = true;
		  break;
               }
            }
         if (n >= 0) {
            grabState[n].position = p;
            server.broadcastGlobalSlice('grabState', n, n+1);
         }
      }

      for (let i = 0 ; i < model.nChildren() ; i++)
         model.child(i).identity().move(grabState[i].position).scale(s * radius);
   });
}


