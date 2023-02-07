import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: true,
      scenes: [ 
         { name: "DemoExample" , path: "./demoExample.js" },
         { name: "DemoKP0"     , path: "./demoKP0.js"     },
         { name: "DemoKP1"     , path: "./demoKP1.js"     },
         { name: "DemoKP2"     , path: "./demoKP2.js"     },
         { name: "DemoCanvas"  , path: "./demoCanvas.js"  },
      ]
   };
}
