/*
   This demo shows how objects can "melt" into each other
   to create blended shapes.

   As long as the object is melted, a new polyhedral mesh
   will be created at every animation frame.

   Once you hit the 'r' option to "rubberize" it, the model
   will become a fixed polyhedral mesh. However, because
   the two underlying spheres are still animating, the
   mesh will stretch like rubber, since each vertex
   animates as a weighted blend of those two spheres.
*/
export const init = async model => {
   let isAnimate = false, isRubber = false, t = 0;

   model.control('a', 'animate', () => isAnimate = ! isAnimate);
   model.control('r', 'rubber' , () => isRubber  = ! isRubber );

   model.move(0,1.5,0).scale(.3).blend(true);
   let shape1 = model.add('sphere').color(1,0,0);
   let shape2 = model.add('cube').bevel(true);

   model.animate(() => {
      model.melt(isAnimate && ! isRubber);
      t += isAnimate ? model.deltaTime : 0;
      let s = 1 + .3 * Math.sin(t);
      shape1.identity().move(-s,0,0);
      shape2.identity().move( s,0,0);
   });
}
