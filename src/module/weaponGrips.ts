import type { GurpsActorV2 } from '@module/actor/gurps-actor.ts';
import { getMergedSettings, getActorSettings } from './actor-settings.ts';
import { getSystemSetting } from './settings.ts';
import type { Hand, WeaponGrip2, Weapon2, DisplayMeleeAttackExt, DisplayRangedAttackExt } from './types.ts';
import type { ActorType } from '@module/actor/types.ts';
import { ItemType } from '@module/item/types.ts';
import type { BaseItemModel } from '@module/item/data/base.ts';
import type { MeleeAttackModel } from '@module/action/melee-attack.ts';
import type { RangedAttackModel } from '@module/action/ranged-attack.ts';

const emptyHand: WeaponGrip2 = {
    name: 'Empty Hand',
    twoHanded: false,
    skill: '',
    fixedReach: null,
    ranged: false,
    meleeList: [],
    rangedList: [],
    ready: true,
};

function attackPossible(actor: GurpsActorV2<ActorType.Character>) {
    const attackManeuvers = [
        'attack',
        'allout_attack',
        'aoa_determined',
        'aoa_double',
        'aoa_feint',
        'aoa_strong',
        'aoa_suppress',
        'move_and_attack',
        'undefined', //returned out of combat!
    ];
    const maneuver = actor.system.conditions.maneuver;
    return !!maneuver ? attackManeuvers.some((i) => i === maneuver) : true;
}

export function applyGripToHands(grips: WeaponGrip2[], gripName: string, index: number, hands: Hand[]) {
    if (index < hands.length && index >= 0) {
        const oldGripName = hands[index].grip;
        const oldGrip = grips.find((g) => g.name === oldGripName) ?? emptyHand;
        const grip = grips.find((g) => g.name === gripName) ?? emptyHand;

        hands[index].grip = '';

        if (grip.twoHanded) {
            let otherHand = oldGrip.twoHanded
                ? hands.findIndex((h) => h.grip === oldGripName)
                : hands.findIndex((h) => h.grip === emptyHand.name);
            otherHand = otherHand < 0 ? hands.findIndex((h) => h.grip !== '') : otherHand;
            if (otherHand >= 0) hands[otherHand].grip = gripName;
        } else if (oldGrip.twoHanded) {
            const otherHand = hands.findIndex((h) => h.grip === oldGripName);
            if (otherHand >= 0) hands[otherHand].grip = emptyHand.name;
        }

        hands[index].grip = gripName;
    }
    return hands;
}

export function initHands(hands_in: Hand[] | undefined, numberOfHands: number) {
    let hands: Hand[] = hands_in ?? [];
    if (hands.length > numberOfHands) {
        hands = [];
    }
    for (let i = hands.length; i < numberOfHands; i++) {
        hands.push({ name: 'Hand ' + (i + 1), grip: emptyHand.name });
    }
    return hands;
}
interface ProtoWeapon {
    id: string;
    uuid: string | null;
    name: string;
    notes: string | Handlebars.SafeString;
    notesRaw: string;
    hasNotes: boolean;
    notesOpen: boolean;
    needsGrips: boolean;
    isEquipment: boolean;
    meleeAttacks: MeleeAttackModel[];
    rangedAttacks: RangedAttackModel[];
}

interface ProtoWeaponWithGrips extends ProtoWeapon {
    grips: WeaponGrip2[];
}

export function attacksWithoutGrip(
    actor: GurpsActorV2<ActorType.Character>,
    emptyHandWeapons: { name: string; usage: string }[],
) {
    return prepareItemsWithAttacks(actor, false, [])
        .filter((w) => !w.needsGrips)
        .flatMap((w) =>
            w.meleeAttacks
                .map((a) => {
                    return { mode: a.mode, name: w.name };
                })
                .concat(
                    w.rangedAttacks.map((a) => {
                        return { mode: a.mode, name: w.name };
                    }),
                ),
        )
        .map((m) => {
            return {
                name: m.name,
                usage: m.mode,
                selected: emptyHandWeapons.some((w) => w.name === m.name && w.usage === (m.mode ?? '')),
            };
        });
}

