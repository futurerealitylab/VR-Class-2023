// Demo showing how to create a time-varying terrain.

import * as cg from "../render/core/cg.js";

export const init = async model => {
   clay.defineMesh('myTerrain', clay.createGrid(30, 30));
   let terrain = model.add('myTerrain').color(0,.5,1).opacity(.7);
   model.animate(() => {
      terrain.identity().move(0,1.5,0).turnX(-.3 * Math.PI).scale(.4);
      terrain.setVertices((u,v) => {
         return [2*u-1,2*v-1,.4 * cg.noise(3*u-model.time,3*v,model.time)];
      });
   });
}

