import { CATEGORIES, OTF_REGIONS } from './types.ts';
import { BasicForm } from './abstractForm.ts';

abstract class BaseSeetingsForm extends BasicForm {
    static override DEFAULT_OPTIONS: Partial<DocumentSheetConfiguration> &
        Partial<{ dragDrop: DragDropConfiguration[] }> = {
        position: {
            width: 1200,
            height: 640,
        },
        window: {
            icon: 'fas fa-gear', // You can now add an icon to the header
            controls: [],
            contentClasses: ['standard-form', 'slcs-form'],
            resizable: true,
        },
        actions: {},
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

    protected abstract addItemToCategory(type: string, cat: string, val: string): void;

    protected abstract removeItemFromCategory(type: string, cat: string, val: string): void;

    protected abstract getItemValue(type: string, sourceCat: string, index: number): string;

    protected override async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData(event);
        const target = event.currentTarget as HTMLElement;
        const sourceCat = data.category as string;
        const targetCat = target.dataset.category as string;
        const index = data.index as number;
        const type = data.type as string;
        if (sourceCat && targetCat) {
            if (sourceCat === targetCat) return;
            const val = this.getItemValue(type, sourceCat, index);
            if (val != undefined && val != null) {
                this.addItemToCategory(type, targetCat, val);
                if (!event.shiftKey) {
                    this.removeItemFromCategory(type, sourceCat, val);
                }
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
        OTFsTab: {
            template: 'modules/gurps-categorized-sheet/templates/settingsFormOTFs.hbs',
            scrollable: ['#slcs-sheet-OTFs .OTF-config'],
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
            OTFsTab: {
                id: 'OTFs',
                group: 'primary',
                icon: 'fa-solid fa-cog',
                label: 'Sheet OTFs',
            },
        });
    }

    override async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
        const context = await super._prepareContext(options);
        return {
            ...context,
            otfRegions: OTF_REGIONS,
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

    /**
     * Process form submission for the sheet
     * @this {MyApplication}                      The handler is called with the application as its bound scope
     * @param {SubmitEvent} _event                   The originating form submission event
     * @param {HTMLFormElement} _form                The form element that was submitted
     * @param {FormDataExtended} _formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static async settingsFormHandler(
        this: BaseSeetingsForm,
        _event: Event | SubmitEvent,
        _form: HTMLFormElement,
        _formData: FormDataExtended,
    ) {
        this.render();
    }
}

export { BaseSeetingsForm };
