import { SheetOTF } from './types.ts';
import { getMergedSettings } from './actor-settings.ts';

const defenceMods: SheetOTF[] = [
    { key: 'g00001', region: 'defence', modifier: '["+3 to Dodge (retreat)"+3 to Dodge (retreat)]' },
    { key: 'g00002', region: 'defence', modifier: '["+1 to Block/Parry (retreat)"+1 to Block/Parry (retreat)]' },
    { key: 'g00003', region: 'defence', modifier: '["−2 attacked from side"-2 to defence (attacked from side)]' },
    {
        key: 'g00004',
        region: 'defence',
        modifier: '["−1 to defenses due to Deceptive attack"-1 to defenses due to Deceptive attack]',
    },
    {
        key: 'g00005',
        region: 'defence',
        modifier: '["+2 Feverish Defense *Cost 1FP"+2 Feverish Defense *Cost 1FP]',
        flags: {
            extraEffort: true,
        },
    },
    {
        key: 'g00006',
        region: 'defence',
        modifier:
            '["Acrobatic Dodge"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [Dodge]]',
        skillRequiered: ['acrobatics'],
    },
    {
        key: 'g00007',
        region: 'defence',
        modifier:
            '["Acrobatic Dodge (Retreat)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+3 Retreat]\\\\/r [Dodge]]',
        skillRequiered: ['acrobatics'],
    },
    {
        key: 'g00008',
        region: 'defence',
        modifier:
            '["Acrobatic Dodge (Feverish)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+2 Feverish Defense *Cost 1FP]\\\\/r [Dodge]]',
        flags: {
            extraEffort: true,
        },
        skillRequiered: ['acrobatics'],
    },
    {
        key: 'g00009',
        region: 'defence',
        modifier:
            '["Acrobatic Dodge (Feverish/Retreat)"/if [S:Acrobatics|DX-6] /r [+2 Acrobatics] /else [-2 Failed Acrobatics]\\\\/r [+2 Feverish Defense *Cost 1FP]\\\\/r [+3 Retreat]\\\\/r [Dodge]]',
        flags: {
            extraEffort: true,
        },
        skillRequiered: ['acrobatics'],
    },
    { key: 'g00010', region: 'melee', modifier: '["+4 to hit (Telegraphic Attack)"+4 to hit (Telegraphic Attack)]' },
    { key: 'g00011', region: 'melee', modifier: '["−2 to hit (Deceptive Attack)"-2 to hit (Deceptive Attack)]' },
    {
        key: 'g00012',
        region: 'melee',
        modifier: '["−4 to hit (Move and Attack) *Max:9"-4 to hit (Move and Attack) *Max:9]',
    },
    {
        key: 'g00013',
        region: 'melee',
        modifier: '["+0 Heroic Charge *Cost 1FP"+0 Heroic Charge *Cost 1FP]',
        flags: {
            extraEffort: true,
        },
    },
    {
        key: 'g00014',
        region: 'melee',
        modifier: '["+2 damage (Mighty Blow) *Cost 1FP"+2 damage (Mighty Blow) *Cost 1FP]',
        flags: {
            extraEffort: true,
        },
    },
    { key: 'g00015', region: 'melee', modifier: '["+4 to hit (Determined Attack)"+4 to hit (Determined Attack)]' },
    { key: 'g00016', region: 'melee', modifier: '["+2 damage (Strong Attack)"+2 damage (Strong Attack)]' },
    {
        key: 'g00017',
        region: 'melee',
        modifier: '["-3 Rapid Strike (Weapon Master)" -3 Rapid Strike]',
        traitRequiered: ['Weapon Master'],
    },
    {
        key: 'g00018',
        region: 'melee',
        modifier: '["-3 Rapid Strike (TbaM)" -3 Rapid Strike]',
        traitRequiered: ['Trained by a Master'],
    },
    {
        key: 'g00019',
        region: 'melee',
        modifier: '["-6 Rapid Strike" -6 Rapid Strike]',
        traitsForbidden: ['Weapon Master', 'Trained by a Master'],
    },
    {
        key: 'g00020',
        region: 'melee',
        modifier: '["-1 Flurry of blows (Weapon Master) *Cost 1FP" -1 Flurry of Blows *Cost 1FP]',
        flags: {
            extraEffort: true,
        },
        traitRequiered: ['Weapon Master'],
    },
    {
        key: 'g00021',
        region: 'melee',
        modifier: '["-1 Flurry of blows (TbaM) *Cost 1FP" -1 Flurry of Blows *Cost 1FP]',
        flags: {
            extraEffort: true,
        },
        traitRequiered: ['Trained by a Master'],
    },
    {
        key: 'g00022',
        region: 'melee',
        modifier: '["-3 Flurry of blows *Cost 1FP" -3 Flurry of Blows *Cost 1FP]',
        flags: {
            extraEffort: true,
        },
        traitsForbidden: ['Weapon Master', 'Trained by a Master'],
    },
    { key: 'g00023', region: 'ranged', modifier: '["+1 Aim"+1 Aim]' },
    { key: 'g00024', region: 'ranged', modifier: '["+1 to hit (Determined Attack)"+1 to hit (Determined Attack)]' },
    {
        key: 'g00025',
        region: 'ranged',
        modifier: '["-3 Rapid Strike (Thrown Weapon, Weapon Master)" -3 Rapid Strike]',
        flags: {
            extraEffort: true,
        },
        traitRequiered: ['Weapon Master'],
    },
    {
        key: 'g00026',
        region: 'ranged',
        modifier: '["-3 Rapid Strike (Thrown Weapon, TbaM)" -3 Rapid Strike]',
        flags: {
            extraEffort: true,
        },
        traitRequiered: ['Trained by a Master'],
    },
    {
        key: 'g00027',
        region: 'ranged',
        modifier: '["-6 Rapid Strike (Thrown Weapon)" -6 Rapid Strike]',
        flags: {
            extraEffort: true,
        },
        traitsForbidden: ['Weapon Master', 'Trained by a Master'],
    },
    {
        key: 'g00028',
        region: 'reactions',
        modifier: '["+2 Successful roll against a appropriate skill" +2 Successful roll against a appropriate skill]',
    },
    { key: 'g00029', region: 'reactions', modifier: '["-2 Repeated attempt" -2 Repeated attempt]' },
].map((i) => {
    return { ...i, active: true, userDefined: false };
});

