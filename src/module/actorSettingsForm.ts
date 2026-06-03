import { getActorSettings, mergeSettings, mergeOTFs, setActorSettings } from './actor-settings.ts';
import { CATEGORIES, CategoryOrOthers, OTFRegion, CategoryList } from './types.ts';
import { getSettings } from './settings.ts';
import { categorizeItem } from './categorize.ts';
import { removeArrayDuplicates as removeArrayDuplicates } from './util.ts';
import { BaseSettingsForm } from './baseSettingsForm.ts';
import { newOTF } from './sheetOTFs.ts';
import type { DeepPartial } from 'fvtt-types/utils';
import { attacksWithoutGrip } from './weaponGrips.ts';
import { GurpsActorV2 } from '@module/actor/gurps-actor.ts';
import { ActorType } from '@module/actor/types.ts';

interface NewOTF {
    region?: OTFRegion[];
    code?: string[];
    flags?: {
        [index: string]: boolean;
    }[];
    skillRequired?: string[];
    traitRequired?: string[];
    traitsForbidden?: string[];
    manueverRequired?: string[][];
    active: boolean[];
}

interface NewSettings {
    items: {
        skills: CategoryList;
        traits: CategoryList;
    };
    allowExtraEffort: boolean;
    allowExtraEffortGlobal: boolean;
    hideInactiveAttacks: boolean;
    hideInactiveAttacksGlobal: boolean;
    highStrengthOneHanded: boolean;
    highStrengthOneHandedGlobal: boolean;
    sheetOTFs: NewOTF;
    numberOfHands: number;
    emptyHandAttacks: boolean[];
}

class ActorSettingsForm extends BaseSettingsForm {
    constructor(actor: GurpsActorV2<ActorType.Character>) {
        super([]);
        this._actor = actor;
        this._globalSetting = getSettings();
        this._settings = foundry.utils.deepClone(getActorSettings(actor));
        this._settings.sheetOTFs = mergeOTFs(this._settings, this._globalSetting);
        this._items = { skills: {}, traits: {} };
        this._attacksWithoutGrip = attacksWithoutGrip(actor, this._settings.emptyHandAttacks ?? []);
    }

    protected _attacksWithoutGrip;
    protected _actor;
    public _settings;
    protected _items: {
        [index: string]: { [index: string]: string[] };
        skills: { [index: string]: string[] };
        traits: { [index: string]: string[] };
    };
    protected _globalSetting;

    static override DEFAULT_OPTIONS: DeepPartial<
        foundry.applications.api.ApplicationV2.DefaultOptions & {
            dragDrop: foundry.applications.ux.DragDrop.Configuration[];
        }
    > = {
        classes: ['slcs-actorSettingsForm'],
        tag: 'form',
        form: {
            handler: ActorSettingsForm.settingsFormHandler,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        window: {
            title: 'Categorized Character Sheet configuration',
            controls: [],
        },
        actions: {
            save: this.#onSave,
            addOTF: this.#addOTF,
            deleteOTF: this.#deleteOTF,
        },
    };

    protected override addItemToCategory(type: string, cat: CategoryOrOthers, val: string) {
        if (cat != 'others') {
            if (!this._settings.addedItems[type][cat].some((i) => i === val)) {
                this._settings.addedItems[type][cat].push(val);
                this._settings.addedItems[type][cat] = removeArrayDuplicates(this._settings.addedItems[type][cat]);
            }
            this._settings.removedItems[type][cat] = this._settings.removedItems[type][cat].filter((i) => i != val);
        }
    }

    protected override removeItemFromCategory(type: string, cat: CategoryOrOthers, val: string) {
        if (cat != 'others') {
            if (!this._settings.removedItems[type][cat].some((i) => i === val)) {
                this._settings.removedItems[type][cat].push(val);
                this._settings.removedItems[type][cat] = removeArrayDuplicates(this._settings.removedItems[type][cat]);
            }
            this._settings.addedItems[type][cat] = this._settings.addedItems[type][cat].filter((i) => i != val);
        }
    }

    protected override getItemValue(type: string, sourceCat: string, index: number) {
        return this._items[type][sourceCat][index];
    }

    override async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<object> {
        const context = await super._prepareContext(options);
        const mergedSettings = mergeSettings(this._globalSetting, this._settings);
        const skills = this._actor.system.skillsV2 ?? [];
        const traits = this._actor.system.adsV2 ?? [];

        CATEGORIES.forEach((cat) => {
            this._items.skills[cat] = Object.values(categorizeItem(mergedSettings.items.skills, skills, cat)).map(
                (i: any) => i.name,
            );
            this._items.traits[cat] = Object.values(categorizeItem(mergedSettings.items.traits, traits, cat)).map(
                (i: any) => i.name,
            );
        });
        this._items.skills['others'] = Object.values(categorizeItem(mergedSettings.items.skills, skills, 'others')).map(
            (i: any) => i.name,
        );
        this._items.traits['others'] = Object.values(categorizeItem(mergedSettings.items.traits, traits, 'others')).map(
            (i: any) => i.name,
        );

        return {
            ...context,
            OTFScope: 'actor',
            globalSettings: this._globalSetting,
            settings: this._settings,
            skills: this._items.skills,
            traits: this._items.traits,
            limitedEditing: true,
            attacksWithoutGrip: this._attacksWithoutGrip,
        };
    }

    static async #onSave(this: ActorSettingsForm, event: Event): Promise<void> {
        event.preventDefault();
        setActorSettings(this._actor, this._settings);
        this.close();
    }

