import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: false,
      scenes: [ 
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
         { name: "DemoWire1"          , path: "./demoWire1.js"          },
         { name: "DemoWire2"          , path: "./demoWire2.js"          },
         { name: "DemoWire3"          , path: "./demoWire3.js"          },
         { name: "DemoWire4"          , path: "./demoWire4.js"          },
         { name: "DemoWire5"          , path: "./demoWire5.js"          },
         { name: "DemoWire6"          , path: "./demoWire6.js"          },
         { name: "DemoWire7"          , path: "./demoWire7.js"          },
         { name: "DemoWire8"          , path: "./demoWire8.js"          },
         { name: "DemoWire9"          , path: "./demoWire9.js"          },
         { name: "DemoWirea"          , path: "./demoWirea.js"          },
         { name: "DemoWireb"          , path: "./demoWireb.js"          },
         { name: "DemoWirec"          , path: "./demoWirec.js"          },
         { name: "DemoWired"          , path: "./demoWired.js"          },
         { name: "DemoWiree"          , path: "./demoWiree.js"          },
         { name: "DemoWiref"          , path: "./demoWiref.js"          },
         { name: "DemoWireg"          , path: "./demoWireg.js"          },
         { name: "DemoWireh"          , path: "./demoWireh.js"          },
         { name: "DemoWirei"          , path: "./demoWirei.js"          },
*/
         { name: "crayon"             , path: "./demoWirej.js"          },
/*
         { name: "DemoBlending"       , path: "./demoBlending.js"       },
         { name: "DemoParticles"      , path: "./demoParticles.js"      },
         { name: "DemoGLTF"           , path: "./demoGLTF.js"           },
         { name: "DemoSprite"         , path: "./demoSprite.js"         },
         { name: "DemoIntersect"      , path: "./demoIntersect.js"      },
         { name: "DemoCroquet"        , path: "./demoCroquet.js"        },
         { name: "DemoCroquet1"       , path: "./demoCroquet1.js"       },
*/
      ]
   };
}

