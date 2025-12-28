import { getSettings, RollTableNames, setSettings, sortCategorieSettings } from './settings.ts';
import { Category, CategoryList, OTFRegion } from './types.ts';
import { BaseSeetingsForm } from './baseSettingsForm.ts';
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
    rollTables: RollTableNames;
    items: {
        skills: CategoryList;
        traits: CategoryList;
    };
    allowExtraEffort: boolean;
    hideInactiveAttacks: boolean;
    highStrengthOneHanded: boolean;
    sheetOTFs: NewOTF;
}

class SeetingsForm extends BaseSeetingsForm {
    constructor(args: any) {
        super(args);
        this._settings = sortCategorieSettings(foundry.utils.deepClone(getSettings()));
    }

    public _settings;

    static override DEFAULT_OPTIONS = {
        classes: ['slcs-settingsForm'],
        tag: 'form',
        form: {
            handler: SeetingsForm.settingsFormHandler,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        window: {
            title: 'Categorized Character Sheet configuration',
            controls: [],
        },
        actions: {
            save: this.#onSave,
            addItem: this.#onAddItem,
            deleteItem: this.#deleteItem,
            addOTF: this.#addOTF,
            deleteOTF: this.#deteteOTF,
        },
    };

    protected override addItemToCategory(type: string, cat: Category, val: string) {
        if (!this._settings.items[type][cat].some((i) => i === val)) {
            this._settings.items[type][cat].push(val);
        }
        this._settings = sortCategorieSettings(this._settings);
    }

    protected override removeItemFromCategory(type: string, cat: Category, val: string) {
        this._settings.items[type][cat] = this._settings.items[type][cat].filter((i) => i != val);
    }

    protected override getItemValue(type: string, cat: Category, index: number) {
        return this._settings.items[type][cat][index];
    }

    override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
        const context = await super._prepareContext(options);
        const settings = this._settings;
        return {
            ...context,
            OTFScope: 'global',
            settings: settings,
            skills: this._settings.items.skills,
            traits: this._settings.items.traits,
        };
    }

    static async #addOTF(this: SeetingsForm, event: Event) {
        event.preventDefault();
        this._settings.sheetOTFs.unshift(newOTF('global'));
        await this.render();
    }

    static async #deteteOTF(this: SeetingsForm, event: Event, target: HTMLElement) {
        event.preventDefault();
        const i = Number(target.dataset.index);
        if (!isNaN(i)) {
            this._settings.sheetOTFs.splice(i, 1);
            await this.render();
        }
    }

    static async #onSave(this: SeetingsForm, event: Event): Promise<void> {
        event.preventDefault();
        setSettings(this._settings);
        this.close();
    }

    static async #onAddItem(this: SeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category as Category;
        const type = target.dataset.type;
        if (cat && type) {
            this._settings.items[type][cat].push('');
            await this.render();
            this._scrollToAndFocus(type, cat, '');
        }
    }

    static async #deleteItem(this: SeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category as Category;
        const i = Number(target.dataset.index);
        const type = target.dataset.type;
        if (cat && !isNaN(i) && type) {
            this._settings.items[type][cat].splice(i, 1);
            this.render();
        }
    }

    private updateOTFs(newOTFs: NewOTF) {
        this._settings.sheetOTFs = this._settings.sheetOTFs.map((o, i) => {
            if (o.scope === 'module') {
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

    /**
     * Process form submission for the sheet
     * @this {MyApplication}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} _event                   The originating form submission event
     * @param {HTMLFormElement} _form                The form element that was submitted
     * @param {FormDataExtended} formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static override async settingsFormHandler(
        this: SeetingsForm,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        // Do things with the returned FormData
        const newSettings = foundry.utils.expandObject(formData.object).settings as NewSettings;
        this._settings.rollTables = newSettings.rollTables;
        this._settings.allowExtraEffort = newSettings.allowExtraEffort;
        this._settings.hideInactiveAttacks = newSettings.hideInactiveAttacks;
        this._settings.highStrengthOneHanded = newSettings.highStrengthOneHanded;
        this._settings.items.skills = newSettings.items.skills;
        this._settings.items.traits = newSettings.items.traits;
        this._settings = sortCategorieSettings(this._settings);
        this.updateOTFs(newSettings.sheetOTFs);
        this.render();
    }
}
export { SeetingsForm };
