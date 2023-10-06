import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export let buddha;

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   buddha = new Gltf2Node({ url: './media/gltf/buddha_statue_broken/scene.gltf' });

   return {
      enableSceneReloading: false,
      scenes: [ 
/*
         { name: "DemoAudio"          , path: "./demoAudio.js"          },
         { name: "DemoBlending"       , path: "./demoBlending.js"       },
         { name: "DemoCanvas"         , path: "./demoCanvas.js"         },
         { name: "DemoControllerBeam" , path: "./demoControllerBeam.js" },
         { name: "DemoControllers"    , path: "./demoControllers.js"    },
         { name: "DemoCroquet"        , path: "./demoCroquet.js"        },
         { name: "DemoCroquet1"       , path: "./demoCroquet1.js"       },
         { name: "DemoGLTF"           , path: "./demoGLTF.js"           },
         { name: "DemoHands"          , path: "./demoHands.js"          },
         { name: "DemoHUD"            , path: "./demoHUD.js"            },
         { name: "DemoIntersect"      , path: "./demoIntersect.js"      },
         { name: "DemoOpacity"        , path: "./demoOpacity.js"        },
         { name: "DemoParticles"      , path: "./demoParticles.js"      },
         { name: "DemoRayTrace"       , path: "./demoRayTrace.js"       },
         { name: "DemoRobot"          , path: "./demoRobot.js"          },
         { name: "DemoShader"         , path: "./demoShader.js"         },
         { name: "DemoShapes"         , path: "./demoShapes.js"         },
         { name: "DemoSimplest"       , path: "./demoSimplest.js"       },
         { name: "demoShared"         , path: "./demoShared.js"         },
         { name: "DemoSprite"         , path: "./demoSprite.js"         },
         { name: "DemoTerrain"        , path: "./demoTerrain.js"        },
         { name: "DemoTrianglesMesh"  , path: "./demoTrianglesMesh.js"  },
         { name: "DemoTwoCubes"       , path: "./demoTwoCubes.js"       },
         { name: "DemoWire"           , path: "./demoWire.js"           },
*/
         { name: "crayon"             , path: "./demoDraw3.js"          },
         { name: "grab"               , path: "./demoGrabA.js"          },
         { name: "statue"             , path: "./demoGLTF1.js"          },
         { name: "sync"               , path: "./demoSync.js"           },
         { name: "puzzle"             , path: "./demoPuzzle4.js"        },
      ]
   };
}

