import * as global from "../global.js";
import * as cg from "../render/core/cg.js";
import {Gltf2Node} from "../render/nodes/gltf2.js";

class Player {
    constructor(gltfUrl) {
        this.gltfNode = new Gltf2Node({url: gltfUrl})
        global.gltfRoot.addNode(this.gltfNode);
        this.position = null
        this.direction = 0
    }

    update() {
        this.gltfNode.matrix = cg.mMultiply(cg.mTranslate(this.position), cg.mRotateY(this.direction))
    }
}

export const init = async model => {
    let playerList = []
    const numPlayers = 5
    for (let i = 0; i < numPlayers; i++) {
        playerList.push(new Player("gltf path"))
    }
    model.animate(() => {
        for (let i = 0; i < numPlayers; i++) {
            playerList[i].update()
        }
    });
}

