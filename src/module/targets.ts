import { convertModifiers } from './util.js';

interface Hitlocation{
    where: string,
    dr: string,
    penalty: string,
    split?:{
        [index: string]: number,
    }
}
interface Target{
    name: string,
    targetmodifiers: {mod:string}[],
    hitlocations: {
        [index: string]: Hitlocation,
    },
}

function getToken(actor :Actor){
    let tokens : TokenDocument[] = game.scenes.current.tokens.filter((d : TokenDocument) => d.actorId === actor.id);
    if(tokens.length = 1)
      return tokens[0].object;
    return undefined;
}

function calculateRange(token1 : Token | null | undefined, token2 : Token | null | undefined) {
    if (!token1 || !token2) return undefined;
    if (token1 == token2) return undefined;

    // const ruler = new Ruler() as Ruler & { totalDistance: number }
    const ruler = new CONFIG.Canvas.rulerClass(game.user);
    ruler._state = Ruler.STATES.MEASURING;
    ruler._addWaypoint({ x: token1.x, y: token1.y }, { snap: false });
    ruler.measure({ x: token2.x, y: token2.y }, { gridSpaces: true });
    const horizontalDistance = ruler.totalDistance;
    const verticalDistance = Math.abs(token1.document.elevation - token2.document.elevation);
    ruler.clear();

    const dist = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2) - 1;
    const yards = ruler.convert_to_yards(dist, canvas.scene?.grid.units);
    return {
      yards: Math.ceil(dist),
      modifier: ruler.yardsToSpeedRangePenalty(yards),
    }
  }

export function targets(actor : Actor) {
    let results = [];
    for (const target of Array.from(game.user.targets as Set<Token>)) {
      let result : Target = {name :"", targetmodifiers: [], hitlocations: {}};
      result.name = target.name;
 
      if (target.actor){
        const system = target.actor.system as any;
    
        result.targetmodifiers = target.actor
            ? convertModifiers(system.conditions.target.modifiers)
            : [];
        
        result.hitlocations = system.hitlocations;
      }
      let mod = calculateRange(getToken(actor), target);
      if (mod && mod.modifier !== 0)
        result.targetmodifiers.push(
          {mod: GURPS.gurpslink(`[${mod.modifier} range to target ${target.actor?.name} (${mod.yards} ${canvas.scene?.grid.units})]`)}
        )
      results.push(result);
    }
    return results;
  }
