import * as cg from "../render/core/cg.js";
import { controllerEventType, controllerMatrix } from "../render/core/controllerInput.js";

if (! window.server)
   window.server = new Server();
window.grabState = [ -.2,1,.7,0, 0,1,.7,0, .2,1,.7,0 ];

export const init = async model => {

   let radius = 0.05, n = -1;
   for (let i = 0 ; i < 3 ; i++)
      model.add('sphere').color(i==0 ? 'red' : i==1 ? 'white' : 'blue');

   model.animate(() => {

      grabState = server.synchronize('grabState');

      let release = () => {
         if (n >= 0) {
	    grabState[4*n + 3] = 0;
            server.broadcastGlobalSlice('grabState', 4*n + 3, 4*n + 4);
         }
	 n = -1;
      }
      let grabbing = false, hand = null;
      switch (controllerEventType()) {
      case 'leftTriggerPress'   : hand = 'left' ; grabbing = true; break;
      case 'rightTriggerPress'  : hand = 'right'; grabbing = true; break;
      case 'leftTriggerDrag'    : hand = 'left' ; break;
      case 'rightTriggerDrag'   : hand = 'right'; break;
      case 'leftTriggerRelease' : release(); break;
      case 'rightTriggerRelease': release(); break;
      }
      if (hand) {
         let p = cg.mMultiply(controllerMatrix[hand], cg.mInverse(model.getMatrix())).slice(12, 15);
         if (grabbing)
	    for (let i = 0 ; i < model.nChildren() ; i++) {
	       let s = grabState.slice(4*i, 4*i+4);
	       if (s[3] == 0 && cg.distance(p, s.slice(0,3)) <= radius) {
	          n = i;
		  grabState[4*i+3] = 1;
		  break;
               }
            }
         if (n >= 0) {
            for (let j = 0 ; j < 3 ; j++)
               grabState[4*n+j] = p[j];
            server.broadcastGlobalSlice('grabState', 4*n, 4*n+4);
         }
      }

      for (let i = 0 ; i < model.nChildren() ; i++)
         model.child(i).identity().move(grabState.slice(4*i, 4*i+3)).scale(radius);
   });
}

