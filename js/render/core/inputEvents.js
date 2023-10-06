import * as cg from "./cg.js";
import { controllerEventTypes, controllerMatrix } from "./controllerInput.js";

export function InputEvents(model) {
   this.onClick   = hand => { console.log('onClick', hand); }
   this.onPress   = hand => { console.log('onPress', hand); }
   this.onDrag    = (hand, elapsed) => { console.log('onDrag', hand, elapsed); }
   this.onRelease = (hand, elapsed) => { console.log('onRelease', hand, elapsed); }
   this.onMove    = (hand, elapsed) => { console.log('onMove', hand, elapsed); }

   let wasPinch = { left: false, right: false };
   let pinchUp  = { left: 100, right: 100 };
   let handInfo = { left: {pressTime:-1}, right: {pressTime:-1} };

   this.update = () => {
      let press = hand => {
         handInfo[hand].pressTime = model.time;
         this.onPress(hand);
      }

      let release = hand => {
         this.onRelease(hand, model.time - handInfo[hand].pressTime);
         if (model.time - handInfo[hand].pressTime < 0.5)
            this.onClick(hand);
         handInfo[hand].pressTime = -1;
      }

      pos = {};
      if (window.handtracking) {
         for (let hand in handInfo) {
	    pos[hand] = clay.handsWidget.getMatrix(hand,1,4).slice(12,15);
            let isPinch = clay.handsWidget.pinch[hand] == 1;
            if (isPinch && pinchUp[hand] > 1) press(hand);
            if (pinchUp[hand] == 0 && ! isPinch) release(hand);
            pinchUp[hand] = isPinch ? 0 : pinchUp[hand] + 1;
         }
      }
      else {
         for (let hand in handInfo)
            pos[hand] = cg.mTransform(controllerMatrix[hand], [hand=='left'?.01:-.01,-.05,-.05]);

         let eventTypes = controllerEventTypes();
         for (let i = 0 ; i < eventTypes.length ; i++)
            switch (eventTypes[i]) {
            case 'leftTriggerPress': press('left'); break;
            case 'rightTriggerPress': press('right'); break;
            case 'leftTriggerRelease': release('left'); break;
            case 'rightTriggerRelease': release('right'); break;
            }
      }

      for (let hand in handInfo)
         if (handInfo[hand].pressTime >= 0)
            this.onDrag(hand, model.time - handInfo[hand].pressTime);
         else
            this.onMove(hand, model.time - handInfo[hand].pressTime);

      let LT = handInfo.left.pressTime;
      let RT = handInfo.right.pressTime;
      if (LT > 0 && RT > 0 && model.time > LT + 3 && model.time > RT + 3) {
         let L = pos.left;
         let R = pos.right;
         if (Math.abs(L[1] - R[1]) < .01) {
            let X = cg.subtract(R, L);
            X = cg.normalize([X[0], 0, X[2]]);
            let Y = [0,1,0];
            let Z = cg.cross(X, Y);
            let T = cg.mix(L, R, .5);
            let M = [X[0],X[1],X[2],0, Y[0],Y[1],Y[2],0, Z[0],Z[1],Z[2],0, T[0],0,T[2],1];
	    model.setMatrix(M);
	    IM = cg.mInverse(M);
         }
      }
   }

   let pos = {};
   let IM = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
   this.pos = hand => cg.mTransform(IM, pos[hand]);
}

