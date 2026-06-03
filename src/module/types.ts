import { MyRollTable } from './rollTables.ts';
import type {} from '@gurps-types/configuration.ts';
import { DisplayMeleeAttack, DisplayRangedAttack, DisplaySkill } from '@gurps-types/gurps/display-item.ts';

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
export interface DisplaySkillEx extends DisplaySkill {
    additionalRolls?: string[];
}

///---------------------------------------------------//

export interface WeaponGrip2 {
    name: string;
    twoHanded: boolean;
    skill: string;
    fixedReach: string | null;
    ranged: boolean;
    meleeList: DisplayMeleeAttack[];
    rangedList: DisplayRangedAttack[];
    ready: boolean;
}
export interface DisplayMeleeAttackExt extends DisplayMeleeAttack {
    selected: boolean;
}
export interface DisplayRangedAttackExt extends DisplayRangedAttack {
    selected: boolean;
}
export interface Weapon2 {
    id: string;
    uuid: string | null;
    name: string;
    notes: string | Handlebars.SafeString;
    hasNotes: boolean;
    notesOpen: boolean;
    meleeList: DisplayMeleeAttackExt[];
    rangedList: DisplayRangedAttackExt[];
    grips: WeaponGrip2[];
    selected: boolean;
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
