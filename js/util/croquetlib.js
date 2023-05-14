
// YOUR APPLICATION SHOULD REDEFINE THESE FUNCTIONS:

import { updateModel, updateView } from "../scenes/spaceShipTasks.js";
import { controllerMatrix,  buttonState, joyStickState} from "../render/core/controllerInput.js";
import { initAvatar } from "../primitive/avatar.js";
import * as global from "../global.js";

// YOU SHOULD OBTAIN YOUR OWN apiKey FROM: croquet.io/keys

let apiKey = '16JKtOOpBuJsmaqgLzMCFyLPg9mqtNhxtObIsoj4b';
let preRightTrigger = {pressed: false, touched: false, value: 0};
window.color = [Math.random(), Math.random(), Math.random()]
/////////////////////////////////////////////////////////////////
let initModel = () => {
   // if(!croquetModel.scene) croquetModel.scene =  window.clay.model.dataTree;
}

let drawAvatar = actor => {
   let avatarInfo = actor.avatarPos;
   if (avatarInfo.headset) {
       window.avatars[actor.viewId].headset.matrix = avatarInfo.headset;
   } 
       // not in the default pos
   if (avatarInfo.controllerMatrix) {
       window.avatars[actor.viewId].leftController.matrix = avatarInfo.controllerMatrix.left;
       window.avatars[actor.viewId].rightController.matrix = avatarInfo.controllerMatrix.right;
   }
}

let drawView    = () => {
   
}


export class Model extends Croquet.Model {
   init() {

      this.players = {
         captain: null,
         engineer: null
      };      
      this.actors = new Map();
      this.actorStates = new Map();
      this.subscribe(this.sessionId, "view-join", this.viewJoin);
      this.subscribe(this.sessionId, "view-exit", this.viewDrop);

      this.subscribe("scene", "initScene"   , this.initScene   );
      this.subscribe("scene", "updateScene" , this.updateScene );
      this.subscribe("input", "game-event", this.processGameEvent);

      this.actorIndex = 0;
      this.initScene();
   }
   viewJoin(viewId) {
      let actorState = this.actorStates.get(viewId);
      if (! actorState) {
         actorState = this.actorIndex++;
         this.actorStates.set(viewId, actorState);
      }
      const actor = Actor.create(viewId);
      actor.state = actorState;
      this.actors.set(viewId, actor);
      this.publish("actor", "join", actor);

      if (this.players.captain && this.players.engineer) {
         console.log(`All roles taken. Cannot add ${viewId}.`)
         return false;
      } else if (!this.players.captain) {
         this.players.captain = viewId;
         console.log(`Added player ${viewId} as Captain.`);
      } else if (!this.players.engineer) {
         this.players.engineer = viewId;
         console.log(`Added player ${viewId} as Engineer.`);
      }
      this.publish(this.sessionId, 'players-updated', this.players)
   }
   viewDrop(viewId) {
      const actor = this.actors.get(viewId);
      this.actors.delete(viewId);
      actor.destroy();
      this.publish("actor", "exit", actor);

      if (this.players.captain === viewId) {
         this.players.captain = null
         console.log(`Removed player ${viewId} from Captain.`);
       } else if (this.players.engineer === viewId) {
         this.players.engineer = null
         console.log(`Removed player ${viewId} from Engineer.`);
       } else {
         console.log(`Removed player ${viewId} had no role.`);
         return false;
       }
   
       this.publish(this.sessionId, 'players-updated', this.players)
       this.publish(this.sessionId, 'game-event', {
         eventType: "reset-game"
       })
   }
   initScene() {
      window.croquetModel = this;
      initModel();
   }
   updateScene(e) {
      if (window.croquetModel)
         updateModel(e);
      else {
         window.croquetModel = this;
         initModel();
      }
   }

   processGameEvent(event) {
      this.publish(this.sessionId, "game-event", event);
   }
}

