import * as global from "../global.js";
import * as cg from "../render/core/cg.js";
import {Gltf2Node} from "../render/nodes/gltf2.js";

class Player {
    constructor(gltfUrl) {
        this.node = new Gltf2Node({url: gltfUrl})
        global.gltfRoot.addNode(this.node);
        this.position = null
        this.direction = 0
    }

    update() {
        if (this.position) {
            this.node.matrix = cg.mMultiply(cg.mTranslate(this.position), cg.mRotateY(this.direction))
        }
    }
}

export const init = async model => {
    model.setTable(false)
    model.setRoom(true)
    let playerList = []
    const numPlayers = 5
    for (let i = 0; i < numPlayers; i++) {
        playerList.push(new Player("./media/gltf/Basketball_Player/Basketball_Player.gltf"))
    }
    model.animate(() => {
        for (let i = 0; i < numPlayers; i++) {
            playerList[i].update()
        }
    });
}

