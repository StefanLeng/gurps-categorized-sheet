import { Rec } from './recursiveList.ts';

export type SheetOTF = {
    key: string;
    region: string;
    modifier: string;
    flags?: {
        [index: string]: boolean;
    };
    skillRequiered?: string[];
    traitRequiered?: string[];
    traitsForbidden?: string[];
    active: boolean;
    userDefined: boolean;
};

export const OTF_REGIONS = [
    'defence',
    'melee',
    'ranged',
    'reaction',
    'exploration',
    'social',
    'powers',
    'technical',
] as const;

export type OTFRegion = (typeof OTF_REGIONS)[number];

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