export function resolveWeapons2(
    actor: GurpsActorV2<ActorType.Character>,
    handsIn: Hand[],
): [grips: WeaponGrip2[], hands: Hand[], meleeWeapons: Weapon2[], rangedWeapons: Weapon2[]] {
    const filterEquipped = getSystemSetting('remove-unequipped-weapons');
    const emptyHandWeapons = getActorSettings(actor).emptyHandAttacks ?? [];
    const mergedSetting = getMergedSettings(actor);
    const attacksPossible = attackPossible(actor);

    const weapons0: Weapon2[] = prepareItemsWithAttacks(actor, filterEquipped, emptyHandWeapons)
        .map((w) => {
            return makeGripsForWeapon(w, actor, mergedSetting.highStrengthOneHanded);
        })
        .map((w) => {
            return makeWeapon2(w);
        });

    const grips = weapons0.flatMap((w) => w.grips);

    const hands = handsIn.map((h) => {
        return { ...h, grip: grips.find((g) => g.name === h.grip)?.name ?? emptyHand.name };
    });

    const meleeWeapons = weapons0
        .map((w) => {
            const meleeList = markSelectedAttacks(
                w.meleeList,
                w.grips,
                attacksPossible,
                handsIn,
                mergedSetting.hideInactiveAttacks,
            ) as DisplayMeleeAttackExt[];
            return {
                ...w,
                meleeList: meleeList.sort(compareAttacks2),
                selected: meleeList.some((a) => a.selected),
            };
        })
        .filter((w) => w.meleeList.length > 0)
        .sort(compareWeapons2);

    const rangedWeapons = weapons0
        .map((w) => {
            const rangedList = markSelectedAttacks(
                w.rangedList,
                w.grips,
                attacksPossible,
                handsIn,
                mergedSetting.hideInactiveAttacks,
            ) as DisplayRangedAttackExt[];
            return {
                ...w,
                rangedList: rangedList.sort(compareAttacks2),
                selected: rangedList.some((a) => a.selected),
            };
        })
        .filter((w) => w.rangedList.length > 0)
        .sort(compareWeapons2);

    return [grips, hands, meleeWeapons, rangedWeapons];
}

function compareAttacks2(
    a: DisplayMeleeAttackExt | DisplayRangedAttackExt | undefined,
    b: DisplayMeleeAttackExt | DisplayRangedAttackExt | undefined,
) {
    if (!a) return 1;
    if (!b) return -1;
    return a.selected && !b.selected
        ? -1
        : !a.selected && b.selected
          ? 1
          : (a.usage ?? '') > (b.usage ?? '')
            ? 1
            : (a.usage ?? '') < (b.usage ?? '')
              ? -1
              : 0;
}

function compareWeapons2(a: Weapon2, b: Weapon2) {
    return a.selected && !b.selected ? -1 : !a.selected && b.selected ? 1 : a.name > b.name ? 1 : -1;
}

function prepareItemsWithAttacks(
    actor: GurpsActorV2<ActorType.Character>,
    filterEquipped: boolean | undefined,
    emptyHandWeapons: { name: string; usage: string }[],
) {
    return actor.items
        .filter((i) => i.id !== actor.system.holderItemId)
        .filter((i) => !i.isOfType(ItemType.Equipment) || (i.system.carried && (i.system.equipped || !filterEquipped)))
        .map((i) => {
            const displayItem = (i.system as BaseItemModel).toDisplayItem();
            return {
                id: displayItem.id,
                uuid: displayItem.uuid,
                name: displayItem.fullName,
                notes: displayItem.notes,
                notesRaw: i.system.notes ?? '',
                hasNotes: displayItem.hasNotes,
                notesOpen: displayItem.notesOpen,
                needsGrips: i.isOfType(ItemType.Equipment),
                isEquipment: i.isOfType(ItemType.Equipment),
                meleeAttacks: i
                    .getItemAttacks({ attackType: 'melee' })
                    .filter((a) => !emptyHandWeapons.some((w) => w.usage === a.mode && w.name === a.document.name)),
                rangedAttacks: i
                    .getItemAttacks({ attackType: 'ranged' })
                    .filter((a) => !emptyHandWeapons.some((w) => w.usage === a.mode && w.name === a.document.name)),
            };
        })
        .filter((w) => w.meleeAttacks.length > 0 || w.rangedAttacks.length > 0)
        .concat([
            {
                id: 'empty-hand',
                uuid: 'empty-hand',
                name: 'Empty Hand',
                notes: '',
                notesRaw: '',
                hasNotes: false,
                notesOpen: false,
                needsGrips: true,
                isEquipment: false,
                meleeAttacks: actor.system.meleeV2.filter((a) =>
                    emptyHandWeapons.some((w) => w.usage === a.mode && w.name === a.name),
                ),
                rangedAttacks: actor.system.rangedV2.filter((a) =>
                    emptyHandWeapons.some((w) => w.usage === a.mode && w.name === a.name),
                ),
            },
        ])
        .concat(handleHolderItem(actor, emptyHandWeapons));
}

