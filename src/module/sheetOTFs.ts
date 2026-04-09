import { OTFRegion, OTFScope, SheetOTF } from './types.ts';
import { getMergedSettings } from './actor-settings.ts';

function isSkillRequirementFulfilled(mod: SheetOTF, actor: any): boolean {
    return mod.skillRequired
        ? mod.skillRequired.length === 0 || mod.skillRequired.some((i) => !!GURPS.findSkillSpell(actor, i))
        : true;
}

function isTraitRequirementFulfilled(mod: SheetOTF, actor: any): boolean {
    return mod.traitRequired
        ? mod.traitRequired.length === 0 || mod.traitRequired.some((i) => !!GURPS.findAdDisad(actor, i))
        : true;
}

function noForbiddenTraits(mod: SheetOTF, actor: any): boolean {
    return mod.traitsForbidden
        ? mod.traitsForbidden.length === 0 || !mod.traitsForbidden.some((i) => !!GURPS.findAdDisad(actor, i))
        : true;
}

function isManueverRequirementFulfilled(mod: SheetOTF, actor: any): boolean {
    const maneuver = (actor.system as any).conditions.maneuver ?? 'undefined';
    if (maneuver === 'undefined') return true;
    return mod.manueverRequired
        ? mod.manueverRequired.length === 0 || mod.manueverRequired.some((i) => i === maneuver)
        : true;
}

export function getOTFs(region: OTFRegion, actor: any) {
    const allowExtraEffort: boolean = getMergedSettings(actor).allowExtraEffort;
    const mods = getMergedSettings(actor)
        .sheetOTFs.filter((i) => i.region === region && i.active)
        .filter((i) => isSkillRequirementFulfilled(i, actor))
        .filter((i) => isTraitRequirementFulfilled(i, actor))
        .filter((i) => isManueverRequirementFulfilled(i, actor))
        .filter((i) => noForbiddenTraits(i, actor))
        .filter((i) => (i.flags?.extraEffort ?? allowExtraEffort) === allowExtraEffort)
        .map((i) => i.code);

    return mods.join('');
}

export function newOTF(scope: OTFScope): SheetOTF {
    return {
        key: foundry.utils.randomID(),
        active: true,
        region: '',
        code: '',
        scope: scope,
    };
}
