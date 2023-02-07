/*
  This demo shows how you can make simple heads-up display (HUD)
  controls. The text labels will follow you as your roam around
  in the scene.

  When you are wearing your VR headset, you can point your controller
  beams as the lines of text, and they will change color. You can use
  this selection logic to start to build your own HUD controls.
*/
import { lcb, rcb } from '../handle_scenes.js';

export const init = async model => {
   let isAnimate = 0, isItalic = 0, isClear = 0;
   model.control('a', 'animate', () => isAnimate = ! isAnimate);
   model.control('c', 'clear'  , () => isClear   = ! isClear  );
   model.control('i', 'italic' , () => isItalic  = ! isItalic );

   let text = `Now is the time   \nfor all good men  \nto come to the aid\nof their party.   ` .split('\n');

   let label = model.add();

   for (let line = 0 ; line < text.length ; line++)
      label.add('label').move(0,-line,0).scale(.5);

   model.animate(() => {
      model.hud().scale(1);
      label.identity().scale(.02);
      label.flag('uTransparentTexture', isClear);
      for (let line = 0 ; line < text.length ; line++) {
         let obj = label.child(line);
         obj.info((isItalic ? '<i>' : '') + text[line])
	    .color(lcb.hitLabel(obj) ? [1,.5,.5] :
	           rcb.hitLabel(obj) ? [.3,1,1] : [1,1,1]);
      }
   });
}