    static async #addOTF(this: ActorSettingsForm, event: Event) {
        event.preventDefault();
        this._settings.sheetOTFs.unshift(newOTF('actor'));
        await this.render();
    }

    static async #deleteOTF(this: ActorSettingsForm, event: Event, target: HTMLElement) {
        event.preventDefault();
        const i = Number(target.dataset.index);
        if (!isNaN(i)) {
            this._settings.sheetOTFs.splice(i, 1);
            await this.render();
        }
    }

    private updateOTFs(newOTFs: NewOTF) {
        this._settings.sheetOTFs = this._settings.sheetOTFs.map((o, i) => {
            if (o.scope !== 'actor') {
                return { ...o, active: newOTFs.active[i] };
            } else {
                return {
                    ...o,
                    active: newOTFs.active[i],
                    region: newOTFs.region ? newOTFs.region[i] : o.region,
                    code: newOTFs.code ? newOTFs.code[i] : o.code,
                    skillRequired: newOTFs.skillRequired
                        ? newOTFs.skillRequired[i].split(',').filter((s) => s !== '')
                        : o.skillRequired,
                    traitRequired: newOTFs.traitRequired
                        ? newOTFs.traitRequired[i].split(',').filter((s) => s !== '')
                        : o.traitRequired,
                    traitsForbidden: newOTFs.traitsForbidden
                        ? newOTFs.traitsForbidden[i].split(',').filter((s) => s !== '')
                        : o.traitsForbidden,
                    manueverRequired: newOTFs.manueverRequired ? newOTFs.manueverRequired[i] : o.manueverRequired,
                };
            }
        });
    }

    static override async settingsFormHandler(
        this: ActorSettingsForm,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        // Do things with the returned FormData
        const newSettings = (foundry.utils.expandObject(formData.object) as any).settings as NewSettings;
        if (newSettings.allowExtraEffortGlobal) {
            this._settings.allowExtraEffort = null;
        } else {
            this._settings.allowExtraEffort = newSettings.allowExtraEffort ?? this._globalSetting.allowExtraEffort;
        }
        if (newSettings.hideInactiveAttacksGlobal) {
            this._settings.hideInactiveAttacks = null;
        } else {
            this._settings.hideInactiveAttacks =
                newSettings.hideInactiveAttacks ?? this._globalSetting.hideInactiveAttacks;
        }
        if (newSettings.highStrengthOneHandedGlobal) {
            this._settings.highStrengthOneHanded = null;
        } else {
            this._settings.highStrengthOneHanded =
                newSettings.highStrengthOneHanded ?? this._globalSetting.highStrengthOneHanded;
        }
        if (newSettings.emptyHandAttacks) {
            this._attacksWithoutGrip = this._attacksWithoutGrip.map((m, i) => {
                return { ...m, selected: newSettings.emptyHandAttacks[i] };
            });
            this._settings.emptyHandAttacks = this._attacksWithoutGrip
                .filter((e) => e.selected)
                .map((e) => {
                    return { name: e.name, usage: e.usage ?? '' };
                });
        }
        this._settings.numberOfHands = Math.round(newSettings.numberOfHands);
        this.updateOTFs(newSettings.sheetOTFs);
        this.render();
    }
}

export { ActorSettingsForm as ActorSettingsForm };
