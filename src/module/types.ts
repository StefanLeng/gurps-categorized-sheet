import { Rec } from './recursiveList.ts';
import { MyRollTable } from './rollTables.ts';
import type {} from '@gurps-types/configuration.ts';

export type OTFScope = 'module' | 'global' | 'actor';

export const OTF_REGIONS = [
    'defense',
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
    skillRequired?: string[];
    traitRequired?: string[];
    traitsForbidden?: string[];
    manueverRequired?: string[];
    active: boolean;
    scope: OTFScope;
};

//---------------------------------------------------//

export const CATEGORIES = ['combat', 'exploration', 'social', 'powers', 'technical', 'fav'] as const;

export type Category = (typeof CATEGORIES)[number];

export type CategoryOrOthers = Category | 'others';

export type CategoryList = {
    [categories in Category]: Array<string>;
};

//---------------------------------------------------//

export interface NamedItem {
    name: string;
}
export interface Skill extends Rec<Skill>, NamedItem {
    name: string;
    notes: string;
    pageref: string;
    points: number;
    level: number;
    relativelevel: string;
    type: string;
    additionalRolls?: string[];
}

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
    reach: string;
    parry?: string;
    block?: string;
}

export interface KeyedAttack extends AttackMode, Keyed {}

export interface keyedMeleeMode extends MeleeMode, Keyed {}

export interface RangedMode extends AttackMode {
    acc: string;
}

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
    skill: string;
    weaponNote: string;
    fixedReach: string | null;
    ranged: boolean;
    meleeList: keyedMeleeMode[];
    rangedList: keyedRangedMode[];
    ready: boolean;
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

export type CatSheetActorSettings = {
    version: string;
    addedItems: {
        [index: string]: CategoryList;
        skills: CategoryList;
        traits: CategoryList;
    };
    removedItems: {
        [index: string]: CategoryList;
        skills: CategoryList;
        traits: CategoryList;
    };
    allowExtraEffort: boolean | null;
    hideInactiveAttacks: boolean | null;
    highStrengthOneHanded: boolean | null;
    numberOfHands: number;
    sheetOTFs: SheetOTF[];
    emptyHandAttacks?: { name: string; usage: string }[];
};

export type RollTableNames = {
    [k in MyRollTable]: string;
};

export type CatSheetSettings = {
    version: string;
    rollTables: RollTableNames;
    items: {
        [index: string]: CategoryList;
        skills: CategoryList;
        traits: CategoryList;
    };
    allowExtraEffort: boolean;
    hideInactiveAttacks: boolean;
    sheetOTFs: SheetOTF[];
    highStrengthOneHanded: boolean;
};

declare module 'fvtt-types/configuration' {
    interface FlagConfig {
        Actor: {
            ['gurps-categorized-sheet']: {
                ['cat_sheet_settings']: CatSheetActorSettings;
                hands: Hand[];
            };
        };
    }

    /* ---------------------------------------- */
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Hooks {
        interface HookConfig {
            gurpsinit: () => void;
        }
    }

    /* ---------------------------------------- */
    interface SettingConfig {
        'gurps-categorized-sheet.cat_sheet_settings': CatSheetSettings;
        'gurps.remove-unequipped-weapons': boolean;
    }
}
