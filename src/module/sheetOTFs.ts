import { OTFRegion, OTFScope, SheetOTF } from './types.ts';
import { getMergedSettings } from './actor-settings.ts';

function isSkillReqeuiementFullfilled(mod: SheetOTF, actor: any): boolean {
    return mod.skillRequiered
        ? mod.skillRequiered.length === 0 || mod.skillRequiered.some((i) => !!GURPS.findSkillSpell(actor, i))
        : true;
}

function isTraitReqeuiementFullfilled(mod: SheetOTF, actor: any): boolean {
    return mod.traitRequiered
        ? mod.traitRequiered.length === 0 || mod.traitRequiered.some((i) => !!GURPS.findAdDisad(actor, i))
        : true;
}

function noForbiddenTraits(mod: SheetOTF, actor: any): boolean {
    return mod.traitsForbidden
        ? mod.traitsForbidden.length === 0 || !mod.traitsForbidden.some((i) => !!GURPS.findAdDisad(actor, i))
        : true;
}

function isManueverReqeuiementFullfilled(mod: SheetOTF, actor: any): boolean {
    const maneuver = (actor.system as any).conditions.maneuver ?? 'undefined';
    if (maneuver === 'undefined') return true;
    return mod.manueverRequiered
        ? mod.manueverRequiered.length === 0 || mod.manueverRequiered.some((i) => i === maneuver)
        : true;
}

export function getOTFs(region: OTFRegion, actor: any) {
    const allowExtraEffort: boolean = getMergedSettings(actor).allowExtraEffort;
    const mods = getMergedSettings(actor)
        .sheetOTFs.filter((i) => i.region === region && i.active)
        .filter((i) => isSkillReqeuiementFullfilled(i, actor))
        .filter((i) => isTraitReqeuiementFullfilled(i, actor))
        .filter((i) => isManueverReqeuiementFullfilled(i, actor))
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
