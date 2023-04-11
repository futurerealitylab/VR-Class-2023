import * as global from "../global.js";
import * as cg from "../render/core/cg.js";
import {Gltf2Node} from "../render/nodes/gltf2.js";
import {g2} from "../util/g2.js";
import {buttonState} from "../render/core/controllerInput.js";

let colors = ['#32a852', '#3e32a8', '#eaf04d', '#e36e14', '#f50fb7'];

// press right[1] to show hud, press again to hide it
let hudIsShown = true;
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
        this.position = initialPosition;
        this.index = index;
        this.color = c;
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
        g2.fillText('Moving Player: #' + (tacticBoard.currPlayer + 1), .75, .84, 'center');
        g2.setColor('black');
        g2.textHeight(.04);
        for (let i = 0; i < playerList.length; i++) {
            let pos2D = playerList[i].pos2D()
            g2.fillText('(' + (pos2D[0].toFixed(1)) + ', ', .80, .12 + i * .15, 'center');
            g2.fillText('' + (pos2D[1].toFixed(1)) + ')', .895, .12 + i * .15, 'center');
        }
        g2.textHeight(.05);
        g2.fillText('Tactic Board', .5, .95, 'center');
        g2.drawWidgets(tacticBoard);
    });

    tacticBoard.currPlayer = 0

    g2.addTrackpad(tacticBoard, .3, .47, '#ff8080', ' ', () => {
    }, 1, playerList, tacticBoard);
    for (let i = 0; i < numPlayers; i++) {
        g2.addWidget(tacticBoard, 'button', .65, .12 + i * .15, colors[i], '#' + i, () => {
            tacticBoard.currPlayer = i
        }, 0.9);
    }

    let fieldMap = boardBase.add('cube').texture('../media/textures/field.png');

    tacticBoard.identity().scale(.6, .6, .0001).opacity(0);
    fieldMap.identity().move(-0.24, -0.035, 0.0002).scale(.46, .51, .0001).opacity(0.2);

    model.animate(() => {
        boardBase.identity().boardHud().scale(1.3);

        hudButtonHandler();

        if (hudIsShown) {
            if (boardBase._children.length === 0) {
                boardBase._children.push(tacticBoard)
            }
        } else {
            boardBase._children = [];
        }

        for (let i = 0; i < numPlayers; i++) {
            playerList[i].update()
        }
    });
}

