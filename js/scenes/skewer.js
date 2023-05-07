import { g2 } from "../util/g2.js";
import * as cg from "../render/core/cg.js";
import { lcb, rcb } from '../handle_scenes.js';
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";

let foodOnTable = [];
let foodOnSkewer = [];
let foodOnTray = [];
const foodScale = { 'Tomato': .08, 'Marshmallow': [.08, .05, .05], 'Sausage': .04 };
const foodRadius = { 'Tomato': .08, 'Marshmallow': .07, 'Sausage': .06 };
const foodOffset = { 'Tomato': .08, 'Marshmallow': .07, 'Sausage': .52 };
const foodColor = { 'Tomato': 'red', 'Marshmallow': 'white', 'Sausage': 'brown' };

let number = 0;
let totalOffset = 0.16;
let trayOffset = 0.16;
let lastOffset = totalOffset;
let timeLastClick = 0;

// const posLoc = [[-.3,.82,0],[0,.82,0],[.3,.82,0],
//                   [-.3,.82,.3],[0,.82,.3],[.3,.82,.3],
//                   [-.3,.82,-.3],[0,.82,-.3],[.3,.82,-.3]];

const posLoc = [[-1.8, .89, 2.4], [-1.8, .89, 2.1], [-1.8, .89, 1.8],
[-1.8, .89, 1.3], [-1.8, .89, 1], [-1.8, .89, .7]];

const skewerPos = [0, 0, -1.83];
const skewerScale = [.002, .002, 1.8];

const skewerOnTrayPos = [0, .87, -.3];
const skewerOnTrayRightPos = [.35, .87, .05];
const skewerOnTrayLeftPos = [-.45, .87, -.68];

const degree90 = 1.5708;

