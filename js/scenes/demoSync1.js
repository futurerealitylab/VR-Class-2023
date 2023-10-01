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

export const init = async model => {

   let inputEvents = new InputEvents(model);
   inputEvents.onPress = hand => setSync(hand, true);
   inputEvents.onRelease = hand => setSync(hand, false);

   let boxes = {};
   for (let hand in sync)
      boxes[hand] = model.add('cube').move(hand == 'left' ? -.1 : .1, 1.5, 0).scale(.05);

   model.animate(() => {
      sync = server.synchronize('sync');
      inputEvents.update();
      for (let hand in sync)
         boxes[hand].color(sync[hand] ? 'red' : 'white');
   });
}

