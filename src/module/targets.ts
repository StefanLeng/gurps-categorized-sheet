import { convertModifiers } from './util.js';

interface Hitlocation {
    where: string;
    dr: string;
    penalty: string;
    split?: {
        [index: string]: number;
    };
}
interface Target {
    name: string;
    targetmodifiers: { mod: string }[];
    hitlocations: {
        [index: string]: Hitlocation;
    };
}

function getToken(actor: Actor) {
    const tokens: TokenDocument[] = game.scenes.current.tokens.filter((d: TokenDocument) => d.actorId === actor.id);
    if ((tokens.length = 1)) return tokens[0].object;
    return undefined;
}

function calculateRange(token1: Token | null | undefined, token2: Token | null | undefined) {
    if (!token1 || !token2) return undefined;
    if (token1 === token2) return undefined;
    if (!canvas.scene) return undefined;

    const ruler = new CONFIG.Canvas.rulerClass(game.user);

    let dist = canvas.grid.measurePath([token1.document, token2.document]).distance;

    if (game.release.generation === 12) {
        const verticalDistance = Math.abs(token1.document.elevation - token2.document.elevation);
        dist = Math.sqrt(Math.pow(dist, 2) + Math.pow(verticalDistance, 2)) - 1;
    }

    const yards = GURPS.Length.from(dist, canvas.scene.grid.units).to(GURPS.Length.Unit.Yard).value;
    return {
        yards: Math.ceil(dist),
        modifier: ruler.yardsToRangePenalty(yards),
    };
}

export function targets(actor: Actor, ranged: boolean) {
    const results = [];
    for (const target of Array.from(game.user.targets as Set<Token>)) {
        const result: Target = { name: '', targetmodifiers: [], hitlocations: {} };
        result.name = target.name;

        if (target.actor) {
            const system = target.actor.system as any;

            result.targetmodifiers = target.actor ? convertModifiers(system.conditions.target.modifiers) : [];

            result.hitlocations = system.hitlocations;
        }
        if (ranged) {
            const mod = calculateRange(getToken(actor), target);
            if (mod && mod.modifier !== 0)
                result.targetmodifiers.push({
                    mod: GURPS.gurpslink(
                        `[${mod.modifier} range to target ${target.actor?.name} (${mod.yards} ${canvas.scene?.grid.units})]`,
                    ),
                });
        }
        results.push(result);
    }
    return results;
}
