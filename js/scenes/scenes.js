import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: true,
      scenes: [
         { name: "bbCoaching"         , path: "./bbCoaching.js"       },
          /*
         { name: "DemoSimplest"       , path: "./demoSimplest.js"       },
         { name: "DemoShapes"         , path: "./demoShapes.js"         },
         { name: "DemoRobot"          , path: "./demoRobot.js"          },
         { name: "DemoControllers"    , path: "./demoControllers.js"    },
         { name: "DemoControllerBeam" , path: "./demoControllerBeam.js" },
         { name: "DemoCanvas"         , path: "./demoCanvas.js"         },
         { name: "DemoTwoCubes"       , path: "./demoTwoCubes.js"       },
         { name: "DemoTrianglesMesh"  , path: "./demoTrianglesMesh.js"  },
         { name: "DemoOpacity"        , path: "./demoOpacity.js"        },
         { name: "DemoHUD"            , path: "./demoHUD.js"            },
         { name: "DemoHands"          , path: "./demoHands.js"          },
         { name: "DemoShader"         , path: "./demoShader.js"         },
         { name: "DemoTerrain"        , path: "./demoTerrain.js"        },
         { name: "DemoRayTrace"       , path: "./demoRayTrace.js"       },
         { name: "DemoAudio"          , path: "./demoAudio.js"          },
         { name: "DemoWire"           , path: "./demoWire.js"           },
         { name: "DemoBlending"       , path: "./demoBlending.js"       },
         { name: "DemoParticles"      , path: "./demoParticles.js"      },
         { name: "DemoGLTF"           , path: "./demoGLTF.js"           },
         { name: "DemoSprite"         , path: "./demoSprite.js"         },
         { name: "DemoIntersect"      , path: "./demoIntersect.js"      },
           */
      ]
   };
}

