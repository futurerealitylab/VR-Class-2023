import * as cg from "./cg.js";
import { controllerEventTypes, controllerMatrix } from "./controllerInput.js";

export function InputEvents(model) {
   this.onClick   = hand => { console.log('onClick', hand); }
   this.onPress   = hand => { console.log('onPress', hand); }
   this.onDrag    = (hand, elapsed) => { console.log('onDrag', hand, elapsed); }
   this.onRelease = (hand, elapsed) => { console.log('onRelease', hand, elapsed); }

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

      this.pos = {};
      if (window.handtracking) {
         for (let hand in handInfo) {
	    this.pos[hand] = clay.handsWidget.getMatrix(hand,1,4).slice(12,15);
            let isPinch = clay.handsWidget.pinch[hand] == 1;
/*
            if (isPinch && ! wasPinch[hand]) press(hand);
            if (wasPinch[hand] && ! isPinch) release(hand);
            wasPinch[hand] = isPinch;
*/
            if (isPinch && pinchUp[hand] > 1) press(hand);
            if (pinchUp[hand] == 0 && ! isPinch) release(hand);
            pinchUp[hand] = isPinch ? 0 : pinchUp[hand] + 1;
         }
      }
      else {
         for (let hand in handInfo)
            this.pos[hand] = cg.mTransform(cg.mMultiply(controllerMatrix[hand],
                                                        cg.mInverse(model.getMatrix())),
                                                        [hand=='left'?.01:-.01,-.05,-.05]);
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
   }
}

