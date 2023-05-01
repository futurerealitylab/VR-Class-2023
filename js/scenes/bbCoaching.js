import * as global from "../global.js";
import * as cg from "../render/core/cg.js";
import {Gltf2Node} from "../render/nodes/gltf2.js";
import {g2} from "../util/g2.js";
import {buttonState, joyStickState} from "../render/core/controllerInput.js";
import {COLORS, MAX_TIME} from "./const.js";
import {resampleCurve} from "../render/core/cg.js";


let hudIsShown = true;      // press right[1] to show hud, press again to hide it
let hudButtonLock = false;
let hudButtonHandler = () => {
    if (buttonState.right[1] && buttonState.right[1].pressed && !hudButtonLock) {
        hudIsShown = !hudIsShown;
        hudButtonLock = true;
    }

    if (buttonState.right[1] && !buttonState.right[1].pressed) {
        hudButtonLock = false;
    }
}

class Player {
    constructor(gltfUrl, index, initialPosition, c) {
        this.node = new Gltf2Node({url: gltfUrl});
        global.gltfRoot.addNode(this.node);
        this.initialPosition = initialPosition;
        this.index = index;
        this.color = c;
        // store the position of each time frame for this player
        this.positions = Array.from({length: 24}, () => Object.assign([], initialPosition));
        this.directions = Array(24).fill(0);
        // check if a specific time frame is within a movement, and be used to find the start/end of a move.
        this.isMoving = Array(24).fill(false);
    }

    // get the start and end time frame of the move
    // if no action selected return [24,23]
    // if start point selected but no end point return [s,s], s is the selected point.
    // if start and end both selected, return [s,e], s < e.
    getStartAndEnd() {
        let t = 0;
        while (t < MAX_TIME && !this.isMoving[t]) {
            t++;
        }
        let start = t;
        while (t < MAX_TIME && this.isMoving[t]) {
            t++;
        }
        let end = t - 1;
        return [start, end];
    }

    pos3D(t) {
        return this.positions[t]
    }

    pos2D(t) {
        return this.positions[t].slice(0, 2)
    }

    update(t) {
        // console.log("directions:", this.directions)
        // console.log("positions:", this.positions)
        this.node.matrix = cg.mMultiply(cg.mTranslate(this.positions[t][0] * Court.width, this.positions[t][2], -this.positions[t][1] * Court.height), cg.mRotateY(this.directions[t]))
    }
}

class Court {
    static width = 15 / 4
    static height = 28 / 4

    constructor(gltfUrl) {
        this.node = new Gltf2Node({url: gltfUrl})
        global.gltfRoot.addNode(this.node)
        this.direction = 0
    }

    static position2DTo3D(pos2D) {
        return [pos2D[0], pos2D[1], 0]
    }
}

