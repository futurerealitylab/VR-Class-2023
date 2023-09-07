import * as cg from "../render/core/cg.js";

/*****************************************************************

   Demo of animated wire, with extra shading.

*****************************************************************/

export const init = async model => {
   let N = (t,a,b,c,d) => cg.noise(a * t, b * t, c * t + d * model.time);
   let f = t => [ N(t,3,3.3,3.6,.3), N(t,3.3,3.6,3,.25), N(t,3.6,3,3.3,.2) ];
   let wire = model.add();
   model.animate(() => {
      model.remove(wire);
      wire = model.add(clay.wire(200,8)).move(0,1.6,0).scale(.5);

      wire.flag('uWireTexture');
      model.customShader(`
         uniform int uWireTexture;
         --------------------------
         if (uWireTexture == 1) {
            float t = noise(70. * vAPos + 5. * vec3(0.,0.,uTime));
            opacity = 30. * pow(.5 + t, 9.);
	    color.g *= .01 * opacity;
         }
      `);

      clay.animateWire(wire, .015, f);
   });
}

