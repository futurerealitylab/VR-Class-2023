"use strict";
const buttonNum = 7;
import { corelink_event } from "../../util/corelink_sender.js";
import * as cg from "./cg.js";

const debug = false;

function console_log(content) {
  if(debug) {
      console.log(content);
  }
}

export let viewMatrix = [], time = 0;
window.isPressed = false;
window.isDragged = false;
window.isReleased = true;

export let controllerMatrix = { left: [], right: [] };
export let buttonState = { left: [], right: [] };
export let joyStickState = { left: {x: 0, y: 0}, right: {x: 0, y: 0} };

for (let i = 0; i < buttonNum; i++) 
  buttonState.left[i] = buttonState.right[i] = {pressed: false, touched: false, value: 0};

const validHandedness = ["left", "right"];
window.initxr = false;

export let updateController = (avatar, buttonInfo) => {
  controllerMatrix.left = avatar.leftController.matrix;
  controllerMatrix.right = avatar.rightController.matrix;

  if (validHandedness.includes(buttonInfo.handedness)) {
    // console.log(buttonInfo.buttons)
    let h = buttonInfo.handedness;
    let b = buttonInfo.buttons;
    let a = buttonInfo.axes;

    for (let i = 0; i < buttonNum; i++) {
      // Update
      buttonState[h][i] = b[i];
      joyStickState[h] = {x: a[2], y: a[3]};
    }
  }
};

export let onPress = (hand, button) => {
  console_log("onPress:", hand, "controller, button", button);
  window.isPressed = true;
  window.isReleased = false;
  window.isDragged = false;
  //ZH
  // console_log("handleSelect");
  // corelink_event({ it: "lefttrigger", op: "press" });
};

export let onDrag = (hand, button) => {
  console_log("onDrag:", hand, "controller, button", button);
  window.isDragged = true;
  window.isReleased = false;
  window.isPressed = false;
};

export let onRelease = (hand, button) => {
  console_log("onRelease", hand, "controller, button", button);
  window.isReleased = true;
  window.isPressed = false;
  window.isDragged = false;

  //ZH
  // console_log("handleSelect");
  // corelink_event({ it: "lefttrigger", op: "release" });
};

export let getViews = (views) => {
  viewMatrix = [];
  for (let view of views) viewMatrix.push(view.viewMatrix);
};

export function ControllerBeam(model, hand) {
   this.isEnabled = true;
   this.hand = hand;
   let bend = Math.PI/4;
   this.beam = model.add();
   this.beam.add('tubeZ').color(10,0,0).turnX(-bend)
                                       .move(0,0,-10.01)
                                       .scale(.001,.001,10);
   this.update = matrix => {
      if (! this.isEnabled) {
         this.beam.setMatrix(cg.mScale(0));
         return;
      }
      let m = matrix ? matrix : controllerMatrix[hand],
          update = (offset, fallback) =>
             this.beam.setMatrix(
                this.m = m.length ? cg.mMultiply(m, cg.mTranslate(offset))
                                  : cg.mTranslate(fallback));
      if (hand == 'left' ) update(matrix ? [ .005,.01,-.03] : [ .0060,.014,0], [-.2,0,0]);
      if (hand == 'right') update(matrix ? [-.005,.01,-.03] : [-.0015,.014,0], [ .2,0,0]);
   }
   this.beamMatrix = () => cg.mMultiply(this.m, cg.mRotateX(-bend));
   this.hitRect = m => this.isEnabled ? cg.mHitRect(this.beamMatrix(), m) : null;
   this.projectOntoBeam = P => {
      let bm = this.beamMatrix();	// get controller beam matrix
      let o = bm.slice(12, 15);		// get origin of beam
      let z = bm.slice( 8, 11);		// get z axis of beam
      let p = cg.subtract(P, o);	// shift point to be relative to beam origin
      let d = cg.dot(p, z);		// compute distance of point projected onto beam
      let q = cg.scale(z, d);		// find point along beam at that distance
      return cg.add(o, q);		// shift back to global space
   }
   this.hitLabel = label =>
      this.hitRect(cg.mMultiply(label.getGlobalMatrix(),
                                cg.mScale(label.getInfo().length/2,1,1)));
}

let buttonNames = [ 'Trigger', 'Thumb' ];
let buttonPress = { left: [], right: [] };
for (let hand in buttonPress)
for (let button = 0 ; button < buttonNames.length ; button++)
   buttonPress[hand].push(false);

export let controllerEventTypes = () => {
   let eventTypes = [];
   for (let hand in buttonPress)
   for (let button = 0 ; button < buttonNames.length ; button++)
      if (buttonState[hand][button]) {
         let prefix = hand + buttonNames[button];
         let wasDown = buttonPress[hand][button];
         let isDown  = buttonState[hand][button].pressed;
         if (isDown && ! wasDown) eventTypes.push(prefix + 'Press'  );
         if (      isDown       ) eventTypes.push(prefix + 'Drag'   );
         if (wasDown && ! isDown) eventTypes.push(prefix + 'Release');
         buttonPress[hand][button] = isDown;
      }
   return eventTypes;
}

let isL0Down, isR0Down, isL1Down, isR1Down;
let wasL0Down, wasR0Down, wasL1Down, wasR1Down;

export let controllerEventType = () => {
   let what = null;

   if (isL0Down = buttonState.left[0].pressed)
      what = ! wasL0Down ? 'leftTriggerPress' : 'leftTriggerDrag';
   else if (wasL0Down)
      what = 'leftTriggerRelease';
   wasL0Down = isL0Down;
   if (what) return what;

   if (isR0Down = buttonState.right[0].pressed)
      what = ! wasR0Down ? 'rightTriggerPress' : 'rightTriggerDrag';
   else if (wasR0Down)
      what = 'rightTriggerRelease';
   wasR0Down = isR0Down;
   if (what) return what;

   if (isL1Down = buttonState.left[1].pressed)
      what = ! wasL1Down ? 'leftThumbPress' : 'leftThumbDrag';
   else if (wasL1Down)
      what = 'leftThumbRelease';
   wasL1Down = isL1Down;
   if (what) return what;

   if (isR1Down = buttonState.right[1].pressed)
      what = ! wasR1Down ? 'rightThumbPress' : 'rightThumbDrag';
   else if (wasR1Down)
      what = 'rightThumbRelease';
   wasR1Down = isR1Down;
   if (what) return what;

   return null;
}

