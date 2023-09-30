/*****************************************************************

   This demo shows a way to incorporate GLTF models that were
   previously created in external modeling programs.

*****************************************************************/

import * as global from "../global.js";
import { quat } from "../render/math/gl-matrix.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";
import { buddha } from "./scenes.js";

export const init = async model => {
/*
    let gltf = new Gltf2Node({ url: './media/gltf/buddha_statue_broken/scene.gltf' });
    //gltf.translation = [0, .70, .7];
    gltf.translation = [0, 1.50, 0];
    gltf.scale = [1.3,1.3,1.3];
    global.gltfRoot.addNode(gltf);
*/

    buddha.translation = [0, .70, .7];
    buddha.scale = [1.3,1.3,1.3];
    global.gltfRoot.addNode(buddha);

    model.animate(() => {
    });
 }

