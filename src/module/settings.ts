import { skillCategories, adsCategories, systemOTFs } from './constants.ts';
import { CategoryList, CATEGORIES, CatSheetSettings } from './types.ts';
import { MODULE_ID, CAT_SHEET_SETTINGS, SYSTEM_ID } from './constants.ts';
import { removeArrayDuplicates } from './util.ts';

export const defaultSettings: CatSheetSettings = {
    version: '0.3.3',
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
    sheetOTFs: systemOTFs,
    highStrengthOneHanded: false,
};

function sortTraits(cat: CategoryList): CategoryList {
    const newCat = { ...cat };
    CATEGORIES.forEach((c) => {
        newCat[c] ||= [];
        newCat[c] = removeArrayDuplicates(newCat[c]).sort();
    });
    return newCat;
}

function migrateSetting(settings: CatSheetSettings) {
    let newSettings = settings;
    if (foundry.utils.isNewerVersion('0.3.0', settings.version ?? '0.0.0')) {
        newSettings = { ...newSettings, version: '0.3.0' };
    }
    if (foundry.utils.isNewerVersion('0.3.3', settings.version ?? '0.0.0')) {
        newSettings = { ...newSettings, version: '0.3.3', sheetOTFs: defaultSettings.sheetOTFs };
    }
    if (foundry.utils.isNewerVersion('0.4.1', settings.version ?? '0.0.0')) {
        newSettings = {
            ...newSettings,
            version: '0.4.1',
            highStrengthOneHanded: defaultSettings.highStrengthOneHanded,
        };
    }
    if (foundry.utils.isNewerVersion('0.6.0', settings.version ?? '0.0.0')) {
        newSettings = {
            ...newSettings,
            version: '0.6.0',
            items: {
                skills: { ...newSettings.items.skills, fav: [] },
                traits: { ...newSettings.items.traits, fav: [] },
            },
        };
    }
    if (foundry.utils.isNewerVersion('0.8.1', settings.version ?? '0.0.0')) {
        newSettings = {
            ...newSettings,
            version: '0.8.1',
            sheetOTFs: newSettings.sheetOTFs.map((s: any) => {
                return { ...s, region: s.region === 'defence' ? 'defense' : s.region };
            }),
        };
    }
    return newSettings;
}

export function getSettings(): CatSheetSettings {
    const settings = game.settings?.get(MODULE_ID, CAT_SHEET_SETTINGS) ?? defaultSettings;
    return migrateSetting(settings);
}

export function sortCategorySettings(settings: CatSheetSettings): CatSheetSettings {
    return {
        ...settings,
        items: {
            skills: sortTraits(settings.items.skills),
            traits: sortTraits(settings.items.traits),
        },
    };
}

export async function setSettings(settings: CatSheetSettings) {
    game.settings?.set(MODULE_ID, CAT_SHEET_SETTINGS, settings);
}

export function getSystemSetting(setting: 'remove-unequipped-weapons' | 'automatic-encumbrance') {
    return game.settings?.get(SYSTEM_ID, setting);
}
