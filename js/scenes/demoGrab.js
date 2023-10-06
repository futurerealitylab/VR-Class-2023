import * as cg from "../render/core/cg.js";
import { InputEvents } from "../render/core/inputEvents.js";

let Ball = function(p) {
   this.pos = p;
   this.state = 'free';
}

let radius = 0.05;

window.balls = [];
for (let i = 0 ; i < 4 ; i++) {
   let theta = 2 * Math.PI * i / 4;
   let c = 4 * radius * Math.cos(theta);
   let s = 4 * radius * Math.sin(theta);
   balls.push(new Ball([ s, 1.5 + c, .7 ]));
}
for (let i = 4 ; i < 100 ; i++) {
   balls.push(new Ball([0,0,0]));
   balls[balls.length-1].state = 'unused';
}

export const init = async model => {

   let inputEvents = new InputEvents(model);

   let ballIndex = { left: -1, right: -1 };

   let findBall = hand => {
      let dMin = 10000, iMin = -1;
      for (let i = 0 ; i < balls.length ; i++)
         if (balls[i].state == 'free') {
            let d = cg.distance(inputEvents.pos(hand), balls[i].pos);
            if (d < dMin) {
               dMin = d;
               iMin = i;
            }
         }
      return dMin < 2 * radius ? iMin : -1;
   }

   inputEvents.onPress = hand => {
      let i = findBall(hand);
      if (i >= 0) {
         balls[i].state = 'busy';
         server.broadcastGlobalSlice('balls', i, i+1);
      }
      ballIndex[hand] = i;
   }

   inputEvents.onDrag = hand => {
      let i = ballIndex[hand];
      if (i >= 0) {
         balls[i].pos = cg.mix(balls[i].pos, inputEvents.pos(hand), .5);
         server.broadcastGlobalSlice('balls', i, i+1);
      }
   }

   inputEvents.onRelease = hand => {
      let i = ballIndex[hand];
      if (i >= 0) {
         balls[i].state = 'free';
         server.broadcastGlobalSlice('balls', i, i+1);
      }
   }

   inputEvents.onClick = hand => {
      let i = findBall(hand);
      if (i >= 0)                                // CLICK ON A BALL TO DELETE IT
         balls[i].state = 'unused';
      else                                       // CLICK ANYWHERE ELSE
         for (i = 0 ; i < balls.length ; i++)    // TO CREATE A NEW BALL
            if (balls[i].state == 'unused') {
               balls[i].state = 'free';
               balls[i].pos = inputEvents.pos(hand);
               break;
            }
      server.broadcastGlobalSlice('balls', i, i+1);
   }

   for (let i = 0 ; i < balls.length ; i++)
      model.add('sphere');

   model.animate(() => {
      balls = server.synchronize('balls');
      inputEvents.update();
      for (let i = 0 ; i < balls.length ; i++)
         if (balls[i].state == 'unused')
            model.child(i).scale(0);
         else
            model.child(i).identity().move(balls[i].pos).scale(radius * (balls[i].state == 'busy' ? .7 : 1));
   });
}