export class Actor extends Croquet.Model {
   init(viewId) {
      this.viewId = viewId;
      this.mousePos = { x: 0, y: 0 };
      this.avatarPos = {
        "headset": null,
        "controllerMatrix": null,
        "buttonState": null,
        "joyStickState": null,
        "VR": null,
      }
      this.future(500).tick();
      this.subscribe(viewId, "updatePos", this.updatePos);
   }
   updatePos(avatarPos) {
    //   this.mousePos = mousePos;
    this.avatarPos = avatarPos;
   }
   tick() {
      this.publish(this.id, "moved", this.now());
      this.future(500).tick();
   }
}
Actor.register("Actor");

export class View extends Croquet.View {
   constructor(croquetModel) {
      super(croquetModel);
      this.croquetModel = croquetModel;
      this.scene = croquetModel.scene;
      this.state = croquetModel.actorStates.get(this.viewId);
      this.color = window.color; // assign a unique color to each user for them to create their cubes in demoCroquet
      this.pawns = new Map();
      croquetModel.actors.forEach(actor => this.addPawn(actor));

      window.croquetView = this;
      this.role = "Captain";
      this.failedTimeout = null;
      this.playersUpdated(croquetModel.players)

      this.subscribe(this.sessionId, 'players-updated', this.playersUpdated);
      this.subscribe(this.sessionId, 'game-event', this.processGameEvent);

      this.subscribe("actor", "join", this.addPawn);
      this.subscribe("actor", "exit", this.removePawn);
      this.future(50).tick();

      let eToXY = e => {
         const r = window.canvas.getBoundingClientRect();
         const scale = window.canvas.width / Math.min(r.width, r.height);
         const x = (e.clientX - r.left) / window.canvas.width * 2 - 1;
         const y = 1 - (e.clientY - r.top) / window.canvas.width * 2;
         return {x:x, y:y};
      }
      onmousedown = e => { this.mouseDown(eToXY(e)); }
      onmouseup   = e => { this.mouseUp  (eToXY(e)); }
      onmousemove = e => { this.mouseMove(eToXY(e)); }
   }

   init(options) {

   }

   tick() {    
      var headMat = [];
      for(let j = 0; j < 16; j ++) {
         headMat.push(window.avatars[window.playerid].headset.matrix[j])
      }
      var avatarJson = {
         "headset": headMat,
         "controllerMatrix": controllerMatrix,
         "buttonState": buttonState,
         "joyStickState": joyStickState,
         "VR": window.vr,
      }
      if(preRightTrigger && !buttonState.right[0].pressed) {
      this.event('rightTriggerRelease', controllerMatrix.right, this.color)
      }
      this.publish(this.viewId, "updatePos", avatarJson);
      preRightTrigger = buttonState.right[0].pressed;

      window.view = this;
      drawView();
      let viewState = this.croquetModel.actorStates.get(this.viewId);
      for (const pawn of this.pawns.values()) {
         pawn.update(viewState);
      }

    this.future(50).tick();
 }

   addPawn(actor) {
      this.pawns.set(actor, new Pawn(actor));
      if(!(actor.viewId in window.avatars)) {
        initAvatar(actor.viewId);
     } 
     else { // for false stream drop, when the stream is back, change its avatar to visible
      window.avatars[actor.viewId].headset.model.visible = true;
      window.avatars[actor.viewId].leftController.model.visible = true;
      window.avatars[actor.viewId].rightController.model.visible = true;
     }
   }
   removePawn(actor) {
      const pawn = this.pawns.get(actor);
      if (pawn) {
         pawn.detach();
         this.pawns.delete(actor);
         // currently only change the visibility instead of removing the model directly in case of false stream drop
         window.avatars[actor.viewId].headset.model.visible = false;
         window.avatars[actor.viewId].leftController.model.visible = false;
         window.avatars[actor.viewId].rightController.model.visible = false;
         // global.scene().removeNode(window.avatars[actor.viewId].headset.model);
         // global.scene().removeNode(window.avatars[actor.viewId].leftController.model);
         // global.scene().removeNode(window.avatars[actor.viewId].rightController.model);
      }
   }
   update() { // turns out this function will not be called when entering the VR session, moved the following code to tick function
      // window.view = this;
      // drawView();
      // let viewState = this.croquetModel.actorStates.get(this.viewId);
      // for (const pawn of this.pawns.values()) {
      //    pawn.update(viewState);
      // }
   }
   initScene  (info) { this.publish("scene", "initScene"  , info); }
   updateScene(info) { this.publish("scene", "updateScene", info); }

