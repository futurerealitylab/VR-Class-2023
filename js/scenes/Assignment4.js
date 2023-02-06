import { g2 } from "../util/g2.js";
import { lcb, rcb } from '../handle_scenes.js';
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import * as cg from "../render/core/cg.js";

// This demo shows how you can add heads-up display (HUD) objects.

export const init = async model => {

   g2.textHeight(.1);
   let hour = null;
   let minute = null;
   let winFrames = 100;
   let win = false;
   let targetHour = Math.floor(Math.random()* 12);
   let targetMinute = Math.floor(Math.random()* 6) * 10;

   let blocks = [];
   for (let i = 0; i < 12; i++){
      let block = model.add("cube").move(
         Math.sin(2*Math.PI*(-(i+1)/12)),
         1,
         Math.cos(2*Math.PI*(-(i+1)/12 )) + 1.2,
      ).turnY(0)
      blocks.push(block)
   }

   blocks[0].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`1`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[1].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`2`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[2].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`3`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[3].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`4`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[4].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`5`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[5].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`6`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[6].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`7`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)


   blocks[7].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`8`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[8].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`9`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[9].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`10`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[10].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`11`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)

   blocks[11].texture(() => {
      g2.setColor("white");
      g2.fillRect(0, 0, 1, 1);
      g2.setColor('black');
      g2.textHeight(.5);
      g2.fillText(`12`, 0.5, 0.5, 'center', 0);
   }).scale(0.1, 0.1, 0.1)


   const setNextTime = () => {
      targetHour = Math.floor(Math.random()* 12);
      targetMinute = Math.floor(Math.random()* 6) * 10;
   }

   let timeHUD = model.add('cube').texture(() => {
      g2.setColor('black');
      g2.textHeight(.1);
      if (win) {
         g2.textHeight(.08);
         g2.fillText(`Gret Job! \n You correctly set the time to: \n ${targetHour}:${targetMinute}`, 0.5, 0.5, "center");
      } else {
         g2.fillText(`Set the time to: \n ${targetHour}:${targetMinute}`, 0.5, 0.5, "center");
      }
   });

   let clockHud = model.add('cube').texture(() => {
      // g2.context.translate(x2c(x),y2c(1-y));
      // g2.scale(w,h);
      g2.setColor('black');
      g2.fillOval(0,0,1,1);
      g2.setColor('white');
      g2.fillOval(.01,.01,.98,.98);
      g2.textHeight(0.1)
      g2.setColor('black');
      let c = t => Math.cos(2 * Math.PI * t);
      let s = t => Math.sin(2 * Math.PI * t);
      for (let n = 1 ; n <= 12 ; n++) {
         g2.fillText('' + n, .5 + .43 * s(n/12), .5 + .42 * c(n/12), 'center');
      }

      let clockHand = (w,t,r) => {
         g2.lineWidth(w);
         g2.arrow([.5,.5], [.5 + r * s(t), .5 + r * c(t) ]);
      }

      if (hour !== null) {
         clockHand(.037, hour / 12, .25);
      }

      if (minute !== null) {
         clockHand(.028, (minute / 60), .32);
      }
   }); // HUD object.

   model.setTable(false);
   model.animate(() => {
      clockHud.hud().scale(.2,.2,.0001);
      timeHUD.hud().move(0, 0.7, 0).scale(.5,.5,.0001);
      for (let i = 0; i < 12; i++) {
         const center = blocks[i].getGlobalMatrix().slice(12, 15)
         
         const lPoint = lcb.projectOntoBeam(center);
         const lDiff = cg.subtract(lPoint, center);
         const lHit = cg.norm(lDiff) < 0.1;
         const lt = buttonState.left[0].pressed;

         const rPoint = rcb.projectOntoBeam(center);
         const rDiff = cg.subtract(rPoint, center);
         const rHit = cg.norm(rDiff) < 0.1;
         const rt = buttonState.right[0].pressed;

         if (!win && lt && lHit){
            hour = (i + 1) % 12
         }
         if (!win && rt && rHit){
            minute = ((i + 1) * 5) % 60
         }
      }

      if (hour === targetHour && minute === targetMinute) {
         win = true;
      }

      if (win && winFrames > 0){
         winFrames -= 1;
      } else if (win) {
         winFrames = 100;
         win = false;
         setNextTime();
      }


   });
}