/* try to match the attacks from the holder item to other items for downward compatibility with */
function handleHolderItem(
    actor: GurpsActorV2<ActorType.Character>,
    emptyHandWeapons: { name: string; usage: string }[],
) {
    const attacks = actor.system.holderItem
        .getItemAttacks({ attackType: 'both' })
        .filter((a) => !emptyHandWeapons.some((w) => w.usage === a.mode && w.name === a.name));
    const groupedAttacks = attacks.reduce(
        (items, attack) => {
            const name = attack.name;
            const melee = attack.type === 'meleeAttack';
            if (!items[name]) {
                const item = actor.items.find(
                    (i) =>
                        i.name === name &&
                        !i.hasAttacks &&
                        !i.isOfType(ItemType.Skill) &&
                        (!i.isOfType(ItemType.Equipment) || i.system.carried),
                );
                if (item) {
                    const displayItem = (item.system as BaseItemModel).toDisplayItem();
                    items[name] = {
                        id: displayItem.id,
                        uuid: displayItem.uuid,
                        name: displayItem.fullName,
                        notes: displayItem.notes,
                        notesRaw: item.system.notes ?? '',
                        hasNotes: displayItem.hasNotes,
                        notesOpen: displayItem.notesOpen,
                        needsGrips: item.isOfType(ItemType.Equipment),
                        isEquipment: item.isOfType(ItemType.Equipment),
                        meleeAttacks: melee ? [attack as MeleeAttackModel] : [],
                        rangedAttacks: !melee ? [attack as RangedAttackModel] : [],
                    };
                } else {
                    items[name] = {
                        id: attack.id,
                        uuid: null,
                        name: name,
                        notes: '',
                        notesRaw: '',
                        hasNotes: false,
                        notesOpen: false,
                        needsGrips: false,
                        isEquipment: false,
                        meleeAttacks: melee ? [attack as MeleeAttackModel] : [],
                        rangedAttacks: !melee ? [attack as RangedAttackModel] : [],
                    };
                }
            } else {
                if (melee) items[name].meleeAttacks.push(attack as MeleeAttackModel);
                else items[name].rangedAttacks.push(attack as RangedAttackModel);
            }
            return items;
        },
        {} as Record<string, ProtoWeapon>,
    );
    return Object.values(groupedAttacks);
}

function makeGrips2(
    w: ProtoWeapon,
    actor: GurpsActorV2<ActorType.Character>,
    highStrengthOneHanded: boolean,
    ranged: boolean,
) {
    return w.needsGrips
        ? (ranged ? w.rangedAttacks : w.meleeAttacks).map((a) => {
              const twoHanded = (a.st?.includes('†') ?? false) || (a.st?.includes('‡') ?? false);
              const numStr = a.st?.match(/[\d]+/g);
              const weaponSt = !!numStr ? Number.parseInt(numStr[0]) : NaN;
              const highST = actor.system.attributes.ST.value >= weaponSt * 1.5 && highStrengthOneHanded;
              return {
                  name: ranged
                      ? w.name + (a.mode !== '' ? ` ${a.mode}` : ' ranged') + (twoHanded && highST ? ' (high ST)' : '')
                      : w.name + (twoHanded ? (highST ? ' (high ST)' : ' t.h.') : ''),
                  twoHanded: twoHanded && !highST,
                  fixedReach: ranged
                      ? null
                      : (a as MeleeAttackModel).reach.changeRequiresReady
                        ? (a as MeleeAttackModel).reachText
                        : null,
                  ranged: ranged,
                  skill: extractMainSkillFromOTF(a.otf),
                  meleeList: ranged ? [] : [a.toDisplayItem()],
                  rangedList: ranged ? [a.toDisplayItem()] : [],
                  ready: true,
              } as WeaponGrip2;
          })
        : [];
}