function isSkillReqeuiementFullfilld(mod: SheetOTF, actor: any): boolean {
    return mod.skillRequiered
        ? mod.skillRequiered.length === 0 || mod.skillRequiered.some((i) => !!GURPS.findSkillSpell(actor, i))
        : true;
}

function isTraitReqeuiementFullfilld(mod: SheetOTF, actor: any): boolean {
    return mod.traitRequiered
        ? mod.traitRequiered.length === 0 || mod.traitRequiered.some((i) => !!GURPS.findAdDisad(actor, i))
        : true;
}

function noForbiddenTraits(mod: SheetOTF, actor: any): boolean {
    return mod.traitsForbidden
        ? mod.traitsForbidden.length === 0 || !mod.traitsForbidden.some((i) => !!GURPS.findAdDisad(actor, i))
        : true;
}

export function getOTFs(region: string, actor: any) {
    const allowExtraEffort: boolean = getMergedSettings(actor).allowExtraEffort;
    const mods = defenceMods
        .filter((i) => i.region === region && i.active)
        .filter((i) => isSkillReqeuiementFullfilld(i, actor))
        .filter((i) => isTraitReqeuiementFullfilld(i, actor))
        .filter((i) => noForbiddenTraits(i, actor))
        .filter((i) => (i.flags?.extraEffort ?? allowExtraEffort) === allowExtraEffort)
        .map((i) => i.modifier);

    return mods.join('');
}
