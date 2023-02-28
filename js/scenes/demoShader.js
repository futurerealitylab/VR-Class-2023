/*
	This demo shows you how to procedurally texture
	just one object in your scene.

	The key is to declare a flag 'uTextured' in your
	fragment shader, which is set to 1 only for the
	object to be textured, and is otherwise set to 0.
*/
export const init = async model => {
   model.setTable(false);

   let box = model.add('cube');

   model.animate(() => {
      box.flag('uNoiseTexture');
      model.customShader(`
         uniform int uNoiseTexture;
         --------------------------
         if (uNoiseTexture == 1)
            color *= .5 + noise(3. * vAPos);
      `);
      box.identity().move(0,1.6,0)
                    .turnY(model.time)
		    .turnX(model.time)
		    .scale(.1);
   });
}

