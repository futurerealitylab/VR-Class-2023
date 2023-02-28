import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: true,
      scenes: [ 
         { name: "hw4", path: "./hw4.js"},
         // { name: "DemoHUD"           , path: "./demoHUD.js"           },
         // { name: "DemoHands"         , path: "./demoHands.js"         },
         // { name: "DemoShader"        , path: "./demoShader.js"        },
         // { name: "DemoTerrain"       , path: "./demoTerrain.js"       },
         // { name: "hw1robot"     , path: "./hw1robot.js"     },
         // { name: "hw2controller"     , path: "./hw2controller.js"     },
         // { name: "hw3", path: "./hw3.js"},
         // { name: "DemoExample"       , path: "./demoExample.js"       },
         // { name: "DemoKP0"           , path: "./demoKP0.js"           },
         // { name: "DemoKP1"           , path: "./demoKP1.js"           },
         // { name: "DemoKP2"           , path: "./demoKP2.js"           },
         // { name: "DemoKP3"           , path: "./demoKP3.js"           },
         // { name: "DemoCanvas"        , path: "./demoCanvas.js"        },
         // { name: "DemoTwoCubes"      , path: "./demoTwoCubes.js"      },
         // { name: "DemoTrianglesMesh" , path: "./demoTrianglesMesh.js" },
         // { name: "DemoOpacity"       , path: "./demoOpacity.js"       },
      ]
   };
}

