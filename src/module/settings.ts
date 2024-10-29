import { MyRollTable } from './rollTables.ts';
import { skillCategories, adsCategories } from './constants.ts';
import { CategoryList, CATEGORIES } from './types.ts';
import { MODULE_ID, CAT_SHEET_SETTINS, SYSTEM_ID } from './constants.ts';
import { removeArryDuplicates } from './util.ts';

type RollTables = {
    [k in MyRollTable]: string;
};

export type CatSheetSettings = {
    version: string;
    rollTables: RollTables;
    items: {
        [index: string]: CategoryList;
        skills: CategoryList;
        traits: CategoryList;
    };
    allowExtraEffort: boolean;
    hideInactiveAttacks: boolean;
};

export const defaultSettings: CatSheetSettings = {
    version: '0.0.0',
    rollTables: {
        'Critical Hit': 'Critical Hit',
        'Critical Miss': 'Critical Miss',
        'Critical Head Blow': 'Critical Head Blow',
        'Reaction Rolls': 'Reaction Rolls',
    },
    items: {
        skills: skillCategories,
        traits: adsCategories,
    },
    allowExtraEffort: true,
    hideInactiveAttacks: false,
};

function sortTraits(cat: CategoryList): CategoryList {
    const newcat = { ...cat };
    CATEGORIES.forEach((c) => {
        newcat[c] = removeArryDuplicates(newcat[c]).sort();
    });
    return newcat;
}

function migrateSetting(settings: CatSheetSettings) {
    if (foundry.utils.isNewerVersion('0.3.0', settings.version ?? '0.0.0')) {
        return { ...settings, version: '0.3.0' };
    }
    return settings;
}

export function getSettings(): CatSheetSettings {
    const settings = game.settings.get(MODULE_ID, CAT_SHEET_SETTINS) ?? defaultSettings;
    return migrateSetting(settings);
}

export function sortCategorieSettings(settings: CatSheetSettings): CatSheetSettings {
    return {
        ...settings,
        items: {
            skills: sortTraits(settings.items.skills),
            traits: sortTraits(settings.items.traits),
        },
    };
}

export async function setSettings(settings: CatSheetSettings) {
    game.settings.set(MODULE_ID, CAT_SHEET_SETTINS, settings);
}

export function getSystemSetting(setting: string) {
    return game.settings.get(SYSTEM_ID, setting);
}
