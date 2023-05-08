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
   let moveSpeed = .05;
   let rotateSpeed = 1;


    let gltf1 = new Gltf2Node({ url: './media/gltf/SpaceShip/scene.gltf' });
    let rotation1 = quat.create();
    let sceneRotation = quat.create();

   gltf1.translation = [0, -1, 0];

   global.gltfRoot.addNode(gltf1);
   model.animate(() => {
      let lx = moveSpeed*joyStickState.left.x;
      let ly = moveSpeed*joyStickState.left.y;
      let rx = joyStickState.right.x;
      let ry = joyStickState.right.y;

      let Rx = sceneRotation[1];
      let Ry = sceneRotation[3];
      if(rx < 0){
         quat.rotateY(sceneRotation, sceneRotation, -rotateSpeed*0.05);
      }
      else if(rx > 0){
         quat.rotateY(sceneRotation, sceneRotation, rotateSpeed*0.05);
      }
      
      if(Math.abs(Rx) < .3){
         gltf1.translation[2] -= ly;
         gltf1.translation[0] -= lx;
      }
      else if(Math.abs(Rx) > .9){
         gltf1.translation[2] += ly;
         gltf1.translation[0] += lx;
      }
      else if(Rx*Ry <0){//left
         gltf1.translation[0] -= ly;
         gltf1.translation[2] += lx;
      }
      else{//right
         gltf1.translation[0] += ly;
         gltf1.translation[2] -= lx;
      }
 
      global.gltfRoot.rotation = sceneRotation; // Apply the scene rotation to the root node
      gltf1.rotation = rotation1;
   });
}