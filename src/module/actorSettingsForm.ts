import { getActorSettings, mergeSettings, setActorSettings } from './actor-settings.ts';
import { CATEGORIES, CategoryOrOthers, Skill, AddDisad } from './types.ts';
import { getSettings } from './settings.ts';
import { categorize } from './categorize.ts';
import { removeArryDuplicates as removeArrayDuplicates } from './util.ts';
import { BaseSeetingsForm } from './baseSettingsForm.ts';
import { flattenList, RecursiveList } from './recursiveList.ts';

class ActorSeetingsForm extends BaseSeetingsForm {
    constructor(actor: Actor) {
        super([]);
        this._actor = actor;
        this._settings = foundry.utils.deepClone(getActorSettings(actor));
        this._items = { skills: {}, traits: {} };
        this._globalSetting = getSettings();
    }

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
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        CATEGORIES.forEach((cat) => {
            self._items.skills[cat] = Object.values(
                categorize(mergedSettings.items.skills, flattenList(actorData.skills) as RecursiveList<Skill>, cat),
            ).map((i: any) => i.name);
            self._items.traits[cat] = Object.values(
                categorize(mergedSettings.items.traits, flattenList(actorData.ads) as RecursiveList<AddDisad>, cat),
            ).map((i: any) => i.name);
        });
        self._items.skills['others'] = Object.values(
            categorize(mergedSettings.items.skills, flattenList(actorData.skills) as RecursiveList<Skill>, 'others'),
        ).map((i: any) => i.name);
        self._items.traits['others'] = Object.values(
            categorize(mergedSettings.items.traits, flattenList(actorData.ads) as RecursiveList<AddDisad>, 'others'),
        ).map((i: any) => i.name);

        return {
            ...context,
            globalSettings: this._globalSetting,
            settings: this._settings,
            skills: this._items.skills,
            traits: this._items.traits,
            limitedEditing: true,
        };
    }

    static async #onSave(this: ActorSeetingsForm, event: Event): Promise<void> {
        event.preventDefault();
        setActorSettings(this._actor, this._settings);
        this.close();
    }

    /**
     * Process form submission for the sheet
     * @this {MyApplication}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} _event                   The originating form submission event
     * @param {HTMLFormElement} _form                The form element that was submitted
     * @param {FormDataExtended} formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static override async settingsFormHandler(
        this: ActorSeetingsForm,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        // Do things with the returned FormData
        const newSettings = foundry.utils.expandObject(formData.object).settings as any;
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
        this._settings.numberOfHands = Math.round(newSettings.numberOfHands);
        this.render();
    }
}

export { ActorSeetingsForm };
