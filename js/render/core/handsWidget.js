import { jointMatrix } from "./handtrackingInput.js";
import * as cg from "./cg.js";

export function HandsWidget(widgets) {
    this.pinch = { left: 0, right: 0 };
    this.bend = { left: 0, right: 0 };
    this.matrix = { left: cg.scale(0), right: cg.scale(0) };
    let fingerColor = { left : [ null, null, null, null, null ],
                        right: [ null, null, null, null, null ] };
    this.setFingerColor = (hand, finger, color) =>
       fingerColor[hand][finger] = color ? color.slice() : null;

    this.getMatrix = (hand, finger, joint) => jointMatrix[hand][5 * finger + joint].mat;

    let hands = widgets.add();
    let L_joints = hands.add();
    let R_joints = hands.add();

    let L_links  = hands.add();
    let R_links  = hands.add();

    for (let finger = 0 ; finger < 5 ; finger++) {
       for (let i = 0 ; i < 5 ; i++) {
          L_joints.add(finger+i==0 ? 'sphere' : 'sphere2').scale(0);
          R_joints.add(finger+i==0 ? 'sphere' : 'sphere2').scale(0);
       }
       for (let i = 0 ; i < 4 ; i++) {
          L_links.add('tube2').scale(0);
          R_links.add('tube2').scale(0);
       }
    }

    this.update = () => {
        let th = [.0115,.01,.01,.01,.0085];
        if(window.handtracking) {
            hands.identity();
            for (let finger = 0 ; finger < 5 ; finger++) {
	       let leftColor  = fingerColor.left [finger] ? fingerColor.left [finger] : [1,.5,.3];
	       let rightColor = fingerColor.right[finger] ? fingerColor.right[finger] : [1,.5,.3];
               let aim = (link,A,B) => {
                  let a = A.slice(12,15);
                  let b = B.slice(12,15);
                  let c = cg.mix(a,b,.5,.5);
                  let d = cg.mix(a,b,-.5,.5);
                  link.identity().move(c).aimZ(d).scale(th[finger],th[finger],cg.norm(d));
               }
               for (let i = 1 ; i < 5 ; i++) {
                  let nj = 5 * finger + i;
                  L_joints.child(nj).setMatrix(jointMatrix.left [nj].mat).scale(th[finger]).color(leftColor);
                  R_joints.child(nj).setMatrix(jointMatrix.right[nj].mat).scale(th[finger]).color(rightColor);
                  if (finger == 0 && i == 2 || i == 1) {
                     L_joints.child(nj).scale(1,1,.001).color(0);
                     R_joints.child(nj).scale(1,1,.001).color(0);
                  }
                  if (finger == 0 && i == 1) {
                     L_joints.child(nj).scale(0);
                     R_joints.child(nj).scale(0);
                  }
               }
               for (let i = 1 ; i < 4 ; i++) {
                  let nj = 5 * finger + i;
                  let nl = 4 * finger + i;
                  L_links.child(nl).color(leftColor);
                  R_links.child(nl).color(rightColor);
                  aim(L_links.child(nl), jointMatrix.left [nj].mat, jointMatrix.left [nj+1].mat);
                  aim(R_links.child(nl), jointMatrix.right[nj].mat, jointMatrix.right[nj+1].mat);
                  if (finger == 0 && i == 1) L_links.child(nl).scale(0);
                  if (finger == 0 && i == 1) R_links.child(nl).scale(0);
               }
            }
	    let measureBend = jointMatrix => {
	       let a = jointMatrix[0].mat.slice(8,11);
	       let b = jointMatrix[9].mat.slice(8,11);
	       return 1 - cg.dot(a,b);
	    }
	    let touchColor = [ 0, [1,0,0], [1,1,0], [0,1,0], [0,0,1] ];
	    let touchState = joints => {
	       let a = joints.child(4).getMatrix().slice(12,15);
	       for (let finger = 1 ; finger < 5 ; finger++) {
	          let b = joints.child(5*finger + 4).getMatrix().slice(12,15);
		  let d = cg.mix(a,b,-.5,.5);
		  if (cg.norm(d) < (finger == 4 ? .01 : .006))
		     return finger;
	       }
	       return 0;
	    }
	    this.matrix.left  = jointMatrix.left [0].mat;
	    this.matrix.right = jointMatrix.right[0].mat;
            L_joints.child(0).setMatrix(this.matrix.left ).move( .005,0,-.045).scale(.03,.015,.03);
            R_joints.child(0).setMatrix(this.matrix.right).move(-.005,0,-.045).scale(.03,.015,.03);
            L_joints.child(0).color(touchColor[this.pinch.left  = touchState(L_joints)]);
            R_joints.child(0).color(touchColor[this.pinch.right = touchState(R_joints)]);
	    this.bend.left  = measureBend(jointMatrix.left);
	    this.bend.right = measureBend(jointMatrix.right);
        } else 
            hands.scale(0);
    };
 }
