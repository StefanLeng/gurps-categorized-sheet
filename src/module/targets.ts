import { convertModifiers } from './util.js';
import { SYSTEM_ID, SETTING_USE_SIZE_MODIFIER_DIFFERENCE_IN_MELEE } from './constants.ts';

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

    const path = canvas.grid.measurePath([token1.document, token2.document]);
    let dist = canvas.grid.isGridless ? path.distance : path.spaces;

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

function getSizeModifier(source: Token | null | undefined, target: Token | null | undefined): string | undefined {
    if (!source?.actor || !target?.actor) return undefined;
    if (source === target) return undefined;
    if (!game.settings.get(SYSTEM_ID, SETTING_USE_SIZE_MODIFIER_DIFFERENCE_IN_MELEE)) return undefined;

    const attackerSM = (foundry.utils.getProperty(source.actor, 'system.traits.sizemod') || 0) as number;
    const targetSM = (foundry.utils.getProperty(target.actor, 'system.traits.sizemod') || 0) as number;
    const sizeDiff = targetSM - attackerSM;
    if (sizeDiff !== 0) {
        const smText = `${sizeDiff >= 0 ? '+' : ''}${sizeDiff}`;
        return game.i18n.format('GURPS.modifiersSizeDifference', {
            sm: smText,
            sourceSM: attackerSM,
            targetSM: targetSM,
        });
    }
    return undefined;
}

export function targets(actor: Actor, ranged: boolean) {
    const results = [];
    for (const target of Array.from(game.user.targets as Set<Token>)) {
        const result: Target = { name: '', targetmodifiers: [], hitlocations: {} };
        result.name = target.name;

        if (target.actor) {
            const system = target.actor.system as any;

            const targetMods = system.conditions.target.modifiers as Array<string>;
            const filterdMods = targetMods.filter((s) => !s.includes(ranged ? '#melee' : '#ranged'));

            result.targetmodifiers = target.actor ? convertModifiers(filterdMods) : [];

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
        } else {
            const mod = getSizeModifier(getToken(actor), target);
            if (mod)
                result.targetmodifiers.push({
                    mod: GURPS.gurpslink(`[${mod}]`),
                });
        }
        results.push(result);
    }
    return results;
}
