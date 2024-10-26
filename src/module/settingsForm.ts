import { CatSheetSettings, getSettings, setSettings, sortCategorieSettings } from './settings.ts';
import { CATEGORIES } from './types.ts';
import { BasicForm } from './abstractForm.ts';

class SeetingsForm extends BasicForm {
    constructor(args: any) {
        super(args);
        this._settings = sortCategorieSettings(foundry.utils.deepClone(getSettings()));
    }

    public _settings;

    static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> & { dragDrop: DragDropConfiguration[] } = {
        id: 'slcs-settingsForm',
        tag: 'form',
        form: {
            handler: SeetingsForm.settingsFormHandler,
            submitOnChange: true,
            closeOnSubmit: false,
        },
        position: {
            width: 1200,
            height: 640,
        },
        window: {
            icon: 'fas fa-gear', // You can now add an icon to the header
            title: 'Categorized Character Sheet configuration',
            controls: [],
            contentClasses: ['standard-form', 'slcs-form'],
            resizable: true,
        },
        actions: {
            save: this.#onSave,
            addItem: this.#onAddItem,
            deleteItem: this.#deleteItem,
        },
        dragDrop: [{ dragSelector: '.itemrow', dropSelector: '.slcs-trait-list' }],
    };

    override async _onDragStart(event: DragEvent) {
        const item = event.currentTarget as HTMLElement;
        const cat = item.dataset.category;
        const type = item.dataset.type;
        const i = Number(item.dataset.index);
        if (cat && !isNaN(i) && type) {
            const dragData = {
                category: cat,
                index: i,
                type: type,
            };
            event.dataTransfer?.setData('text/plain', JSON.stringify(dragData));
        }
    }

    protected override async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData(event);
        const target = event.currentTarget as HTMLElement;

        const sourceCat = data.category as string;
        const targetCat = target.dataset.category as string;
        const index = data.index as number;
        const type = data.type as string;
        if (sourceCat && targetCat) {
            if (sourceCat === targetCat) return;
            const val = this._settings.items[type][sourceCat][index];
            if (val != undefined && val != null) {
                if (!event.shiftKey) {
                    this._settings.items[type][sourceCat].splice(index, 1);
                }
                this._settings.items[type][targetCat].push(val);
                this._settings = sortCategorieSettings(this._settings);
                await this.render();
                this._scrollTo(type, targetCat, val);
            }
        }
    }

    static override PARTS = {
        navigation: {
            template: 'modules/gurps-categorized-sheet/templates/slcs-nav.hbs',
        },
        generalTab: {
            template: 'modules/gurps-categorized-sheet/templates/settingsFormGeneral.hbs',
        },
        skillsTab: {
            template: 'modules/gurps-categorized-sheet/templates/settingsFormSkills.hbs',
            scrollable: CATEGORIES.map((i) => `#slcs-skills-${i}`),
        },
        traitsTab: {
            template: 'modules/gurps-categorized-sheet/templates/settingsFormTraits.hbs',
            scrollable: CATEGORIES.map((i) => `#slcs-traits-${i}`),
        },
        footer: {
            template: 'templates/generic/form-footer.hbs',
        },
    };

    // Set initial values for tabgroups
    override tabGroups: Record<string, string> = {
        primary: 'general',
    };

    protected override _getTabs(): Record<string, Partial<ApplicationTab>> {
        return this._markTabs({
            generalTab: {
                id: 'general',
                group: 'primary',
                icon: 'fa-solid fa-cog',
                label: 'General',
            },
            skillsTab: {
                id: 'skills',
                group: 'primary',
                icon: 'fa-solid fa-cog',
                label: 'Skills',
            },
            traitsTab: {
                id: 'traits',
                group: 'primary',
                icon: 'fa-solid fa-cog',
                label: 'Traits',
            },
        });
    }

    override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
        const context = await super._prepareContext(options);
        const settings = this._settings;
        return {
            ...context,
            settings: settings,
            buttons: [{ action: 'save', icon: 'fa-solid fa-save', label: 'SETTINGS.Save' }],
        };
    }

    protected async _scrollTo(type: string, cat: string, value: string) {
        const list = $(this.element).find(`#slcs-${type}-${cat}`);
        const item = list.find(`input[value="${value}"]`);
        list.scrollTop(item[0]?.offsetTop ?? 0);
    }

    protected async _scrollToAndFocus(type: string, cat: string, value: string) {
        const list = $(this.element).find(`#slcs-${type}-${cat}`);
        const item = list.find(`input[value="${value}"]`);
        list.scrollTop(item[0]?.offsetTop ?? 0);
        item.trigger('focus');
    }

    static async #onSave(this: SeetingsForm, event: Event): Promise<void> {
        event.preventDefault();
        setSettings(this._settings);
        this.close();
    }

    static async #onAddItem(this: SeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category;
        const type = target.dataset.type;
        if (cat && type) {
            this._settings.items[type][cat].push('');
            await this.render();
            this._scrollToAndFocus(type, cat, '');
        }
    }

    static async #deleteItem(this: SeetingsForm, event: Event, target: HTMLElement): Promise<void> {
        event.preventDefault();
        const cat = target.dataset.category;
        const i = Number(target.dataset.index);
        const type = target.dataset.type;
        if (cat && !isNaN(i) && type) {
            this._settings.items[type][cat].splice(i, 1);
            this.render();
        }
    }

    /**
     * Process form submission for the sheet
     * @this {MyApplication}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} event                   The originating form submission event
     * @param {HTMLFormElement} form                The form element that was submitted
     * @param {FormDataExtended} formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static async settingsFormHandler(
        this: SeetingsForm,
        event: Event | SubmitEvent,
        form: HTMLFormElement,
        formData: FormDataExtended,
    ) {
        // Do things with the returned FormData
        const newSettings = foundry.utils.expandObject(formData.object).settings as CatSheetSettings;
        this._settings.rollTables = newSettings.rollTables;
        this._settings.allowExtraEffort = newSettings.allowExtraEffort;
        this._settings.hideInactiveAttacks = newSettings.hideInactiveAttacks;
        this._settings.items.skills = newSettings.items.skills;
        this._settings.items.traits = newSettings.items.traits;
        this._settings = sortCategorieSettings(this._settings);
        this.render();
    }
}

interface SeetingsForm {
    constructor: typeof SeetingsForm;
    options: DocumentSheetConfiguration & { dragDrop: DragDropConfiguration[] };
}

export { SeetingsForm };
