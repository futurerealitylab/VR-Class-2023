import * as cg from "../render/core/cg.js"; 

let customizeCurve = (x) => {
    let y = 0.0;
    let a = .8;
    let b = -.1;
    let c = 2.4;
    if (x < .2) {
        y = 3/2* x;
    }else{
        y = Math.max((a**x)/c+b, 0);
    }
    return y;
}

export class SimulateMovement {
    constructor(position) {
        this.lastPosition = position;
        this.forceEvents = [];
        this.lastCheckTime = 0.0;
        this.lastVelocity = [0,0,0];
    }

    applyForce(currentTime, direction){
        this.forceEvents.push({time: currentTime, direction:direction});
    }

    calculateTotalVelocity (currentTime) {
        let tempForceEvent = []
        let totalVelocity = [0,0,0];
        for (const event of this.forceEvents) {
            let elapsed = currentTime - event.time;
            if (elapsed == 0.0) {elapsed += .1}
            let velocity = customizeCurve(elapsed);
            // console.log( currentTime);
            // console.log("cut");
            // console.log( event.time);
            if (velocity > 0) { 
                tempForceEvent.push(event);
                totalVelocity = cg.add(totalVelocity, cg.scale(event.direction, velocity));
            } 
        }
        this.forceEvents = tempForceEvent;
        return totalVelocity;
    }

    getPosition(currentTime){
        // designed to be called every frame
        const currentVelocity = this.calculateTotalVelocity(currentTime);
        if (this.forceEvents.length == 0) {return this.lastPosition;}
        let sum = cg.add(this.lastVelocity,currentVelocity);
        let avgV = cg.scale(cg.add(this.lastVelocity,currentVelocity), 1/2);
        const currentDisplacement = cg.scale(avgV, (currentTime - this.lastCheckTime));

        this.lastPosition = cg.add(this.lastPosition, currentDisplacement);
        this.lastCheckTime = currentTime;
        this.lastVelocity = currentVelocity;
        
        return this.lastPosition
    }
}
