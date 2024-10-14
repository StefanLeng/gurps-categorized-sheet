interface jumpingDistance{
    heigh: number,
    broad: number,
}

export function calcJumping(
    p_runningStart: number,
    extraEffort: number, 
    basicMove : number, 
    jumpingSkill : number,
    enhancedMove : number,
    superJump : number,
    encumberance : number
 ) : jumpingDistance{
    return {heigh: 0, broad: 0}
 }