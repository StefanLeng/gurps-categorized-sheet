import { attacksWithoutGrip, getActorSettings, mergeSettings, mergOTFs, setActorSettings } from './actor-settings.ts';
import { CATEGORIES, CategoryOrOthers, Skill, AddDisad, OTFRegion, CategoryList } from './types.ts';
import { getSettings } from './settings.ts';
import { categorize } from './categorize.ts';
import { removeArryDuplicates as removeArrayDuplicates } from './util.ts';
import { BaseSeetingsForm } from './baseSettingsForm.ts';
import * as RecursiveList from './recursiveList.ts';
import { newOTF } from './sheetOTFs.ts';

interface NewOTF {
    region?: OTFRegion[];
    code?: string[];
    flags?: {
        [index: string]: boolean;
    }[];
    skillRequiered?: string[];
    traitRequiered?: string[];
    traitsForbidden?: string[];
    manueverRequiered?: string[][];
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

class ActorSeetingsForm extends BaseSeetingsForm {
    constructor(actor: Actor) {
        super([]);
        this._actor = actor;
        this._globalSetting = getSettings();
        this._settings = foundry.utils.deepClone(getActorSettings(actor));
        this._settings.sheetOTFs = mergOTFs(this._settings, this._globalSetting);
        this._items = { skills: {}, traits: {} };
        const actorData = this._actor.system as any;
        this._attacksWithoutGrip = attacksWithoutGrip(
            actorData.equipment.carried,
            actorData.melee ?? RecursiveList.emptyList,
            this._settings.emptyHandAttacks ?? [],
        ).concat(
            attacksWithoutGrip(
                actorData.equipment.carried,
                actorData.ranged ?? RecursiveList.emptyList,
                this._settings.emptyHandAttacks ?? [],
            ),
        );
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

    static override DEFAULT_OPTIONS = {
        id: 'slcs-actorSettingsForm',
        tag: 'form',
        classes: ['theme-light'],
        form: {
            handler: ActorSeetingsForm.settingsFormHandler,
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
            deleteOTF: this.#deteteOTF,
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

    override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
        const context = await super._prepareContext(options);
        const mergedSettings = mergeSettings(this._globalSetting, this._settings);
        const actorData = this._actor.system as any;
        const skills = RecursiveList.flatten(actorData.skills) as RecursiveList.List<Skill>;
        const traits = RecursiveList.flatten(actorData.ads) as RecursiveList.List<AddDisad>;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        CATEGORIES.forEach((cat) => {
            self._items.skills[cat] = Object.values(categorize(mergedSettings.items.skills, skills, cat)).map(
                (i: any) => i.name,
            );
            self._items.traits[cat] = Object.values(categorize(mergedSettings.items.traits, traits, cat)).map(
                (i: any) => i.name,
            );
        });
        self._items.skills['others'] = Object.values(categorize(mergedSettings.items.skills, skills, 'others')).map(
            (i: any) => i.name,
        );
        self._items.traits['others'] = Object.values(categorize(mergedSettings.items.traits, traits, 'others')).map(
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

    static async #onSave(this: ActorSeetingsForm, event: Event): Promise<void> {
        event.preventDefault();
        setActorSettings(this._actor, this._settings);
        this.close();
    }

    static async #addOTF(this: ActorSeetingsForm, event: Event) {
        event.preventDefault();
        this._settings.sheetOTFs.unshift(newOTF('actor'));
        await this.render();
    }

    static async #deteteOTF(this: ActorSeetingsForm, event: Event, target: HTMLElement) {
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
                    skillRequiered: newOTFs.skillRequiered
                        ? newOTFs.skillRequiered[i].split(',').filter((s) => s !== '')
                        : o.skillRequiered,
                    traitRequiered: newOTFs.traitRequiered
                        ? newOTFs.traitRequiered[i].split(',').filter((s) => s !== '')
                        : o.traitRequiered,
                    traitsForbidden: newOTFs.traitsForbidden
                        ? newOTFs.traitsForbidden[i].split(',').filter((s) => s !== '')
                        : o.traitsForbidden,
                    manueverRequiered: newOTFs.manueverRequiered ? newOTFs.manueverRequiered[i] : o.manueverRequiered,
                };
            }
        });
    }

    static override async settingsFormHandler(
        this: ActorSeetingsForm,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        // Do things with the returned FormData
        const newSettings = foundry.utils.expandObject(formData.object).settings as NewSettings;
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

export { ActorSeetingsForm };
