import { CategoryList, CATEGORIES, SheetOTF } from './types.ts';
import { MODULE_ID, CAT_SHEET_SETTINS } from './constants.ts';
import { CatSheetSettings, getSettings } from './settings.ts';

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
    numberOfHands: number;
    sheetOTFs: SheetOTF[];
};

const emptyList: CategoryList = {
    combat: [],
    exploration: [],
    social: [],
    technical: [],
    powers: [],
};

const defaultSettings: CatSheetActorSettings = {
    version: '0.3.0',
    addedItems: {
        skills: emptyList,
        traits: emptyList,
    },
    removedItems: {
        skills: emptyList,
        traits: emptyList,
    },
    allowExtraEffort: null,
    hideInactiveAttacks: null,
    numberOfHands: 2,
    sheetOTFs: [],
};

function migrateSetting(settings: CatSheetActorSettings) {
    if (foundry.utils.isNewerVersion('0.3.0', settings.version ?? '0.0.0')) {
        return { ...settings, version: '0.3.0' };
    }
    if (foundry.utils.isNewerVersion('0.3.2', settings.version ?? '0.0.0')) {
        return { ...settings, numberOfHands: defaultSettings.numberOfHands, version: '0.3.2' };
    }
    if (foundry.utils.isNewerVersion('0.3.3', settings.version ?? '0.0.0')) {
        return { ...settings, sheetOTFs: defaultSettings.sheetOTFs, version: '0.3.3' };
    }
    return settings;
}

export function getActorSettings(actor: Actor): CatSheetActorSettings {
    const settings = (actor.getFlag(MODULE_ID, CAT_SHEET_SETTINS) ?? defaultSettings) as CatSheetActorSettings;
    return migrateSetting(settings);
}

export function setActorSettings(actor: Actor, settings: CatSheetActorSettings) {
    actor.setFlag(MODULE_ID, CAT_SHEET_SETTINS, settings);
}

export function mergeSettings(settings: CatSheetSettings, actorSettings: CatSheetActorSettings): CatSheetSettings {
    const newSettings = foundry.utils.deepClone(settings);
    newSettings.allowExtraEffort = actorSettings.allowExtraEffort ?? newSettings.allowExtraEffort;
    newSettings.hideInactiveAttacks = actorSettings.hideInactiveAttacks ?? newSettings.hideInactiveAttacks;
    CATEGORIES.forEach((cat) => {
        newSettings.items.skills[cat] = newSettings.items.skills[cat]
            .filter((i) => !actorSettings.removedItems.skills[cat].some((x) => x === i))
            .concat(actorSettings.addedItems.skills[cat]);

        newSettings.items.traits[cat] = newSettings.items.traits[cat]
            .filter((i) => !actorSettings.removedItems.traits[cat].some((x) => x === i))
            .concat(actorSettings.addedItems.traits[cat]);
    });
    newSettings.sheetOTFs = mergOTFs(actorSettings, settings);
    return newSettings;
}

export function mergOTFs(actorSettings: CatSheetActorSettings, settings: CatSheetSettings) {
    return actorSettings.sheetOTFs
        .filter((i) => i.scope === 'actor')
        .concat(
            settings.sheetOTFs.map((s) => {
                return { ...s, active: actorSettings.sheetOTFs.find((a) => a.key === s.key)?.active ?? s.active };
            }),
        );
}

export function getMergedSettings(actor: Actor): CatSheetSettings {
    const settings = getSettings();
    const actorSettings = getActorSettings(actor);
    return mergeSettings(settings, actorSettings);
}
