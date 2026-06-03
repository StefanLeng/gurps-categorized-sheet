import { CategoryList, CATEGORIES, CatSheetActorSettings, CatSheetSettings } from './types.ts';
import { MODULE_ID, CAT_SHEET_SETTINGS } from './constants.ts';
import { getSettings } from './settings.ts';
import { GurpsActorV2 } from '@module/actor/gurps-actor.ts';
import { ActorType } from '@module/actor/types.ts';
import { MeleeAttackModel } from '@module/action/index.ts';
import { attacksWithoutGrip } from './weaponGrips.ts';

const emptyList: CategoryList = {
    combat: [],
    exploration: [],
    social: [],
    technical: [],
    powers: [],
    fav: [],
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
    highStrengthOneHanded: null,
    numberOfHands: 2,
    sheetOTFs: [],
    emptyHandAttacks: [],
};

function migrateSetting(settings: CatSheetActorSettings) {
    let newSettings = settings;
    if (foundry.utils.isNewerVersion('0.3.0', settings.version ?? '0.0.0')) {
        newSettings = { ...newSettings, version: '0.3.0' };
    }
    if (foundry.utils.isNewerVersion('0.3.2', settings.version ?? '0.0.0')) {
        newSettings = { ...newSettings, numberOfHands: defaultSettings.numberOfHands, version: '0.3.2' };
    }
    if (foundry.utils.isNewerVersion('0.3.3', settings.version ?? '0.0.0')) {
        newSettings = { ...newSettings, sheetOTFs: defaultSettings.sheetOTFs, version: '0.3.3' };
    }
    if (!newSettings.emptyHandAttacks) {
        newSettings.emptyHandAttacks = [];
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
            addedItems: {
                skills: { ...newSettings.addedItems.skills, fav: [] },
                traits: { ...newSettings.addedItems.traits, fav: [] },
            },
            removedItems: {
                skills: { ...newSettings.removedItems.skills, fav: [] },
                traits: { ...newSettings.removedItems.traits, fav: [] },
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

function punch(actor: GurpsActorV2<ActorType.Character>) {
    return attacksWithoutGrip(actor, [])
        .map((m) => {
            return { name: m.name, usage: m.usage };
        })
        .filter((m) => m.usage === 'Punch');
}

export function getActorSettings(actor: GurpsActorV2<ActorType.Character>): CatSheetActorSettings {
    const settings = actor.getFlag(MODULE_ID, CAT_SHEET_SETTINGS) ?? defaultSettings;
    const migratedSetting = migrateSetting(settings);
    if (migratedSetting.emptyHandAttacks?.length === 0) {
        migratedSetting.emptyHandAttacks = punch(actor);
    }
    return migratedSetting;
}

export function setActorSettings(actor: Actor, settings: CatSheetActorSettings) {
    actor.setFlag(MODULE_ID, CAT_SHEET_SETTINGS, settings);
}

export function mergeSettings(settings: CatSheetSettings, actorSettings: CatSheetActorSettings): CatSheetSettings {
    const newSettings = foundry.utils.deepClone(settings);
    newSettings.allowExtraEffort = actorSettings.allowExtraEffort ?? newSettings.allowExtraEffort;
    newSettings.hideInactiveAttacks = actorSettings.hideInactiveAttacks ?? newSettings.hideInactiveAttacks;
    newSettings.highStrengthOneHanded = actorSettings.highStrengthOneHanded ?? newSettings.highStrengthOneHanded;
    CATEGORIES.forEach((cat) => {
        newSettings.items.skills[cat] = newSettings.items.skills[cat]
            .filter((i) => !actorSettings.removedItems.skills[cat].some((x) => x === i))
            .concat(actorSettings.addedItems.skills[cat]);

        newSettings.items.traits[cat] = newSettings.items.traits[cat]
            .filter((i) => !actorSettings.removedItems.traits[cat].some((x) => x === i))
            .concat(actorSettings.addedItems.traits[cat]);
    });
    newSettings.sheetOTFs = mergeOTFs(actorSettings, settings);
    return newSettings;
}

export function mergeOTFs(actorSettings: CatSheetActorSettings, settings: CatSheetSettings) {
    return actorSettings.sheetOTFs
        .filter((i) => i.scope === 'actor')
        .concat(
            settings.sheetOTFs.map((s) => {
                return { ...s, active: actorSettings.sheetOTFs.find((a) => a.key === s.key)?.active ?? s.active };
            }),
        );
}

export function getMergedSettings(actor: GurpsActorV2<ActorType.Character>): CatSheetSettings {
    const settings = getSettings();
    const actorSettings = getActorSettings(actor);
    return mergeSettings(settings, actorSettings);
}
