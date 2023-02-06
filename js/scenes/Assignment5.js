import * as cg from "../render/core/cg.js";
import { g2 } from "../util/g2.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

/*********************************************************************************

This demo shows how you can do basic object manipulation with your controllers.


(1) Moving an object

    When you place your left controller inside the can, the can turns pink.

    Then when you squeeze the left trigger,
    the can turns red and moves together with your controller.


(2) Moving and rotating an object

    When you place your right controller inside the can, the can turns light blue.

    Then when you squeeze the right trigger,
    the can turns blue and both moves and rotates together with your controller.

*********************************************************************************/

let spray = new Audio('../../media/sound/spray.mp3');

let leftTriggerPrev = false;
let rightTriggerPrev = false;

let redMP  = cg.mTranslate(-0.3, 1.2, 1.1);
let blueMP = cg.mTranslate(0, 1.5, 1.1);
let greenMP = cg.mTranslate(.3, 1.2, 1.1);

let redNegMP  = cg.mTranslate(-0.3, 0.7, 1.1);
let blueNegMP = cg.mTranslate(0, 0.5, 1.1);
let greenNegMP = cg.mTranslate(.3, 0.7, 1.1);


let MP = cg.mTranslate(0,1,.5);
let A = [0,0,0];
let MA = cg.mIdentity();


let redPercent = 0;
let greenPercent = 0;
let bluePercent = 0;

let rightHasCan = false;
let leftHasCan = false;

let draw = false;

let wires = []
let wirePaths = []

