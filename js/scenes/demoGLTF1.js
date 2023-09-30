/*****************************************************************

   This demo shows a way to incorporate GLTF models that were
   previously created in external modeling programs.

*****************************************************************/

import * as global from "../global.js";
import { quat } from "../render/math/gl-matrix.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";
import { buddha } from "./scenes.js";

export const init = async model => {
    buddha.translation = [0, .70, 0];
    buddha.scale = [1.3,1.3,1.3];
    global.gltfRoot.addNode(buddha);

    model.animate(() => {
    });
 }

