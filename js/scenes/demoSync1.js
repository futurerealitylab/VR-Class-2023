import * as cg from "../render/core/cg.js";
import { InputEvents } from "../render/core/InputEvents.js";

/*
   	Now has interaction so that if user pinches both
	hands and holds them in place at approximately
	the same height for at least three seconds, the
	virtual world will shift to where the hands are:

	   X will go from left pinch to right pinch
	   Y will still go straight up
	   Z will be the cross product of X and Y
	   Origin X,Z will be centered between the pinches
	   Origin Y will not change
*/

if (! window.server)
   window.server = new Server();

window.sync = { left: false, right: false };

let setSync = (hand, value) => {
   sync[hand] = value;
   server.broadcastGlobal('sync');
}

let downTime = { left: 0, right: 0 };

let M = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

export const init = async model => {

   let inputEvents = new InputEvents(model);

   inputEvents.onPress = hand => {
      setSync(hand, true );
   }

   inputEvents.onRelease = hand => {
      setSync(hand, false);
      downTime[hand] = 0;
   }

   inputEvents.onDrag = (hand, elapsed) => {
      downTime[hand] = elapsed;
      if (downTime.left >= 3 && downTime.right >= 3) {
         let L = inputEvents.pos.left;
	 let R = inputEvents.pos.right;
	 if (Math.abs(L[1] - R[1]) < .01) {
	    let X = cg.subtract(R, L);
	    X = cg.normalize([X[0], 0, X[2]]);
	    let Y = [0,1,0];
	    let Z = cg.cross(X, Y);
	    let T = cg.mix(L, R, .5);
	    M = [X[0],X[1],X[2],0, Y[0],Y[1],Y[2],0, Z[0],Z[1],Z[2],0, T[0],0,T[2],1];
	 }
      }
   }

   let boxes = { left: model.add('cube'), right: model.add('cube') };

   model.animate(() => {
      sync = server.synchronize('sync');
      inputEvents.update();
      for (let hand in sync)
         boxes[hand].setMatrix(M)
	            .move(hand == 'left' ? -.1 : .1, 1.5, 0)
		    .scale(.05)
                    .color(sync[hand] ? 'red' : 'white');
   });
}