export const init = async model => {

    class Food {
        constructor(obj, originPos, type) {
            this.obj = obj;
            this.pos = [0, 0, 0];
            this.m = cg.mTranslate(originPos);
            this.scale = foodScale[type];
            this.radius = foodRadius[type];
            this.type = type;
            this.offset = foodOffset[type];
            this.posOnTray = [0, 0, 0];
        }
    }

    class Game {
        constructor(gameDuration) {
            this.startTime = 0;
            this.gameDuration = gameDuration;
            this.score = 0;
            this.foodPool = ['Tomato', 'Sausage', 'Marshmallow'];
            this.max = 3;
            this.min = 2;
            this.lastOrderTime = 0;
            this.curOrders = []
        }

        getCountdown(curTime) {
            return Math.max(this.gameDuration - (curTime - this.startTime), 0);
        }

        getRandomInt(max, min) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        generateRandomOrder() {
            let order = [];
            let numberOfFood = this.getRandomInt(this.max, this.min);
            for (let i = 0; i < numberOfFood; i++) {
                const randomIndex = Math.floor(Math.random() * this.foodPool.length);
                order.push(this.foodPool[randomIndex]);
            }
            // this.curOrders.push(order);
            return order;
        }

        shouldCreateNewOrder(curTime) {
            if (this.getCountdown < 0) return false;
            let timeDiff = curTime - this.lastOrderTime;
            let threshold = this.getRandomInt(15, 10);
            if (timeDiff > threshold) {
                this.lastOrderTime = curTime;
                return true;
            }
            return false;
        }
    }

    // let orderWidgets = [];
    /*
    Functions
    */
    let getSpawnLoc = () => {
        for (const p of posLoc) {
            let flag = false;
            for (let f of foodOnTable) {

                let strF = f.m.slice(12, 15).map(element => String(element)).join(',');
                // g2.addWidget(menu, 'textbox', .5, .1, '#98fb98', strF, () => { });
                let strP = p.map(element => String(element)).join(',');
                // g2.addWidget(menu, 'textbox', .5, .3, '#98fb98', strP, () => { });
                if (strF == strP) {
                    flag = true;
                    break;
                }
            }
            if (!flag) return p;
        }

        return [0, 0, 0];
    }

    let isInBall = (obj, radius, bGlobal) => {
        let center = obj.getMatrix().slice(12, 15);
        if (bGlobal) center = obj.getGlobalMatrix().slice(12, 15);

        let point = rcb.projectOntoBeam(center);
        let diff = cg.subtract(point, center);
        // g2.addWidget(menu, 'textbox', .3, .1, '#98fb98', center.toString(), () => { });
        return cg.norm(diff) < radius;
    }

    let isInAny = () => {
        for (let f of foodOnTable) {
            let bIfIn = false;
            if (f.type == 'Sausage') {
                let child1 = f.obj.child(0);
                let child2 = f.obj.child(1);
                bIfIn = isInBall(child1, f.radius, true) || isInBall(child2, f.radius, true) || isInBall(f.obj, f.radius, false);
            } else {
                bIfIn = isInBall(f.obj, f.radius, false);
            }

            if (bIfIn) {
                return f;
            }
        }
        return null;
    }

    /*
    Menu
    */
    let a = [-1, 0, 0, -1, 0, 0], A = [1, 0, 0, 1, 0, 0],
        b = [0, -1, 0, 0, -1, 0], B = [0, 1, 0, 0, 1, 0],
        c = [0, 0, -1, 0, 0, -1], C = [0, 0, 1, 0, 0, 1];
    clay.defineMesh('leaves', clay.trianglesMesh([a, b, C, a, B, c,]));

    let createTomato = () => {
        let t = model.add('sphere').color(1, 0, 0);
        let leave = t.add('leaves').color(0, 1, 0);
        let leave1 = t.add('leaves').color(0, 1, 0);
        let leave2 = t.add('leaves').color(0, 1, 0);
        leave.identity().move(.05, 1.1, .25).turnZ(.3).scale([.8, .1, .5]);
        leave2.identity().move(.3, 1, .15).turnY(1.5).turnZ(.3).scale([.8, .1, .5]);
        leave1.identity().move(-.1, 1, -.15).turnY(3.8).turnZ(.2).scale([.8, .1, .5]);
        return t;
    }

    let createMarshmallow = () => {
        let c = model.add('tubeX').color(1, 1, 1);
        return c;
    }

    let createSausage = () => {
        let top = model.add('sphere').color(105 / 256, 31 / 256, 31 / 256);
        let s = top.add('tubeX');
        let btn = top.add('sphere');

        btn.identity().move(6, 0, 0);
        s.identity().move(3, 0, 0).scale([3, 1, 1]);
        return top;
    }

    let menu = model.add('cube').texture(() => {
        g2.setColor('white');
        // g2.fillRect(.1,0,.8,1);
        g2.fillRect(.1, 0, .8, 1);
        // g2.fillRect(.1, 0, .8, .5);
        // g2.textHeight(.09);
        g2.setColor('black');
        g2.fillText('Menu', .5, .9, 'center');

        g2.drawWidgets(menu);
    });

    g2.addWidget(menu, 'button', .5, .7, '#98fb98', 'Marshmallow', () => {

        let k = getSpawnLoc();
        let c = createMarshmallow();
        const newFood = new Food(c, k, 'Marshmallow');
        foodOnTable.push(newFood);
    });

    g2.addWidget(menu, 'button', .5, .5, '#98fb98', 'Sausage', () => {
        let k = getSpawnLoc();
        let top = createSausage();
        const newFood = new Food(top, k, 'Sausage');
        foodOnTable.push(newFood);
    });

    g2.addWidget(menu, 'button', .5, .3, '#98fb98', 'Tomato', () => {
        let t = createTomato();
        let k = getSpawnLoc();
        const newFood = new Food(t, k, 'Tomato');
        foodOnTable.push(newFood);
    });

    /*
    HUD
    */
    let gameStat = model.add('cube').texture(() => {
        // g2.setColor('white');
        // g2.fillRect(.1,0,.8,1);
        // g2.fillRect(.1, 0, .8, .5);
        g2.textHeight(.09);
        g2.setColor('black');
        g2.fillText('Score: ', .4, .1, 'right');

        g2.drawWidgets(gameStat);
    });

    let numberOfW = 0;
    // let createNewOrder = (foodLst) => {
        let newOrderWidget = model.add('cube').texture(() => {
            g2.setColor('grey');
            // g2.fillRect(.1,0,.8,1);
            g2.fillRect(.1, 0, 1, 1);
            g2.textHeight(.09);

            // for (let i = 0; i < foodLst.length; i++) {
            //     let f = foodLst[i];
            //     g2.setColor(foodColor[f]);
            //     g2.fillText(f, .5, .8 - i * .2, 'center');
            // }

            for (let i = 0; i < newOrderWidget.foodLst.length; i++) {
                let f = newOrderWidget.foodLst[i];
                g2.setColor(foodColor[f]);
                g2.fillText(f, .5, .8 - i * .2, 'center');
            }

            g2.drawWidgets(newOrderWidget);
        });
    //     orderWidgets.push([foodLst, newOrderWidget]);
    // }

    let gameEndW = null;
    let GameEnd = (score) => {
        let EndWidget = model.add('cube').texture(() => {
            g2.setColor('white');
            // g2.fillRect(.1,0,.8,1);
            g2.fillRect(.1, 0, 1, .5);
            g2.textHeight(.09);
            g2.setColor('black');
            g2.fillText(`Your Score: `, .5, .4, 'center');
            g2.setColor('black');
            g2.fillText(score.toString(), .5, .2, 'center');

            g2.drawWidgets(EndWidget);
        });
        return EndWidget;
    }

    /*
    Trashcan
    */
    let trashcan = model.add('cube').texture(() => {
        g2.setColor('green');
        // g2.fillRect(.1,0,.8,1);
        g2.fillRect(0, 0, 1, 1.2);
        // g2.setColor('white');
        // g2.fillText('Menu', .5, .9, 'center');

        g2.drawWidgets(trashcan);
    });
    g2.myAddWidget(trashcan, 'mybutton', .5, .5, 1, 2, .2, 'white', '#04d600', 'Trash', () => {
        for (let f of foodOnSkewer) {
            model.remove(f.obj);
        }
        foodOnSkewer = [];
        totalOffset = .16;
    });

    let skewer = model.add('cube').texture('../media/textures/metal.jpg');
    let skewerOnTray = model.add('cube').texture('../media/textures/metal.jpg');

    /*
    Table mesh
    */
    model.setTable(false);

    clay.defineMesh('table', clay.combineMeshes([
        ['cube', cg.mScale(11, .2, 7), [53 / 256, 30 / 256, 16 / 256]], // shape, matrix, color
        ['cube', cg.mMultiply(cg.mScale(7, 4, 5), cg.mTranslate(0, -1, -.2)), [121 / 256, 92 / 256, 50 / 256]], // shape, matrix, color
    ]));

    clay.defineMesh('tableWTray', clay.combineMeshes([
        ['cube', cg.mScale(11, .2, 7), [53 / 256, 30 / 256, 16 / 256]], // shape, matrix, color
        ['cube', cg.mMultiply(cg.mScale(7, 4, 5), cg.mTranslate(0, -1, -.2)), [121 / 256, 92 / 256, 50 / 256]], // shape, matrix, color
        // [ 'cube', cg.mMultiply(cg.mScale(3.5,.1,3), cg.mTranslate(0,1.7,0)), [222/256,184/256,135/256] ],
        ['cube', cg.mMultiply(cg.mScale(.1, .1, 3), cg.mTranslate(34, 3.3, 0)), [186 / 256, 140 / 256, 99 / 256]],
        ['cube', cg.mMultiply(cg.mScale(.1, .1, 3), cg.mTranslate(-34, 3.3, 0)), [186 / 256, 140 / 256, 99 / 256]],
        ['cube', cg.mMultiply(cg.mScale(3.5, .1, .1), cg.mTranslate(0, 3.3, 30)), [186 / 256, 140 / 256, 99 / 256]],
        ['cube', cg.mMultiply(cg.mScale(3.5, .1, .1), cg.mTranslate(0, 3.3, -30)), [186 / 256, 140 / 256, 99 / 256]],
    ]));

    clay.defineMesh('tableWCuttingBoard', clay.combineMeshes([
        ['cube', cg.mScale(11, .2, 7), [53 / 256, 30 / 256, 16 / 256]], // shape, matrix, color
        ['cube', cg.mMultiply(cg.mScale(7, 4, 5), cg.mTranslate(0, -1, -.2)), [121 / 256, 92 / 256, 50 / 256]],
        ['cube', cg.mMultiply(cg.mScale(4.8, .1, 2.8), cg.mTranslate(1.1, 1.7, 0)), [1, 1, 1]],
        ['cube', cg.mMultiply(cg.mScale(4.8, .1, 2.8), cg.mTranslate(-1.1, 1.7, 0)), [1, 1, 1]],
    ]));

    let a1 = [-1, 0, 0, -1, 0, 0], a2 = [1, 0, 0, 1, 0, 0],
        b1 = [0, -1.8, 0, 0, -1, 0], b2 = [0, .05, 0, 0, 1, 0],
        c1 = [0, 0, -1, 0, 0, -1], c2 = [0, 0, 1, 0, 0, 1];
    clay.defineMesh('arrow', clay.trianglesMesh([a1, b1, c2, a1, b2, c1, a2, b1, c1, a2, b2, c2, a1, c2, b2, a2, c1, b2, a2, c2, b1, a1, c1, b1]));
    let arrowHead = model.add('arrow').color([165 / 256, 41 / 256, 0]);

    let tableFront = model.add('tableWTray');
    let tray = tableFront.add('cube').color([222 / 256, 184 / 256, 135 / 256]);
    // let test = createMarshmallow();
    let tableLeft = model.add('tableWCuttingBoard');
    let tableRight = model.add('tableWTray');
    let tableBack = model.add('table');

    let gameObj = new Game(60);
    let bFirstOrder = true;
    let needNewOrder = false;

    model.animate(() => {
        /*
        HUD
        */
        //    console.log(model.time);
        let timeLeft = gameObj.getCountdown(model.time);
        if (timeLeft == 0) {
            if (gameEndW == null) {
                gameEndW = GameEnd(gameObj.score);
                model.remove(gameStat);
                model.remove(newOrderWidget);
                model.remove(arrowHead);
                // for (let w in orderWidgets) {
                //     model.remove(w);
                // }
            }

            gameEndW.hud().scale(.4, .4, .0001);

        } else {
            let minute = Math.floor(timeLeft / 60);
            let second = timeLeft - minute * 60;
            let countDown = `${minute.toFixed()} : ${second.toFixed()}`;
            g2.myAddWidget(gameStat, 'mytextbox', .5, .35, .4, .1, .1, 'black', '#ffffff', countDown, value => { });
            g2.myAddWidget(gameStat, 'mytextbox', .6, .1, .4, .1, .1, 'black', '#ffffff', gameObj.score.toString(), value => { });

            //    if(((model.time - lastCheck > 2) && gameObj.shouldCreateNewOrder(model.time)) || bFirstOrder)
            //here
            // if (bFirstOrder || orderWidgets.length == 0) {
            if (bFirstOrder || needNewOrder)
            {
                // console.log("should create");
                bFirstOrder = false;
                let foodLst = gameObj.generateRandomOrder();
                //here
                // createNewOrder(foodLst);
                newOrderWidget.foodLst = foodLst;
                // console.log(`new Order:${foodLst.join(',')}`);
                needNewOrder = false;
            }

            gameStat.hud().move(1.4, .7, -1.5).scale(.5, .5, .0001);
            //here
            // for (let i = 0; i < orderWidgets.length; i++) {

            //     //  orderWidgets[i][1].hud().move(-.9+(i*.5),.7,-1).scale(.3,.3,.0001);;
            //     // console.log(`new Order:${orderWidgets[i][0].join(',')}`);
            //     orderWidgets[i][1].hud().move(-.9 + (i * .5), .7, -1.5).scale(.4, .4, .0001);
            // }
            newOrderWidget.hud().move(-.9 , .7, -1.5).scale(.4, .4, .0001);


            // [[-1.8,.82,2.4], [-1.8,.82,2.1],[-1.8,.82,1.8],
            //           [-1.8,.82,1.3], [-1.8,.82,1],[-1.8,.82,.7]
            // test.setMatrix(cg.mTranslate(0,.91,-.3)).scale(.1);
            // arrowHead.identity().move(0, 1.3, 0).turnZ(-.75-degree90).scale(.3);

            /*
            Food on Skewer
            */
            let hitFood = isInAny();
            if (hitFood) {
                // hitFood.obj.color(1,.5,.5);
                let rightTrigger = buttonState.right[0].pressed;
                if (rightTrigger) {
                    foodOnTable = foodOnTable.filter(item => item !== hitFood);
                    number += 1;
                    // g2.addWidget(menu, 'textbox', .5, .1, '#ffffff', number.toString(), value => { });
                    // let offset = number == 1 ? .2 : .2 +(number-1)*(hitFood.offset);
                    if (hitFood.type == 'Sausage') {
                        totalOffset += hitFood.offset / 12;
                    } else {
                        totalOffset += hitFood.offset / 2;
                    }
                    // totalOffset += hitFood.offset;
                    hitFood.pos = [0, 0, -totalOffset];
                    foodOnSkewer.push(hitFood);
                    totalOffset += hitFood.offset / 2 + .1;
                }
            }

            /*
            Put on tray
            */
            if (isInBall(tray, .3, true)) {
                arrowHead.identity().move(0, 1.3 + .05 * Math.sin(model.time), 0).scale(.05);
                let rightTrigger2 = buttonState.right[1].pressed;
                if (rightTrigger2) {
                    let timediff = model.time - timeLastClick;
                    if (timediff > .5) {
                        timeLastClick = model.time;
                        if (foodOnSkewer.length != 0 && foodOnTray.length == 0) {
                            let foodName = [];
                            // put the skewer on the tray
                            for (let f of foodOnSkewer) {
                                foodName.push(f.type);
                                if (f.type == 'Sausage') {
                                    trayOffset += f.offset / 4;
                                }
                                else {
                                    trayOffset += f.offset / 2;
                                }

                                f.posOnTray = [0, 0, trayOffset];
                                foodOnTray.push(f);

                                if (f.type == 'Sausage') {
                                    trayOffset += f.offset / 7;
                                } else {
                                    trayOffset += f.offset / 2 + .1;
                                }
                                // trayOffset += f.offset/2+.1;
                            }
                            foodOnSkewer = [];
                            lastOffset = totalOffset;
                            totalOffset = .16;


                            // if (gameObj.checkOrderCorrectness(foodName))
                            // {
                                //here
                            // for (let w of orderWidgets) {
                                // if (w[0].join(',') == foodName.join(',')) {
                                    if (newOrderWidget.foodLst.join(',') == foodName.join(',')) {
                                    gameObj.score += 1;
                                    //here
                                    // model.remove(w[1]);
                                    // orderWidgets = orderWidgets.filter(item => item !== w);
                                    // orderWidgets =[];
                                    for (let f of foodOnTray) {
                                        model.remove(f.obj);
                                    }
                                    foodOnTray = [];
                                    trayOffset = .16;
                                    needNewOrder = true;
                                    // createNewOrder(gameObj.generateRandomOrder());
                                    // break;
                                }
                            // }
                            // }
                        }
                        else if (foodOnSkewer.length == 0 && foodOnTray.length != 0) {
                            for (let f of foodOnTray) {
                                foodOnSkewer.push(f);
                            }
                            foodOnTray = [];
                            totalOffset = lastOffset;
                            trayOffset = .16;
                        }
                    }
                }
            } else {
                arrowHead.identity().scale(0);
            }
        }



        /*
        Setting location
        */
       /*
        Tablehud
        */
        tableFront.identity().move(0, .8, -.3).scale(.1);
        tray.identity().move(0, .15, 0).scale(3.5, .1, 3);
        tableBack.identity().move(0, .8, 3.2).scale(.1);
        tableLeft.identity().move(-1.8, .8, 1.5).turnY(degree90).scale(.1);
        tableRight.identity().move(1.8, .8, 1.5).turnY(degree90).scale(.1);

        menu.identity().move(-.6, 1.3, 3.2).turnY(degree90 * 2).scale(.4, .4, .0001);
        skewer.setMatrix(rcb.beamMatrix())
            .move(skewerPos).turnZ(.5).scale(skewerScale);

        trashcan.identity().move(1.8, .83, 1.5).turnX(degree90).scale(.29, .35, .0001);

        for (let f of foodOnTable) {
            f.obj.setMatrix(f.m).move(f.pos).turnY(.4).scale(f.scale);
        }

        for (let f of foodOnSkewer) {
            f.m = rcb.beamMatrix();
            if (f.type == 'Sausage') {
                f.obj.setMatrix(f.m).move(f.pos).turnY(degree90).scale(f.scale);
            } else {
                f.obj.setMatrix(f.m).move(f.pos).turnX(-1.4).scale(f.scale);
            }

        }

        if (foodOnTray.length != 0) {
            skewerOnTray.setMatrix(cg.mTranslate(skewerOnTrayPos)).turnY(degree90 / 2).scale([.002, .002, .4]);
            let v = cg.subtract(skewerOnTrayLeftPos, skewerOnTrayRightPos);
            let d = cg.distance(skewerOnTrayLeftPos, skewerOnTrayRightPos);

            for (let f of foodOnTray) {
                let multi = f.posOnTray[2] / d;
                let newV = cg.scale(v, multi);
                f.m = cg.mMultiply(cg.mTranslate(skewerOnTrayRightPos), cg.mTranslate(newV));

                if (f.type == 'Sausage') {
                    multi = f.posOnTray[2] / d;
                    newV = cg.scale(v, multi);
                    f.m = cg.mMultiply(cg.mTranslate(skewerOnTrayRightPos), cg.mTranslate(newV));
                    f.obj.setMatrix(f.m).turnY(-degree90 / 2.3).scale(.02);
                } else if (f.type == 'Tomato') {
                    // console.log(newV);    
                    f.obj.setMatrix(f.m).turnZ(degree90 * 1.2).turnX(-degree90 / 1.5).scale(.05);
                } else {
                    f.obj.setMatrix(f.m).turnY(degree90 / 1.8).scale(.04);
                }
            }
        } else {
            skewerOnTray.identity().scale(0);
        }
    });
}