export const init = async model => {
    model.setTable(false)
    model.setRoom(false)
    let currTime = 0
    let currCourt = new Court('./media/gltf/bbCourt/scene.gltf')
    let playerList = []
    const numPlayers = 5
    for (let i = 0; i < numPlayers; i++) {
        playerList.push(new Player("./media/gltf/Basketball_Player/Basketball_Player.gltf", i, [1., (i - 2) * .2, 0], COLORS[i]));
    }

    let boardBase = model.add()

    let tacticBoard = boardBase.add('cube').texture(() => {
        g2.setColor('white');
        g2.fillRect(0, 0, 1, 1);
        g2.textHeight(.04)
        g2.setColor('blue');
        // g2.fillText('Moving Player: #' + (tacticBoard.currPlayer + 1), .75, .84, 'center');
        g2.setColor('black');
        g2.textHeight(.03);
        for (let i = 0; i < playerList.length; i++) {
            let player = playerList[i];
            const [start, end] = player.getStartAndEnd();

            // mark the selected player
            if (i === tacticBoard.currPlayer) {
                g2.textHeight(.08);
                g2.fillText('*', .55, .12 + i * .14, 'center');
                g2.textHeight(.03);
            }

            if (start !== 24) {
                // start point selected
                g2.fillText(start + ': ' + '(' + (player.positions[start][0].toFixed(1)) + ',' + (player.positions[start][1].toFixed(1)) + ')  ', .8, .14 + i * .14, 'center');
            }
            if (start < end) {
                // end point selected
                g2.fillText(end + ': ' + '(' + (player.positions[end][0].toFixed(1)) + ',' + (player.positions[end][1].toFixed(1)) + ')  ', .8, .1 + i * .14, 'center');
            }
        }
        g2.textHeight(.05);
        g2.fillText('Tactic Board', .5, .95, 'center');

        // draw timeButton label
        g2.textHeight(.03);
        g2.fillText('↑', .55, .805, 'center');
        g2.fillText('0s', .55, .78, 'center');
        g2.fillText('↑', .965, .805, 'center');
        g2.fillText('23s', .965, .78, 'center');
        g2.fillText('-- Time Frames --', .76, .79, 'center');
        g2.drawWidgets(tacticBoard);
    });

    tacticBoard.currPlayer = -1;                                                // when no player selected, should be -1.
    tacticBoard.timeButton = [];                                                //array used to store the time button widgets
    tacticBoard.startTime = -1;                                                 //starting time of the player
    tacticBoard.endTime = -1;                                                   //ending time of the player
    tacticBoard.started_setting = false;                                        //record if have started the time count or not

    g2.addTrackpad(tacticBoard, .25, .47, '#ff8080', ' ', () => {
    }, 1, playerList, tacticBoard);
    for (let i = 0; i < numPlayers; i++) {
        g2.addWidget(tacticBoard, 'button', .65, .12 + i * .14, COLORS[i], '#' + i, () => {
            if (tacticBoard.currPlayer !== i) {
                tacticBoard.currPlayer = i;
                // reset the status of tacticBoard.
                tacticBoard.startTime = -1;
                tacticBoard.endTime = -1;
                tacticBoard.started_setting = false;
            } else {
                let player = playerList[tacticBoard.currPlayer];
                tacticBoard.currPlayer = -1;
                const [start, end] = player.getStartAndEnd();
                // const src = [player.pos3D(start), player.pos3D(end)]
                const line = cg.resampleCurve([player.pos3D(start), player.pos3D(end)], end - start)
                console.log("line:", line)
                for (let i = 0; i < end - start; i++) {
                    for (let j = 0; j < 3; j++) {
                        player.positions[start + i][j] = line[i][j]
                    }
                }
            }
        }, 0.9);
    }

    for (let i = 0; i < 24; i++) {
        tacticBoard.timeButton.push(g2.addWidget(tacticBoard, 'button', .55 + i * .018, .84, '#a0aaba', " ", () => {
            currTime = i;
            let player = playerList[tacticBoard.currPlayer];
            if (!tacticBoard.started_setting) {
                for (let j = 0; j < 24; j++) {
                    player.isMoving[j] = false;
                    player.positions[j] = Array.from(player.initialPosition);
                }
                player.isMoving[i] = true;
                tacticBoard.startTime = i;
                tacticBoard.endTime = -1;
            } else {
                tacticBoard.endTime = i;
                if (tacticBoard.endTime <= tacticBoard.startTime) {
                    player.isMoving[tacticBoard.startTime] = false;
                    tacticBoard.startTime = -1;
                    tacticBoard.endTime = -1;
                    for (let j = 0; j < 24; j++) {
                        player.positions[j] = Array.from(player.initialPosition);
                    }
                } else {
                    for (let j = tacticBoard.startTime + 1; j <= tacticBoard.endTime; j++) {
                        player.isMoving[j] = true;
                    }
                }
            }
            tacticBoard.started_setting = !tacticBoard.started_setting;
        }, 0.36));
    }

    let fieldMap = boardBase.add('cube').texture('../media/textures/field.png');

    tacticBoard.identity().scale(.9, .9, .0001).opacity(0);
    fieldMap.identity().move(-0.45, -0.045, 0.0002).scale(.70, .76, .0001).opacity(0.2);

    // update the color of each time button based on the player and time frame selected
    let updateTimeButton = () => {
        if (tacticBoard.currPlayer === -1) {
            for (let j = 0; j < 24; j++) {
                tacticBoard.timeButton[j].updateColor('#a0aaba');
            }
        } else {
            for (let j = 0; j < 24; j++) {
                if (playerList[tacticBoard.currPlayer].isMoving[j]) {
                    tacticBoard.timeButton[j].updateColor(COLORS[tacticBoard.currPlayer]);
                } else {
                    tacticBoard.timeButton[j].updateColor('#a0aaba');
                }
            }
        }
    }

    model.animate(() => {
        boardBase.identity().boardHud().scale(1.3);
        updateTimeButton();
        hudButtonHandler();

        if (hudIsShown) {
            if (boardBase._children.length === 0) {
                boardBase._children.push(tacticBoard)
                boardBase._children.push(fieldMap)
            }
            // console.log("tacticBoard.currPlayer:", tacticBoard.currPlayer)
            // console.log("playerList[tacticBoard.currPlayer].getStartAndEnd():", playerList[tacticBoard.currPlayer].getStartAndEnd())
            if (tacticBoard.currPlayer !== -1) {
                const [start, end] = playerList[tacticBoard.currPlayer].getStartAndEnd();
                if (end > start) {
                    playerList[tacticBoard.currPlayer].directions[end] += 2 * model.deltaTime * joyStickState.right.x
                }
            }
        } else {
            boardBase._children = [];
        }

        for (let i = 0; i < numPlayers; i++) {
            playerList[i].update(currTime)
        }
    });
}

