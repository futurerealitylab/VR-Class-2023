import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { rcb } from '../handle_scenes.js';
import defineOctTube from "./newShapes.js"

const PI = 3.1415926;
let center = [0, 1.5, 0];
let radius = 0.0001;
let collisionSphereRad = .16;
let large = 1.5;
let small = .2;
let current_island = 0; // index of the island I'm standing on right now
let ladder_ratio = [.7, .04, .12];
let iPositions = [[-2, 0, 0], [0, 1, 1], [1.2, 2, -1]]; // Island positions
let lPositions = [[-1, .5, .5], [.6, 1.5, 0]]; // Ladder positions
let leftTriggerPressed = false;
let rightTriggerPressed = false;
let rightAPressed = false;

const colors = [
    [1, .4, .5],// light pink
    [0, .5, .9],// light blue
    [0, .9, .4],// light green
    [.9, .9, .9],// light gray
]

// Make positions large-scale
const l = (a) => {
    return a.map(x => x * large);
}
// Make positions small-scale
const s = (a) => {
    return a.map(x => x * small);
}

export const init = async model => {
    // // CREATE THE BALL.
    // let ball = model.add('sphere');

    // Hide room
    model.setTable(false);
    model.setRoom(false);

    /**
     * Define custom primitives
     */
    defineOctTube();
    /**
     * Add Primitives for the large-scale view
     * **/
    // add islands
    let largeView = model.add();
    let island0 = largeView.add();
    island0.add('cube').color(colors[0]);// a building
    island0.add('octTubeY');
    // island0.add('cube').color('white');// ground

    let island1 = largeView.add();
    island1.add('cube').color(colors[1]);// a building
    island1.add('octTubeY');// ground

    let island2 = largeView.add();
    island2.add('cube').color(colors[2]);// a building
    island2.add('octTubeY');// ground

    // add ladders (connection between islands)
    let ladders = largeView.add();
    ladders.add('cube').color(colors[3]);
    ladders.add('cube').color(colors[3]);
    /** End of adding large-scale models **/

    /**
     * Add Primitives for the small-scale view
     * **/
    // add islands
    let smallView = model.add();
    let islandS0 = smallView.add();
    islandS0.add('cube').color(colors[0]);// a building
    islandS0.add('octTubeY');
    islandS0.add('sphere'); // collision box for ground

    let islandS1 = smallView.add();
    islandS1.add('cube').color(colors[1]);// a building
    islandS1.add('octTubeY');
    islandS1.add('sphere');// collision box for ground

    let islandS2 = smallView.add();
    islandS2.add('cube').color(colors[2]);// a building
    islandS2.add('octTubeY');// ground
    islandS2.add('sphere');// collision box for ground

    let laddersS = smallView.add();
    laddersS.add('cube').color(colors[3]);
    laddersS.add('cube').color(colors[3]);

    let islandsObj = [islandS0, islandS1, islandS2];

    // add two types of arrow 
    let a1 = [-1, 0, 0, -1, 0, 0], a2 = [1, 0, 0, 1, 0, 0],
        b1 = [0, -1.8, 0, 0, -1, 0], b2 = [0, .05, 0, 0, 1, 0],
        c1 = [0, 0, -1, 0, 0, -1], c2 = [0, 0, 1, 0, 0, 1];
    clay.defineMesh('arrow', clay.trianglesMesh([a1, b1, c2, a1, b2, c1, a2, b1, c1, a2, b2, c2, a1, c2, b2, a2, c1, b2, a2, c2, b1, a1, c1, b1]));
    let locationArrow = smallView.add('arrow').color(1,0,0);
    let selectionArrow = smallView.add('arrow').color(0,1,0);

    /** End of adding small-scale models **/
  
    /**
     * Interaction with small-scale view
     * **/
    let joyStickX = 0;
    let joyStickY = 0;

    let isInBall = (obj, radius) => {
        let center = obj.getGlobalMatrix().slice(12, 15);
        let point = rcb.projectOntoBeam(center);
        let distance = cg.distance(center, point);
        let diff = cg.subtract(point, center);
        return [cg.norm(diff) < radius, distance];
    }

    let hitIslands = () => {
        let minDist = Infinity;
        let minIsland = -1;

        for (let [index, island] of islandsObj.entries()) {
            let sphere = island.child(2);
            let [ifHit, distance] = isInBall(sphere, collisionSphereRad);
            if(ifHit && distance<minDist){
                minDist = distance;
                minIsland = index;
            }
        }
        return minIsland;
    }

    let onIslandHit = (islandIndex) => {
        selectionArrow.identity().move(islandsObj[islandIndex].getMatrix().slice(12,15)).move(0,.25,0).scale(.025,.025,.025);
        let rightTrigger = buttonState.right[0].pressed;
        if (rightTrigger) {
            if (!rightTriggerPressed) {
                rightTriggerPressed = true;
                current_island = islandIndex;
            }
        }
        else{
            rightTriggerPressed = false;
        }
    }

    let checkIslandsHit = () => {
        let islandIndex = hitIslands();
        if (islandIndex != -1) {
            onIslandHit(islandIndex);
        } 
        else {
            selectionArrow.identity().scale(0);
        }
    }

    
    model.animate(() => {
        /**
         * Configure large-scale models
         * **/
        // island0
        island0.child(0).identity().move(0, .2, 0).scale(.2);
        island0.identity().move(l(iPositions[0])).scale(large);
        // island1
        island1.child(0).identity().move(0, .2, 0).scale(.2);
        island1.identity().move(l(iPositions[1])).scale(large);
        // island2
        island2.child(0).identity().move(0, .2, 0).scale(.2);
        island2.identity().move(l(iPositions[2])).scale(large);
        // ladders
        ladders.child(0).identity().move(l(lPositions[0])).turnZ(PI / 4).scale(l(ladder_ratio));
        ladders.child(1).identity().move(l(lPositions[1])).turnY(PI / 3).turnZ(PI / 4).scale(l(ladder_ratio));
        /** End of configure large-scale models **/

        /**
         * Configure small-scale models
         * **/
        // island0
        islandS0.child(0).identity().move(0, .2, 0).scale(.2);
        islandS0.child(2).identity().scale(.8).opacity(0.001);
        islandS0.identity().move(s(iPositions[0])).scale(small);

        // island1
        islandS1.child(0).identity().move(0, .2, 0).scale(.2);
        islandS1.child(2).identity().scale(1, .1, 1).opacity(0.001);
        islandS1.identity().move(s(iPositions[1])).scale(small);
        // island2
        islandS2.child(0).identity().move(0, .2, 0).scale(.2);
        islandS2.child(2).identity().scale(1, .1, 1).opacity(0.001);
        islandS2.identity().move(s(iPositions[2])).scale(small);
        // ladders
        laddersS.child(0).identity().move(s(lPositions[0])).turnZ(PI / 4).scale(s(ladder_ratio))
        laddersS.child(1).identity().move(s(lPositions[1])).turnY(PI / 3).turnZ(PI / 4).scale(s(ladder_ratio));

        // the whole thing
        // smallView.identity().move(0,Math.sin(model.time)/50,.5);
        smallView.hud().turnX(joyStickX/10).turnY(joyStickY/10);
        /** End of configure small-scale models **/

        /**
         * Controller Interactions
         */
        let vm = clay.views[0].viewMatrix;
        let viewPosition = [];
        viewPosition.push(vm[12]);
        viewPosition.push(vm[13]);
        viewPosition.push(vm[14]);

        // Press left controller trigger to stand on the next island
        let rightTrigger = buttonState.right[0].pressed;
        let leftTrigger = buttonState.left[0].pressed;

        if (leftTrigger) {
            if (!leftTriggerPressed) {
                leftTriggerPressed = true;
                current_island = (current_island + 1) % 3;
            }
        }
        else
            leftTriggerPressed = false;

        // small-scale view interaction
        checkIslandsHit();

        // small-scale view rotation
        joyStickX += joyStickState.right.y;
        joyStickY += joyStickState.right.x;

        let rightA = buttonState.right[4].pressed;
        if (rightA) {
            if (!rightAPressed) {
                rightAPressed = true;
                joyStickX = 0;
                joyStickY = 0
            }
        }
        else{
            rightAPressed = false;
        }

        largeView.identity().move(cg.scale(iPositions[current_island], -1));
        locationArrow.identity().move(islandsObj[current_island].getMatrix().slice(12,15)).move(0,.25,0).scale(.025,.025,.025);

        // // SEE WHETHER LEFT CONTROLLER BEAM HITS THE BALL
        // let point = lcb.projectOntoBeam(center);
        // let diff = cg.subtract(point, center);
        // let hit = cg.norm(diff) < radius;
        // let lt = buttonState.left[0].pressed;
        //
        // // IF SO, MOVE THE BALL WHILE THE TRIGGER IS DOWN
        //
        // if (hit && lt)
        //     center = point;
        //
        // // DISPLAY THE BALL
        //
        // ball.color(hit ? lt ? [1,0,0] : [1,.5,.5] : [1,1,1]);
        // ball.identity().move(center).scale(radius);
    });
}

