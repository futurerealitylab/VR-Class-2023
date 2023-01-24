import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

export const init = async model => {
   let cube = model.add('cube');
   model.move(0,1.5,0).scale(.3).animate(() => {
      cube.identity().scale(.5);
   });
}

