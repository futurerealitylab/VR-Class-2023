import * as cg from "../render/core/cg.js";
import "../render/core/clay.js";
const VERTEX_SIZE = 16;
const PI = 3.1415926;
const octHeight=.1; // height of the octagon-shaped platform

let glueMeshes = (a, b) => {
    let c = [];
    for (let i = 0 ; i < a.length ; i++)
        c.push(a[i]);                           // a
    for (let i = 0 ; i < VERTEX_SIZE ; i++)
        c.push(a[a.length - VERTEX_SIZE + i]);  // + last vertex of a
    for (let i = 0 ; i < VERTEX_SIZE ; i++)
        c.push(b[i]);                           // + first vertex of b
    for (let i = 0 ; i < b.length ; i++)
        c.push(b[i]);                           // + b
    return new Float32Array(c);
}

const createOctagonMesh = () => {
    const O=[0,0,0];
    let parts=[];
    for (let i=0; i<8; i+=2){
        let v0 = [Math.cos(2*PI*i/8),Math.sin(2*PI*i/8),0];
        let v1 = [Math.cos(2*PI*(i+1)/8),Math.sin(2*PI*(i+1)/8),0];
        let v2 = [Math.cos(2*PI*(i+2)/8),Math.sin(2*PI*(i+2)/8),0];
        let V=[];
        V.push(clay.vertexArray(v0, [0, 0, 1], [1, 0, 0], [0, 0]));
        V.push(clay.vertexArray(v1, [0, 0, 1], [1, 0, 0], [0, 0]));
        V.push(clay.vertexArray(O, [0, 0, 1], [1, 0, 0], [0, 1]));
        V.push(clay.vertexArray(v2, [0, 0, 1], [1, 0, 0], [0, 0]));
        parts.push(new Float32Array(V.flat()));
    }
    return glueMeshes(glueMeshes(glueMeshes(parts[0],parts[1]),parts[2]),parts[3]);
}

const createOctagonSide = () => {
    let parts=[];
    for (let i=0; i<8; i+=1){
        let v0 = [Math.cos(2*PI*i/8),Math.sin(2*PI*i/8),0];
        let v1 = [Math.cos(2*PI*(i+1)/8),Math.sin(2*PI*(i+1)/8),0];
        let v2 = [Math.cos(2*PI*i/8),Math.sin(2*PI*i/8),-octHeight];
        let v3 = [Math.cos(2*PI*(i+1)/8),Math.sin(2*PI*(i+1)/8),-octHeight];
        let V=[];
        V.push(clay.vertexArray(v1, [0, 0, 1], [1, 0, 0], [0, 0]));
        V.push(clay.vertexArray(v0, [0, 0, 1], [1, 0, 0], [0, 0]));
        V.push(clay.vertexArray(v3, [0, 0, 1], [1, 0, 0], [0, 1]));
        V.push(clay.vertexArray(v2, [0, 0, 1], [1, 0, 0], [0, 0]));
        parts.push(new Float32Array(V.flat()));
    }
    return glueMeshes(glueMeshes(glueMeshes(glueMeshes(parts[0],parts[1]),parts[2]),parts[3]),glueMeshes(glueMeshes(glueMeshes(parts[4],parts[5]),parts[6]),parts[7]));
}

const defineOctTube = () =>{
    clay.defineMesh('oct', createOctagonMesh());
    clay.defineMesh('octSide', createOctagonSide());
    clay.defineMesh('octTubeZ',clay.combineMeshes([
        ['oct',cg.mTranslate(0,0,octHeight/2 ), [1,1,.5] ],
        ['oct',cg.mMultiply(cg.mTranslate(0,0,-octHeight/2 ),cg.mRotateY(PI)), [.3,.5,.6] ],
        ['octSide',cg.mTranslate(0,0,octHeight/2 ), [.5,1,.5] ],
    ]));
    clay.defineMesh('octTubeY',clay.combineMeshes([
        ['octTubeZ',cg.mRotateX(-PI/2), [1,1,1]],
    ]));
    clay.defineMesh('octTubeX',clay.combineMeshes([
        ['octTubeZ',cg.mRotateY(-PI/2), [1,1,1]],
    ]));
}

export default defineOctTube;