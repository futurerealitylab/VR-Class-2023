/*
	This demo shows how to create a time-varying terrain.

	Use call clay.createGrid() to make a mesh which is a grid of custom size.
	Then we call clay.defineMesh() to give that mesh a type name.
	We then instance our mesh by calling model.add(<typename>)

	When we animate the mesh, we call obj.setVertices(), which
	lets us map (u,v) to [x,y,z].

	The computation of the correct surface normals is done automatically
	for us inside the obj.setVertices() function.
*/

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

