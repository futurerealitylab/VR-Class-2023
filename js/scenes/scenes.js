import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: false,
      scenes: [ 
         // { name: "DemoSimplest"       , path: "./demoSimplest.js"       },
         // { name: "DemoShapes"         , path: "./demoShapes.js"         },
         // { name: "DemoRobot"          , path: "./demoRobot.js"          },
         // { name: "DemoControllers"    , path: "./demoControllers.js"    },
         // { name: "DemoControllerBeam" , path: "./demoControllerBeam.js" },
         // { name: "DemoCanvas"         , path: "./demoCanvas.js"         },
         // { name: "DemoTwoCubes"       , path: "./demoTwoCubes.js"       },
         // { name: "DemoTrianglesMesh"  , path: "./demoTrianglesMesh.js"  },
         // { name: "DemoOpacity"        , path: "./demoOpacity.js"        },
         // { name: "DemoHUD"            , path: "./demoHUD.js"            },
         // { name: "DemoHands"          , path: "./demoHands.js"          },
         // { name: "DemoShader"         , path: "./demoShader.js"         },
         // { name: "DemoTerrain"        , path: "./demoTerrain.js"        },
         // { name: "DemoRayTrace"       , path: "./demoRayTrace.js"       },
         // { name: "DemoAudio"          , path: "./demoAudio.js"          },
         // { name: "DemoWire"           , path: "./demoWire.js"           },
         // { name: "DemoBlending"       , path: "./demoBlending.js"       },
         // { name: "DemoParticles"      , path: "./demoParticles.js"      },
         // { name: "DemoGLTF"           , path: "./demoGLTF.js"           },
         // { name: "DemoSprite"         , path: "./demoSprite.js"         },
         // { name: "DemoIntersect"      , path: "./demoIntersect.js"      },
         // { name: "DemoCroquet"        , path: "./demoCroquet.js"      },
         { name: "seaPrimitive"  , path: "./seaPrimitive.js"  },
         { name: "seaCroquet"  , path: "./seaCroquet.js"  },
         // { name: "seaPrimitive2"  , path: "./seaPrimitive2.js"  },
         // { name: "seaPrimitive4"  , path: "./seaPrimitive4.js"  },
         // { name: "seaPrimitive3"  , path: "./seaPrimitive3.js"  },
      ]
   };
}