function extractMainSkillFromOTF(otf: string) {
    const parts = otf.split('|');
    const part =
        parts.find((s) => !s.match('-[0-9]') && !s.includes('!')) ??
        parts.find((s) => !s.match('-[0-9]')) ??
        parts.find((s) => s.includes('S:')) ??
        parts.find((_) => true) ??
        '';
    return part.replace('S:', '').replace('SK:', '').replaceAll('"', '').trim();
}

function makeGripsForWeapon(
    weapon: ProtoWeapon,
    actor: GurpsActorV2<ActorType.Character>,
    highStrengthOneHanded: boolean,
) {
    const meleeGrips = makeGrips2(weapon, actor, highStrengthOneHanded, false);
    const rangedGrips = makeGrips2(weapon, actor, highStrengthOneHanded, true);
    const grips0 = addUnreadyGrips([...meleeGrips, ...rangedGrips], weapon.isEquipment);
    const grips = combineEquivalentGrips(grips0);

    const gripsDisambiguated: WeaponGrip2[] = grips.map((g) => {
        const sameName = grips.some((g1) => g1.name === g.name && g1.skill !== g.skill);
        return { ...g, name: sameName ? `${g.name} (${g.skill})` : g.name };
    });

    return { ...weapon, grips: gripsDisambiguated };
}

function addUnreadyGrips(grips: WeaponGrip2[], isEquipment: boolean) {
    return grips.flatMap((g) => {
        if (isEquipment) {
            return [
                g,
                {
                    ...g,
                    name: `${g.name} (unready)`,
                    ready: false,
                    meleeList: [],
                    rangedList: [],
                } as WeaponGrip2,
            ];
        } else return [g];
    });
}

function combineEquivalentGrips(grips: WeaponGrip2[]) {
    return grips.reduce((grips: WeaponGrip2[], g: WeaponGrip2) => {
        const i = grips.findIndex((g1) => areGripsEquivalent(g1, g));
        if (i >= 0) {
            grips[i].meleeList = grips[i].meleeList.concat(g.meleeList);
            grips[i].rangedList = grips[i].rangedList.concat(g.rangedList);
            return grips;
        }
        grips.push(g);
        return grips;
    }, []);
}

function areGripsEquivalent(g1: WeaponGrip2, g: WeaponGrip2): boolean {
    return (
        g1.twoHanded === g.twoHanded && g1.fixedReach === g.fixedReach && g1.ranged === g.ranged && g1.skill === g.skill
    );
}

function makeWeapon2(protoWeapon: ProtoWeaponWithGrips): Weapon2 {
    return {
        id: protoWeapon.id,
        uuid: protoWeapon.uuid,
        name: protoWeapon.name,
        grips: protoWeapon.grips,
        notes: protoWeapon.notes,
        hasNotes: protoWeapon.hasNotes,
        notesOpen: protoWeapon.notesOpen,
        meleeList: protoWeapon.meleeAttacks.map((a) => {
            const notes = a.toDisplayItem().notes.replace(protoWeapon.notesRaw, '').trim();
            return {
                ...a.toDisplayItem(),
                notes: notes,
                hasNotes: notes.length > 0,
                selected: false,
            };
        }),
        rangedList: protoWeapon.rangedAttacks.map((a) => {
            const notes = a.toDisplayItem().notes.replace(protoWeapon.notesRaw, '').trim();
            return {
                ...a.toDisplayItem(),
                notes: notes,
                hasNotes: notes.length > 0,
                selected: false,
            };
        }),
        selected: false,
    };
}

function markSelectedAttacks(
    meleeList: DisplayMeleeAttackExt[] | DisplayRangedAttackExt[],
    grips: WeaponGrip2[],
    attacksPossible: boolean,
    handsIn: Hand[],
    hideInactiveAttacks: boolean,
) {
    return meleeList
        .map((a) => {
            return {
                ...a,
                selected:
                    attacksPossible &&
                    grips.some(
                        (g) =>
                            grips.length === 0 ||
                            ((a.uuid === null || g.meleeList.some((ma) => ma.uuid === a.uuid)) &&
                                handsIn.some((h) => h.grip === g.name)),
                    ),
            };
        })
        .filter((a) => (hideInactiveAttacks ? a.selected : true));
}