export const init = async model => {

   // CREATE THE BOX.

  let redPlus = model.add().color(1,0,0);
  redPlus.add("cube").scale(1, 0.3, 0.3)
  redPlus.add("cube").scale(0.3, 1, 0.3)

  let greenPlus = model.add().color(0,1,0);
  greenPlus.add("cube").scale(1, 0.3, 0.3)
  greenPlus.add("cube").scale(0.3, 1, 0.3)

  let bluePlus = model.add().color(0,0,1);
  bluePlus.add("cube").scale(1, 0.3, 0.3)
  bluePlus.add("cube").scale(0.3, 1, 0.3)

//    let newCube = model.add('cube').color(0.7,0.7,0.7);

  let redNeg = model.add().color(1,0,0);
  redNeg.add("cube").scale(1, 0.3, 0.3)
  
  let greenNeg = model.add().color(0,1,0);
  greenNeg.add("cube").scale(1, 0.3, 0.3)

  let blueNeg = model.add().color(0,0,1);
  blueNeg.add("cube").scale(1, 0.3, 0.3)

  let can = model.add();
  can.add("tubeY").scale(0.4, 1, 0.4)


  let grafitiCanvas = model.add('cube').texture(() => {
    g2.setColor('white');
    g2.fillRect(.1,0,1,1);
    g2.setColor('black');
    g2.fillText('Grafiti Canvas', .5, .9, 'center');
    g2.drawWidgets(grafitiCanvas);

    if (buttonState.right[1].pressed  && !draw){ //|| g2.mouseState() == 'press'
      grafitiCanvas.paths.push({
        color: [redPercent, greenPercent, bluePercent],
        paths: [],
      })
      draw = true;
    } else if (!buttonState.right[1].pressed && draw) { //|| g2.mouseState() == 'release'
      draw = false;
    }

    // rightHasCan = true
    // if (g2.mouseState() == 'press'){
    //   draw = true
    // } 
    
    // if (g2.mouseState() == 'release') {
    //   draw = false
    // }

    if ((rightHasCan || leftHasCan) && draw) {
      if (grafitiCanvas.paths.length === 0){
        grafitiCanvas.paths.push({
          color: [redPercent, greenPercent, bluePercent],
          paths: [],
        })
      }
      let uvz = g2.getUVZ(grafitiCanvas)
      if (uvz && uvz[0]>.1 && uvz[0]<.9 && g2.mouseState() == 'drag'){
        spray.play()
        grafitiCanvas.paths[grafitiCanvas.paths.length-1].paths.push(uvz);
      }
    }


    // Draw the lines
    for (let i = 0; i < grafitiCanvas.paths.length; i++){
      g2.setColor(grafitiCanvas.paths[i].color);
      g2.lineWidth(.02);
      g2.drawPath(grafitiCanvas.paths[i].paths);
    }
 });
 grafitiCanvas.paths = [];
 g2.addWidget(grafitiCanvas, 'button', .5, .1, '#ff8080', 'Wireify', () => { 
  for (let i = 0; i < grafitiCanvas.paths.length; i++){
    let wire = model.add(clay.wire(10,8)).move(0,1.6,0).scale(.5).color(grafitiCanvas.paths[i].color);
    // wires.push(wire)
    // wirePaths.push(grafitiCanvas.paths[i].paths);

    let new_path = []
    for (let j = 0; j < grafitiCanvas.paths[i].paths.length; j += 10){
      let step = grafitiCanvas.paths[i].paths[j]
      new_path.push([step[0], step[1]])
    }
    wires = [wire]
    wirePaths = [new_path]
  }

  grafitiCanvas.paths = []; 
});


   // FUNCTION TO RETURN TRUE IF A POINT IS INSIDE THE BOX, OTHERWISE FALSE.

  let isInBox = (p, b) => {
    // FIRST TRANSFORM THE POINT BY THE INVERSE OF THE BOX'S MATRIX.
    let q = cg.mTransform(cg.mInverse(b.getMatrix()), p);

    // THEN WE JUST NEED TO SEE IF THE RESULT IS INSIDE A UNIT CUBE.
    return q[0] >= -1 & q[0] <= 1 &&
            q[1] >= -1 & q[1] <= 1 &&
            q[2] >= -1 & q[2] <= 1 ;
  }
  let N = (t,a,b,c,d) => cg.noise(a * t, b * t, c * t + d * model.time);
  let counter = 0
  let pc = true
  let f = t => {
    counter++;
    if (pc)
      console.log(t, counter)

    if (t >= 1){
      pc = false
    }
    if (wirePaths.length == 0)
      return [0,0,0]
    
    const w = wirePaths[0]
    const s = w[Math.floor(t*(w.length-1))]
    // s[0], s[1] = s[0] + 0.001* Math.sin(model.time), s[1] + 0.001* Math.cos(model.time)
    return [...s,t*.1]
  };
  let testWire = model.add(clay.wire(200,8)).move(1,1.6,0);
  model.setTable(false);
  model.animate(() => {
        clay.animateWire(testWire, .025, f);

        // FETCH THE MATRIXES FOR THE LEFT AND RIGHT CONTROLLER.

        let ml = controllerMatrix.left;
        let mr = controllerMatrix.right;

        // EXTRACT THE LOCATION OF EACH CONTROLLER FROM ITS MATRIX,
        // AND USE IT TO SEE WHETHER THAT CONTROLLER IS INSIDE THE BOX.

        let isLeftInBox  = isInBox(ml.slice(12,15), can);
        let isRightInBox = isInBox(mr.slice(12,15), can);

        let isTouchingRed  = isInBox(ml.slice(12,15), redPlus) || isInBox(mr.slice(12,15), redPlus);
        let isTouchingGreen  = isInBox(ml.slice(12,15), greenPlus) || isInBox(mr.slice(12,15), greenPlus);
        let isTouchingBlue  = isInBox(ml.slice(12,15), bluePlus) || isInBox(mr.slice(12,15), bluePlus);
        let isTouchingNegRed  = isInBox(ml.slice(12,15), redNeg) || isInBox(mr.slice(12,15), redNeg);
        let isTouchingNegGreen  = isInBox(ml.slice(12,15), greenNeg) || isInBox(mr.slice(12,15), greenNeg);
        let isTouchingNegBlue  = isInBox(ml.slice(12,15), blueNeg) || isInBox(mr.slice(12,15), blueNeg);


        // IF NEITHER CONTROLLER IS INSIDE THE BOX, COLOR THE BOX WHITE.
        if (! isLeftInBox && ! isRightInBox){
            can.color(1,1,1);
        } else {
            if (isTouchingRed)
                redPercent = Math.min(1, redPercent + 0.01);

            if (isTouchingGreen)
                greenPercent = Math.min(1, greenPercent + 0.01);
            
            if (isTouchingBlue)
                bluePercent = Math.min(1, bluePercent + 0.01);

            if (isTouchingNegRed)
                redPercent = Math.max(0, redPercent - 0.01);

            if (isTouchingNegGreen)
                greenPercent = Math.max(0, greenPercent - 0.01);
            
            if (isTouchingNegBlue)
                bluePercent = Math.max(0, bluePercent - 0.01);
        }

        rightHasCan = false;
        leftHasCan = false;

        if (isLeftInBox) {

            // COLOR THE BOX PINK.
            can.color(1,.5,.5);

            // IF THE LEFT TRIGGER IS SQUEEZED
            let leftTrigger = buttonState.left[0].pressed;
            if (leftTrigger) {
                // COLOR THE BOX RED AND MOVE THE BOX.
                can.color(1,0,0);
                let B = ml.slice(12,15);
                if (! leftTriggerPrev)         // ON LEFT DOWN EVENT:
                    A = B;                      // INITIALIZE PREVIOUS LOCATION.
                else
                    MP = cg.mMultiply(cg.mTranslate(cg.subtract(B, A)), MP);
                A = B;                         // REMEMBER PREVIOUS LOCATION.
                leftHasCan = true;
            }
            leftTriggerPrev = leftTrigger;
        } else if (isRightInBox) {
            // COLOR THE BOX LIGHT BLUE.
            can.color(.5,.5,1);

            // IF THE RIGHT TRIGGGER IS SQUEEZED
            let rightTrigger = buttonState.right[0].pressed;
            if (rightTrigger) {
                // COLOR THE BOX BLUE AND MOVE AND ROTATE THE BOX.
                can.color(0,0,1);
                let MB = mr.slice();
                if (! rightTriggerPrev)        // ON RIGHT DOWN EVENT:
                    MA = MB;                    // INITIALIZE PREVIOUS MATRIX.
                else
                    MP = cg.mMultiply(cg.mMultiply(MB, cg.mInverse(MA)), MP);

                MA = MB;                       // REMEMBER PREVIOUS MATRIX.
                rightHasCan = true;
            }
            rightTriggerPrev = rightTrigger;
        }

        // DISPLAY THE BOX.
        redPlus.setMatrix(redMP).scale(.1);
        greenPlus.setMatrix(greenMP).scale(.1);
        bluePlus.setMatrix(blueMP).scale(.1);

        // newCube.setMatrix(newCubeMP).scale(.1).turnY(Math.sin(model.time)*.3);

        redNeg.setMatrix(redNegMP).scale(.1);
        greenNeg.setMatrix(greenNegMP).scale(.1);
        blueNeg.setMatrix(blueNegMP).scale(.1);

       
        can.color(redPercent, greenPercent, bluePercent)
        can.setMatrix(MP).scale(.1);

        // for (let wireI = 0; wireI < wires.length; wireI++){
        //   console.log(wires[wireI], wirePaths[wireI])
        //   clay.animateWire(wires[wireI], .025, (t) => wirePaths[wireI][t]);
        // }
        

        grafitiCanvas.identity().move(0,1.7,0).scale(.7,.7,.0001);//.scale(.0001, 1, 1);

   });
}