   event(state, pos, info) { this.updateScene({who : this.viewId,
                                         what : state,
                                         where : pos,
                                         info: info}); }
   mouseDown(p) { this.isDown = true ; this.event('press', p); }
   mouseMove(p) { this.event(this.isDown ? 'drag' : 'move', p); }
   mouseUp(p)   { this.isDown = false; this.event('release', p, this.color); }

   createNewAlert() {
      const expiration = this.randomInt(10000, 30000);
      this.failedTimeout = setTimeout(() => this.failAlert(), expiration);
      this.publish("input", 'game-event', {
        eventType: "new-alert",
        expiration: expiration,
        alertName: this.randomAlertName(),
        severity: this.randomInt(1, 5),
        resolvedBy: [this.model.players.engineer, this.model.players.captain][this.randomInt(0, 2)]
      })
  }
  
  failAlert() {
    this.publish("input", 'game-event', { eventType: "failed-alert" });
  }

  startGame() {
    this.publish("input", 'game-event', { eventType: "starting-game" });
  }
  
  processGameEvent(event) {
    console.log("new event", event)
                
    const eventType = event.eventType;
    switch (eventType){
      case "starting-game":
        this.gameStarted = true;
        
        if (this.model.players.captain === this.viewId){
          setTimeout(() => this.createNewAlert(), this.randomInt(5000, 30000));
        }

        updateView({
            who: this.viewId,
            eventName: "startingGame",
            info: {
               role: players.engineer === this.viewId ? "engineer" : "captain"
            }
         })
        break
      case "reset-game":
        this.gameStarted = false;
        updateView({
            who: this.viewId,
            eventName: "waitingForPlayer",
            info: {
               role: players.engineer === this.viewId ? "engineer" : "captain"
            }
         })
      case "new-alert":
         updateView({
            who: this.viewId,
            eventName: "newAlert",
            info: {
               severity: event.severity,
               name: event.alertName,
               resolvableBy: event.resolvedBy
            }
         })
        break
      case "resolved-alert":
        if (this.model.players.captain === this.viewId){
          setTimeout(() => this.createNewAlert(), this.randomInt(5000, 30000));
        }
        clearTimeout(this.failedTimeout);
        updateView({
            who: this.viewId,
            eventName: "resolvedAlert",
            info: {}
         })
        break
      case "failed-alert":
         updateView({
            who: this.viewId,
            eventName: "gameOver",
            info: {}
         })
         break
      default:
        break
    }
  }

  playersUpdated(players) {
   if (players.engineer && players.captain){
      updateView({
         who: this.viewId,
         eventName: "allPlayersJoined",
         info: {
            role: players.engineer === this.viewId ? "engineer" : "captain"
         }
      })
   } else {
      updateView({
         who: this.viewId,
         eventName: "waitingForPlayer",
         info: {
            role: players.engineer === this.viewId ? "engineer" : "captain"
         }
      })
   }
 }
}

export class Pawn extends Croquet.View {
   constructor(actor) {
      super(actor);
      this.actor = actor;
   }
   update(viewState) {
      drawAvatar(this.actor);
   }
}

// YOU APPLICATION NEEDS TO REGISTER A UNIQUE NAME.

export let register = name => {
   Model.register("RootModel");
   Croquet.Session.join({
      apiKey  : "1_9oolgb5b5wc5kju39lx8brrrhm82log9xvdn34uq",
      appId   : 'io.codepen.croquet.hello',
      name    : name,
      password: 'secret',
      model   : Model,
      view    : View,
      tps     : 1000 / 500,
   });
}

