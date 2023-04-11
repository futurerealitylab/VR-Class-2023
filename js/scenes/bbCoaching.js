import * as global from "../global.js";
import * as cg from "../render/core/cg.js";
import {Gltf2Node} from "../render/nodes/gltf2.js";
import { g2 } from "../util/g2.js";
import { buttonState } from "../render/core/controllerInput.js";


let num_1_color = '#32a852', 
    num_2_color = '#3e32a8', 
    num_3_color = '#eaf04d', 
    num_4_color = '#e36e14', 
    num_5_color = '#f50fb7';

let colors = [num_1_color, num_2_color, num_3_color, num_4_color, num_5_color];

// press right[1] to show hud, press again to hide it
let hudIsShown = false;
let hud_buttonLock = false;
let hud_buttonHandler = () => {
    if (buttonState.right[1].pressed && !hud_buttonLock) {
        hudIsShown = !hudIsShown;
        hud_buttonLock = true;
    }

    if (!buttonState.right[1].pressed) {
        hud_buttonLock = false;
    }
}

let calPosInField = (pos) => {
    return [15 * pos[0], 28 * pos[1]];
}

// convert the 2d position in the trackboard to the 3d position in the field model.
let cal3dPosition = (pos) => {
    //TODO
    return [0,0,0]
}

class Player {
    constructor(gltfUrl, index, position, c) {
        this.gltfNode = new Gltf2Node({url: gltfUrl})
        global.gltfRoot.addNode(this.gltfNode);
        this.direction = 0;
        this.position = position; // 2d position in the trackboard (0.0~1.0 , 0.0~1.0). EX, (0.5, 0.5) => (7.5m, 14m).
        this.index = index;
        this.color = c;
    }

    update() {
        this.gltfNode.matrix = cg.mMultiply(cg.mTranslate(cal3dPosition(this.position)), cg.mRotateY(this.direction))
    }
}


export const init = async model => {
    let playerList = []
    const numPlayers = 5
    for (let i = 0; i < numPlayers; i++) {
        playerList.push(new Player("gltf path", i, [.12 + i * .19, .2], colors[i]));
    }

    let curr_player = {
        value: 0
    }

    let board_base = model.add();

    let createTable = () => {
        let tactic_board = board_base.add('cube').texture(() => {
            g2.setColor('white');
            g2.fillRect(0,0,1,1);
            g2.textHeight(.04)
            g2.setColor('blue');
            g2.fillText('Moving Player: #' + (curr_player.value+1), .75, .84, 'center');
            g2.setColor('black');
            g2.textHeight(.04);
            for (let i = 0; i < playerList.length; i++) {
                let posInField = calPosInField(playerList[i].position);
                g2.fillText('(' + (posInField[0].toFixed(1)) + ', ', .80, .12 + i * .15, 'center');
                g2.fillText('' + (posInField[1].toFixed(1)) + ')', .895, .12 + i * .15, 'center');    
            }
            g2.textHeight(.05);
            g2.fillText('Tactic Board', .5, .95, 'center');
            g2.drawWidgets(tactic_board);
         });
         tactic_board.value = [.5,.5];
         g2.addTrackpad(tactic_board, .3, .47, '#ff8080', ' ', () => {}, 1, playerList, curr_player);
         g2.addWidget(tactic_board, 'button', .65, .72, num_1_color, '#1', () => {curr_player.value = 0}, 0.9);
         g2.addWidget(tactic_board, 'button', .65, .57, num_2_color, '#2', () => {curr_player.value = 1}, 0.9);
         g2.addWidget(tactic_board, 'button', .65, .42, num_3_color, '#3', () => {curr_player.value = 2}, 0.9);
         g2.addWidget(tactic_board, 'button', .65, .27, num_4_color, '#4', () => {curr_player.value = 3}, 0.9);
         g2.addWidget(tactic_board, 'button', .65, .12, num_5_color, '#5', () => {curr_player.value = 4}, 0.9);
    
         let field_map = board_base.add('cube').texture('../media/textures/field.png');
         
         tactic_board.identity().move(0,0,0).scale(.6, .6, .0001);
         field_map.identity().move(-0.24,-0.035,0.0002).scale(.46,.51,.0001).opacity(0.2);
    }



    model.animate(() => {
        board_base.identity().board_hud().scale(1.3);

        hud_buttonHandler();

        if (hudIsShown) {
            if (board_base._children.length == 0) {
                createTable();
            }
        } else {
            board_base._children = [];
        }

        for (let i = 0; i < numPlayers; i++) {
            playerList[i].update()
        }
    });
}

