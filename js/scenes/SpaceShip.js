import * as global from "../global.js";
import { quat } from "../render/math/gl-matrix.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";
import { joyStickState } from "../render/core/controllerInput.js";
import * as croquet from "../util/croquetlib.js";

export let updateModel = e => {
   if (window.demoDemoCroquetState) {
      // Removed for clarity
   }
}

export const init = async model => {
   croquet.register('croquetDemo_1.0');
   model.setRoom(false);
   model.setTable(false);


    let gltf1 = new Gltf2Node({ url: './media/gltf/SpaceShip/scene.gltf' });
    let rotation1 = quat.create();
    let sceneRotation = quat.create();

   gltf1.translation = [0, -1, 0];

   global.gltfRoot.addNode(gltf1);
   model.animate(() => {
      global.gltfRoot.rotation = sceneRotation; // Apply the scene rotation to the root node
      gltf1.rotation = rotation1;
   });
}

