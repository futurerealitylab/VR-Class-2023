import * as global from "../global.js";
import * as cg from "../render/core/cg.js";
import {Gltf2Node} from "../render/nodes/gltf2.js";
import {g2} from "../util/g2.js";
import {buttonState, joyStickState} from "../render/core/controllerInput.js";

let colors = ['#32a852', '#3e32a8', '#eaf04d', '#e36e14', '#f50fb7'];

let hudIsShown = true;                                              // press right[1] to show hud, press again to hide it
let hudButtonLock = false;
let hudButtonHandler = () => {
    if (buttonState.right[1].pressed && !hudButtonLock) {
        hudIsShown = !hudIsShown;
        hudButtonLock = true;
    }

    if (!buttonState.right[1].pressed) {
        hudButtonLock = false;
    }
}


class Player {
    constructor(gltfUrl, index, initialPosition, c) {
        this.node = new Gltf2Node({url: gltfUrl});
        global.gltfRoot.addNode(this.node);
        this.direction = 0;
        // this.position = initialPosition;
        this.initialPosition = initialPosition;
        this.index = index;
        this.color = c;
        // store the position of each time point for this player
        this.positions = [];
        // check if a specific time point is within a movement, and be used to find the start/end of a move.
        this.isMoving = [];
        for (let i = 0; i < 24; i++) {
            this.positions.push([initialPosition[0], initialPosition[1], initialPosition[2]]);
            this.isMoving.push(false);
        }
    }

    // get the start and end timepoint of the move
    // if no action selected return [24,23]
    // if start point selected but no end point return [s,s], s is the selected point.
    // if start and end both selected, return [s,e], s < e.
    getStartAndEnd() {
        let point = 0;
        while (point < this.isMoving.length && this.isMoving[point] != true) {
            point++;
        }
        let start = point;
        while (point < this.isMoving.length && this.isMoving[point] != false) {
            point++;
        }
        let end = point - 1;
        return [start, end];
    }
    
    pos3D() {
        return this.position
    }

    pos2D() {
        return this.position.slice(0, 2)
    }

    update() {
        if (this.position) {
            this.node.matrix = cg.mMultiply(cg.mTranslate(this.position[0] * Court.width, this.position[2], -this.position[1] * Court.height), cg.mRotateY(this.direction))
        }
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

let markTime = () =>{

}


export const init = async model => {
    model.setTable(false)
    model.setRoom(false)
    let currCourt = new Court('./media/gltf/bbCourt/scene.gltf')
    let playerList = []
    const numPlayers = 5
    for (let i = 0; i < numPlayers; i++) {
        playerList.push(new Player("./media/gltf/Basketball_Player/Basketball_Player.gltf", i, [1., (i - 2) * .2, 0], colors[i]));
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
            let start = player.getStartAndEnd()[0];
            let end = player.getStartAndEnd()[1];

            // mark the selected player
            if (i == tacticBoard.currPlayer) {
                g2.textHeight(.08);
                g2.fillText('*', .55, .12 + i * .14, 'center');
                g2.textHeight(.03);
            }
    
            if (start != 24) {
                // start point selected
                g2.fillText(start + ': ' + '(' + (player.positions[start][0].toFixed(1)) + ',' + (player.positions[start][1].toFixed(1)) + ')  ', .8, .14+i*.14, 'center');
            }
            if (start < end) {
                // end point selected
                g2.fillText(end + ': ' + '(' + (player.positions[end][0].toFixed(1)) + ',' + (player.positions[end][1].toFixed(1)) + ')  ', .8, .1+i*.14, 'center');
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
        g2.fillText('-- Time Points --', .76, .79, 'center');
        g2.drawWidgets(tacticBoard);
    });

    tacticBoard.currPlayer = -1;                                                // when no player selected, should be -1.
    tacticBoard.timeButton = [];                                                //array used to store the time button widgets
    tacticBoard.startTime = -1;                                                 //starting time of the player
    tacticBoard.endTime = -1;                                                   //ending time of the player
    tacticBoard.started_setting = false;                                                //record if have started the time count or not

    g2.addTrackpad(tacticBoard, .25, .47, '#ff8080', ' ', () => {
    }, 1, playerList, tacticBoard);
    for (let i = 0; i < numPlayers; i++) {
        g2.addWidget(tacticBoard, 'button', .65, .12 + i * .14, colors[i], '#' + i, () => {
            tacticBoard.currPlayer = i;
            // reset the status of tacticBoard.
            tacticBoard.startTime = -1;
            tacticBoard.endTime = -1;
            tacticBoard.started_setting = false;
        }, 0.9);
    }

    for (let i = 0; i < 24; i++) {
        tacticBoard.timeButton.push(g2.addWidget(tacticBoard, 'button', .55+ i * .018, .84, '#32a852', " ", () => {
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
                    for (let j = tacticBoard.startTime+1; j <= tacticBoard.endTime; j++) {
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

    let updateTimeButton = () => {
        if (tacticBoard.currPlayer == -1) {
            for (let j = 0; j < 24; j++) {
                tacticBoard.timeButton[j].updateColor('#32a852');
            }
        } else {
            for (let j = 0; j < 24; j++) {
                if (playerList[tacticBoard.currPlayer].isMoving[j] == true) {
                    tacticBoard.timeButton[j].updateColor('#f50fb7');
                } else {
                    tacticBoard.timeButton[j].updateColor('#32a852');
                }
            }
        }
    }

    model.animate(() => {
        boardBase.identity().boardHud().scale(1.3);
        // boardBase.identity().move(0,1.5,0).scale(1.3);

        updateTimeButton();

        hudButtonHandler();

        if (hudIsShown) {
            if (boardBase._children.length === 0) {
                boardBase._children.push(tacticBoard)
                boardBase._children.push(fieldMap)
            }
            playerList[tacticBoard.currPlayer].direction += 2 * model.deltaTime * joyStickState.right.x
        } else {
            boardBase._children = [];
        }

        for (let i = 0; i < numPlayers; i++) {
            playerList[i].update()
        }
    });
}

