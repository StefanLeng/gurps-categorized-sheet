import { convertModifiers } from './util.js';
import { SYSTEM_ID, SETTING_USE_SIZE_MODIFIER_DIFFERENCE_IN_MELEE } from './constants.ts';
import { GurpsActorV2 } from '@module/actor/gurps-actor.ts';
import { ActorType } from '@module/actor/types.ts';

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

function getToken(actor: GurpsActorV2<ActorType.Character>) {
    const tokens = game.scenes?.current?.tokens.filter((d: TokenDocument) => d.actorId === actor.id) ?? [];
    if ((tokens.length = 1)) return tokens[0].object;
    return undefined;
}

function calculateRange(token1: Token | null | undefined, token2: Token | null | undefined) {
    if (!token1 || !token2) return undefined;
    if (token1 === token2) return undefined;
    if (!canvas?.scene) return undefined;
    if (!canvas?.grid) return undefined;
    if (!game.user) return undefined;

    const ruler = new CONFIG.Canvas.rulerClass(game.user);

    const path = canvas.grid.measurePath([token1.document, token2.document], {});
    let dist = canvas.grid?.isGridless ? path.distance : path.spaces;

    if (game.release?.generation === 12) {
        const verticalDistance = Math.abs(token1.document.elevation - token2.document.elevation);
        dist = Math.sqrt(Math.pow(dist, 2) + Math.pow(verticalDistance, 2)) - 1;
    }

    const yards = GURPS.Length.from(dist, canvas.scene.grid.units).to(GURPS.Length.Unit.Yard).value;
    return {
        yards: Math.ceil(dist),
        modifier: (ruler as any).yardsToRangePenalty(yards), //yardsToRangePenalty is a function on the GURPSRuler
    };
}

function getSizeModifier(source: Token | null | undefined, target: Token | null | undefined): string | undefined {
    if (!source?.actor || !target?.actor) return undefined;
    if (source === target) return undefined;
    if (!game.settings?.get(SYSTEM_ID, SETTING_USE_SIZE_MODIFIER_DIFFERENCE_IN_MELEE)) return undefined;

    const attackerSM = (foundry.utils.getProperty(source.actor, 'system.traits.sizemod') || 0) as number;
    const targetSM = (foundry.utils.getProperty(target.actor, 'system.traits.sizemod') || 0) as number;
    const sizeDiff = targetSM - attackerSM;
    if (sizeDiff !== 0) {
        const smText = `${sizeDiff >= 0 ? '+' : ''}${sizeDiff}`;
        return game.i18n?.format('GURPS.modifiersSizeDifference', {
            sm: smText,
            sourceSM: attackerSM.toString(),
            targetSM: targetSM.toString(),
        });
    }
    return undefined;
}

export function targets(actor: GurpsActorV2<ActorType.Character>, ranged: boolean) {
    const results = [] as Target[];
    if (!game.user?.targets) return results;
    for (const target of Array.from(game.user?.targets)) {
        const result: Target = { name: '', targetmodifiers: [], hitlocations: {} };
        result.name = target.name;

        if (target.actor) {
            const system = target.actor.system as any;

            const targetMods = system.conditions.target.modifiers as Array<string>;
            const filteredMods = targetMods.filter((s) => !s.includes(ranged ? '#melee' : '#ranged'));

            result.targetmodifiers = target.actor ? convertModifiers(filteredMods) : [];

            result.hitlocations = system.hitlocationsV2;
        }
        if (ranged) {
            const mod = calculateRange(getToken(actor), target);
            if (mod && mod.modifier !== 0)
                result.targetmodifiers.push({
                    mod: GURPS.gurpslink(
                        `[${mod.modifier} range to target ${target.actor?.name} (${mod.yards} ${canvas?.scene?.grid.units})]`,
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
