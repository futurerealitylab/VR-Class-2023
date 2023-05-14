import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { rcb } from '../handle_scenes.js';
import * as croquet from "../util/croquetlib.js";

let BALL_POS = cg.mTranslate(-.75,1.5,.5);
let BOX_POS = cg.mTranslate(-1,1.25,.5);
let DONUT_POS = cg.mTranslate(-.75,1.25,.5);
const OBJ_SIZE = 0.06;
const TARGET_SIZE = 0.08;
const SIMON_BUTTON_SIZE = .7
const DICE_SIZE = .5

let leftTriggerPrev = false;
let rightTriggerPrev = false;

const TARGET_ID = 'ball';

let currentState = "setup";

let waitingMenu = null;
let startGameMenu = null;

let gameState = {
  role: null,
  players: null,
  activeAlerts: null,
}

export let updateModel = e => {
  
}

export let sendToScene = (event) => {
  switch (event.eventType) {
    case "player-joined":
      gameState.players = {
        captain: event.captain,
        engineer: event.engineer,        
      };
      gameState.role = event.role;
      

      if (event.engineer && event.captain){
        console.log("test")
        currentState = "allPlayersJoined";
      }

      console.log(gameState)
      break
  }
}


export const init = async model => {
  model.setTable(false);

  /**
   * ===================
   * CROQUET SETUP
   * ===================
   */

  let gameCode = [null, null, null, null]
  let gameCodeIndex = 0;

  let welcomeMenu = model.add('cube').texture(() => {
    g2.setColor('white');
    g2.fillRect(0, 0, 1, 1);
    g2.setColor('black');
    g2.fillText('Enter code', .5, .9, 'center');
  

    let indx = 1;
    for (const code of gameCode){
      if (code !== null){
        g2.setColor(code);
      } else if (indx === (gameCodeIndex + 1)) {
          if (Math.sin(8 * model.time) < 0.5) {
            g2.setColor('black');
          } else {
            g2.setColor('white');
          }
      } else {
        g2.setColor('black');
      }
      g2.fillRect( (0.2 * (indx)) - 0.05, 0.65, 0.1, 0.1);

      indx ++;
    }

    if (! g2.drawWidgets(welcomeMenu)) {
        return
    }
  });

  let codeButtons = [['red', 'green', 'blue', 'pink'], ['cyan', 'magenta', 'yellow', 'orange']];

  let rowIndx = 1;
  for (const codeButttonRow of codeButtons){
    let columnIndx = 1;
    for (const codeButton of codeButttonRow){
      g2.addWidget(welcomeMenu, 'button', (0.2 * (columnIndx)), .25 * rowIndx, codeButton, '   ', () => { 
        if (gameCodeIndex >= 4) {
          return
        }
        gameCode[gameCodeIndex] = codeButton;
        gameCodeIndex++;
      });
      columnIndx ++;
    }
    rowIndx ++;
  }

  g2.addWidget(welcomeMenu, 'button', 0.5, 0.1, 'grey', 'Join Game', () => { 
    if (gameCodeIndex < 4) {
      return
    }
    currentState = "waitingForPlayers";
    const croquetCode = gameCode.join('-');
    croquet.register(croquetCode);
  });

  /**
   * ===================
   * TASK 1 CODE
   * ===================
   */
  const initObject = (obj, id, pos) => {
    obj.pos = pos
    obj.id = id
    obj.prevPos = [0, 0, 0]
    obj.handleMove = (mlPos) => {
      const isLeftControllerInObj  = isPointInObject(mlPos, obj);
      if (isLeftControllerInObj) {

        let leftTrigger = buttonState.left[0].pressed;
        // IF THE LEFT TRIGGER IS SQUEEZED
        if (leftTrigger) {
          // COLOR THE OBJ PINK AND MOVE THE OBJ.
          obj.color(1,.5,.5);
          // ON LEFT DOWN EVENT:
          if (!leftTriggerPrev) {
            // INITIALIZE PREVIOUS LOCATION.
            obj.prevPos = mlPos;
          } else {
            obj.pos = cg.mMultiply(cg.mTranslate(cg.subtract(mlPos, obj.prevPos)), obj.pos);
          }
          // REMEMBER PREVIOUS LOCATION.
          obj.prevPos = mlPos;
        } else {
          obj.color(1,1,1);
        }
        leftTriggerPrev = leftTrigger;
      }
    }

    return obj;
  }

  let ball = model.add('sphere')
  let box = model.add('cube')
  let donut = model.add('donut')
  ball = initObject(ball, 'ball', BALL_POS)
  box = initObject(box, 'box', BOX_POS)
  donut = initObject(donut, 'donut', DONUT_POS)

  const sampleTask1Objs = [ball, box, donut]

  let sampleTask1 = model.add()
    .move(-.75, 1.5, 0.5)
    .scale(TARGET_SIZE)

  sampleTask1.add('cube')
    .texture(() => {
      g2.setColor('black');
      g2.textHeight(.1);
      g2.fillText('Inertial Damping\nRegulator', .5, .9, 'center');
    })
    .move(0, 0.5, 0)
    .scale(1.5, 1.5, 0.001)

  let targetBox = sampleTask1.add('cube').opacity(0.6)

  const isPointInObject = (p, obj) => {
    if (!obj || !obj.getMatrix()) {
      return false;
    }
    let q = cg.mTransform(cg.mInverse(obj.getMatrix()), p);
    return q[0] >= -1 & q[0] <= 1 &&
      q[1] >= -1 & q[1] <= 1 &&
      q[2] >= -1 & q[2] <= 1 ;
  }

  /**
   * ===================
   * TASK 2 CODE
   * ===================
   */
  let sampleTask2 = model.add()
    .move(0, 1.5, 0.5)
    .scale(TARGET_SIZE)

  sampleTask2.add('cube')
  .texture(() => {
    g2.setColor('black');
    g2.textHeight(.1);
    g2.fillText('Tachyon Compression\nField Interface', .5, .9, 'center');
  })
  .move(0, 0.25, 0)
  .scale(1.5, 1.5, 0.001)

  const codeProgress = sampleTask2.add()
    .move(0, .65, 0)

  const codeSeq1 = codeProgress.add('cube')
    .move(-.8, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq2 = codeProgress.add('cube')
    .move(-.4, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq3 = codeProgress.add('cube')
    .move(.0, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq4 = codeProgress.add('cube')
    .move(.4, 0, 0)
    .scale(0.2, 0.2, 0.1)
  const codeSeq5 = codeProgress.add('cube')
    .move(.8, 0, 0)
    .scale(0.2, 0.2, 0.1)

  const codeSequence = [codeSeq1, codeSeq2, codeSeq3, codeSeq4, codeSeq5]

  const simonButtonRed = sampleTask2.add('cube')
    .color(1, 0, 0)
  simonButtonRed.id = 'red'
  simonButtonRed.pos = [-1.75, -.5, 0]
  const simonButtonGreen = sampleTask2.add('cube')
    .color(0, 1, 0)
  simonButtonGreen.id = 'green'
  simonButtonGreen.pos = [0, -.5, 0]
  const simonButtonBlue = sampleTask2.add('cube')
    .color(0, 0, 1)
  simonButtonBlue.id = 'blue'
  simonButtonBlue.pos = [1.75, -.5, 0]
  const simonButtonYellow = sampleTask2.add('cube')
    .color(1, 1, 0)
  simonButtonYellow.id = 'yellow'
  simonButtonYellow.pos = [-1, -2.25, 0]
  const simonButtonPurple = sampleTask2.add('cube')
    .color(1, 0, 1)
  simonButtonPurple.id = 'purple'
  simonButtonPurple.pos = [1, -2.25, 0]

  const sampleTask2Buttons = [
    simonButtonRed,
    simonButtonGreen,
    simonButtonBlue,
    simonButtonYellow,
    simonButtonPurple
  ];

  const targetSequence = ['purple', 'yellow', 'blue', 'green', 'red']
  let predictionSequence = []

  /**
   * ===================
   * TASK 3 CODE
   * ===================
   */
  let sampleTask3 = model.add()
    .move(1, 1.5, 0.5)
    .scale(TARGET_SIZE)

  sampleTask3.add('cube')
  .texture(() => {
    g2.setColor('black');
    g2.textHeight(.1);
    g2.fillText('Quantum Thrust\nSequencer', .5, .9, 'center');
  })
  .move(0, 0.25, 0)
  .scale(1.5, 1.5, 0.001)

  const dice1 = sampleTask3.add('cube')
    .move(-3, -.5, 0)
    .scale(DICE_SIZE)

  g2.addWidget(dice1, 'slider', .375, .068, '#80ffff', 'color', value => dice1.color = value);


  const dice2 = sampleTask3.add('cube')
    .move(-1.5, -.5, 0)
    .scale(DICE_SIZE)
  const dice3 = sampleTask3.add('cube')
    .move(0, -.5, 0)
    .scale(DICE_SIZE)
  const dice4 = sampleTask3.add('cube')
    .move(1.5, -.5, 0)
    .scale(DICE_SIZE)
  const dice5 = sampleTask3.add('cube')
    .move(3, -.5, 0)
    .scale(DICE_SIZE)

  // croquet.register("green-green-green-green");

  model.animate(() => {

    switch (currentState){
      case "setup":
        welcomeMenu.hud().scale(1, 1, .0001)
        break
      case "waitingForPlayers": 
        if (welcomeMenu != null){
          model.remove(welcomeMenu);

          waitingMenu = model.add('cube').texture(() => {
            g2.setColor('white');
            g2.fillRect(0, 0, 1, 1);
            g2.setColor('black');
      
            g2.textHeight(0.1)
      
            g2.fillText("For this round will be:", .5, .8, 'center');
            g2.fillText("Your role will be:", .5, .7, 'center');
            g2.fillText(`${gameState.role} ${currentState}`, .5, .6, 'center');
          });
          welcomeMenu = null;
        }
        waitingMenu.hud().scale(1, 1, .0001)
        break
      case "allPlayersJoined":
        if (waitingMenu != null){
          model.remove(waitingMenu);
          startGameMenu =  model.add('cube').texture(() => {
            g2.setColor('white');
            g2.fillRect(0, 0, 1, 1);
            g2.setColor('black');
          
            if (! g2.drawWidgets(startGameMenu)) {
              return
            }
          });
          g2.addWidget(startGameMenu, 'button', 0.5, 0.1, 'grey', 'Start Game', () => { 
            currentState = "game";
          });
          waitingMenu = null;
        }
        startGameMenu.hud().scale(1, 1, .0001)
        break
      case "game":
        if (startGameMenu != null){
          model.remove(startGameMenu);
          startGameMenu = null;
        }
        break
    }
    

    /**
     * ===================
     * TASK 1 CODE
     * ===================
     */
    const targetPos = targetBox.getGlobalMatrix().slice(12,15);
    const mlPos = controllerMatrix.left.slice(12,15);

    sampleTask1Objs.forEach(obj => {
      obj.handleMove(mlPos)
      obj.setMatrix(obj.pos).scale(OBJ_SIZE)

      if (obj.id === TARGET_ID) {
        const objToTargetDistance = cg.distance(obj.pos.slice(12,15), targetPos)
        const isObjInTarget = Math.abs(objToTargetDistance) < TARGET_SIZE;

        if (isObjInTarget) {
          targetBox.color(0, 1, 0)
        } else {
          targetBox.color(1, 1, 1)
        }
      }
    })

    /**
     * ===================
     * TASK 2 CODE
     * ===================
     */
    let rightTrigger = buttonState.right[0].pressed

    sampleTask2Buttons.forEach((button, i) => {
      button.identity()
        .move(...button.pos)
        .scale(SIMON_BUTTON_SIZE, SIMON_BUTTON_SIZE, 0.1)
      let center = button.getGlobalMatrix().slice(12, 15)
      let point = rcb.projectOntoBeam(center)
      let diff = cg.subtract(point, center)
      let hit = cg.norm(diff) < TARGET_SIZE*.8

      button.opacity(hit && rightTrigger ? 1 : 0.6)
    })

    if (!rightTrigger && rightTriggerPrev) {
      const hitButton = sampleTask2Buttons.find(button => {
        let center = button.getGlobalMatrix().slice(12, 15)
        let point = rcb.projectOntoBeam(center)
        let diff = cg.subtract(point, center)
        return cg.norm(diff) < TARGET_SIZE*.8
      })
      if (hitButton) {
        console.log(hitButton.id)
        let currentSeqPos = predictionSequence.length
        let expectedColor = targetSequence[currentSeqPos]

        if (hitButton.id === expectedColor) {
          predictionSequence.push(hitButton.id)
        } else {
          predictionSequence = []
        }
      }
    }
    rightTriggerPrev = rightTrigger

    codeSequence.forEach((seq,i) => {
      if (predictionSequence[i]) {
        seq.color(0, 1, 0)
      } else {
        seq.color(1, 1, 1)
      }
    })

    /**
     * ===================
     * TASK 3 CODE
     * ===================
     */

  });
}