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
   this.hand = hand;
   let bend = Math.PI/4;
   this.beam = model.add();
   this.beam.add('tubeZ').color(10,0,0).turnX(-bend)
                                       .move(0,0,-10.01)
                                       .scale(.001,.001,10);
   this.update = matrix => {
      let m = matrix ? matrix : controllerMatrix[hand],
          update = (offset, fallback) =>
             this.beam.setMatrix(
                this.m = m.length ? cg.mMultiply(m, cg.mTranslate(offset))
                                  : cg.mTranslate(fallback));
      if (hand == 'left' ) update(matrix ? [ .005,.01,-.03] : [ .0060,.014,0], [-.2,0,0]);
      if (hand == 'right') update(matrix ? [-.005,.01,-.03] : [-.0015,.014,0], [ .2,0,0]);
   }
   this.hitRect = m => cg.mHitRect(cg.mMultiply(this.m, cg.mRotateX(-bend)), m);
   this.hitLabel = label =>
      this.hitRect(cg.mMultiply(label.getGlobalMatrix(),
                                cg.mScale(label.getInfo().length/2,1,1)));
}

