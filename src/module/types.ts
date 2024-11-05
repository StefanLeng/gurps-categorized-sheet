import { Rec } from './recursiveList.ts';

export type OTFScope = 'module' | 'global' | 'actor';

export const OTF_REGIONS = [
    'defence',
    'melee',
    'ranged',
    'reaction',
    'exploration',
    'social',
    'powers',
    'technical',
    '',
] as const;

export type OTFRegion = (typeof OTF_REGIONS)[number];

export type SheetOTF = {
    key: string;
    region: OTFRegion;
    code: string;
    flags?: {
        [index: string]: boolean;
    };
    skillRequiered?: string[];
    traitRequiered?: string[];
    traitsForbidden?: string[];
    active: boolean;
    scope: OTFScope;
};

//---------------------------------------------------//

export const CATEGORIES = ['combat', 'exploration', 'social', 'powers', 'technical'] as const;

export type Category = (typeof CATEGORIES)[number];

export type CategoryOrOthers = Category | 'others';

export type CategoryList = {
    [categories in Category]: Array<string>;
};

//---------------------------------------------------//

export interface NamedItem {
    name: string;
}

export interface Skill extends Rec<Skill>, NamedItem {}
export interface AddDisad extends Rec<AddDisad>, NamedItem {}

//---------------------------------------------------//

export interface Keyed {
    key: string;
    selected: boolean;
}

//---------------------------------------------------//

export interface AttackMode {
    name: string;
    notes?: string;
    pageref?: string;
    damage?: string;
    st?: string;
    mode?: string;
    level?: number;
}

export interface MeleeMode extends AttackMode {
    reach?: string;
    parry?: string;
    block?: string;
}

export interface KeyedAttack extends AttackMode, Keyed {}

export interface keyedMeleeMode extends MeleeMode, Keyed {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RangedMode extends AttackMode {}

export interface keyedRangedMode extends RangedMode, Keyed {}

//---------------------------------------------------//

export interface Equipment extends Rec<Equipment>, NamedItem {
    notes: string;
    equipped: boolean;
}

export interface WeaponGrip {
    name: string;
    weaponName: string;
    twoHanded: boolean;
    note: string;
    weaponNote: string;
    fixedReach: string | null;
    ranged: boolean;
    meleeList: keyedMeleeMode[];
    rangedList: keyedRangedMode[];
}

export interface Weapon extends Equipment {
    grips: WeaponGrip[];
    notes: string;
    meleeList: keyedMeleeMode[];
    rangedList: keyedRangedMode[];
}

//---------------------------------------------------//

export interface Hand {
    name: string;
    grip: string;
}
