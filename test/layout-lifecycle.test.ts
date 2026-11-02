/** @jest-environment jsdom */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Exercise the real sheet lifecycle and panel mover; unrelated game services are stubs.
jest.mock('../src/module/appearance.ts', () => ({ applyAppearance: jest.fn() }));
jest.mock('../src/module/util.js', () => ({}), { virtual: true });
jest.mock('../src/module/categorize.ts', () => ({}));
jest.mock('../src/module/weaponGrips.ts', () => ({}));
jest.mock('../src/module/defenses.ts', () => ({}));
jest.mock('../src/module/targets.ts', () => ({}));
jest.mock('../src/module/sheetOTFs.ts', () => ({}));
jest.mock('../src/module/reactions.ts', () => ({}));
jest.mock('../src/module/rollTables.ts', () => ({}));
jest.mock('../src/module/actorSettingsForm.ts', () => ({}));
jest.mock('../src/module/actor-settings.ts', () => ({}));
jest.mock('../src/module/recursiveList.ts', () => ({}));
jest.mock('../src/module/skills.ts', () => ({}));

const $ = jest.requireActual<typeof import('jquery')>('jquery');
let preferences: Record<string, unknown>;
let freshHP = '10';
const parentTabChange = jest.fn();

function fixture(): HTMLElement {
    const root = document.createElement('section');
    root.className = 'sl-cat-sheet';
    root.innerHTML = `<nav class="slcs-main-tabs">
        <li class="slcs-workspace-link" hidden><a class="tab-item" data-tab="workspace">Workspace</a></li>
        <li><a class="tab-item" data-tab="fav">Favs</a></li>
        <li><a class="tab-item" data-tab="combat">Combat</a></li>
        </nav><div class="slcs-main">
        <div class="tab" data-tab="workspace"><div class="slcs-workspace"></div></div>
        <div class="tab" data-tab="fav"><div class="slcs-skills">Favourites</div></div>
        <div class="tab" data-tab="combat"><aside class="slcs-tactical-aside"></aside>
        <div data-tab="resources"><div class="col-tabcontent"><input name="system.HP.value" value="${freshHP}"></div></div></div>
        <div class="tab" data-tab="others"><div class="qnotes">Notes</div></div>
        </div>`;
    return root;
}

// Minimal Foundry host: tab activation sets state before calling _onChangeTab.
// Navigation is delegated, so target click handlers run BEFORE that activation.
class HostSheet {
    element = $();
    actor = {};
    _tabs = [this.controller('combat'), this.controller('melee')];

    controller(initial: string) {
        const controller = {
            active: initial,
            activate: (active: string, { triggerCallback = true } = {}) => {
                controller.active = active;
                if (triggerCallback) this._onChangeTab(null, controller, active);
            },
        };
        return controller;
    }

    _onChangeTab(event: MouseEvent | null, tabs: unknown, active: string) {
        parentTabChange(event, tabs, active);
    }

    activateListeners(_html: JQuery<HTMLElement>) {}
    _onClickEquip() {}
    _onClickRoll() {}

    async _render() {
        const root = fixture();
        document.body.replaceChildren(root);
        this.element = $(root);
        this.activateListeners(this.element);
        this.element.find('.slcs-main-tabs').on('click', '[data-tab]', (event) => {
            this._tabs[0].activate(event.currentTarget.dataset.tab!);
        });
    }

    async close() {
        this.element.remove();
        this.element = $();
    }
}

(global as any).GURPS = { ActorSheets: { character: HostSheet } };
(global as any).Hooks = { on: jest.fn(), off: jest.fn() };
(global as any).ResizeObserver = class {
    observe() {}
    disconnect() {}
};
const Sheet = (jest.requireActual('../src/module/cat-sheet.ts') as any).default;

beforeEach(() => {
    preferences = { layout: 'standard', panels: ['notes', 'resources'] };
    freshHP = '10';
    (global as any).game = { user: { getFlag: () => preferences } };
    parentTabChange.mockClear();
});

function click(sheet: any, tab: string) {
    sheet.element[0].querySelector(`.slcs-main-tabs [data-tab="${tab}"]`).click();
}

function assertNotes(sheet: any) {
    const root = sheet.element[0] as HTMLElement;
    expect(sheet._tabs[0].active).toBe('workspace');
    expect(root.querySelector('.slcs-workspace .qnotes')?.textContent).toBe('Notes');
    expect(root.querySelectorAll('.qnotes')).toHaveLength(1);
}

describe.each(['field', 'investigator', 'powers', 'dashboard'])('%s sheet lifecycle', (layout) => {
    it('populates Workspace when changing layout from Favourites, including a remembered Favourites tab', async () => {
        const sheet = new Sheet({}, {});
        await sheet._render();
        click(sheet, 'fav');
        preferences.layout = layout;
        sheet.applyPersonalLayout();
        click(sheet, 'workspace');
        assertNotes(sheet);
        click(sheet, 'fav');
        preferences.layout = 'standard';
        sheet.applyPersonalLayout();
        preferences.layout = layout;
        sheet.applyPersonalLayout();
        expect(sheet._tabs[0].active).toBe('fav');
        click(sheet, 'workspace');
        assertNotes(sheet);
    });

    it('populates Workspace after reopening a cached sheet on another tab', async () => {
        preferences.layout = layout;
        const sheet = new Sheet({}, {});
        await sheet._render();
        click(sheet, 'fav');
        await sheet.close();
        await sheet._render();
        expect(sheet._tabs[0].active).toBe('fav');
        click(sheet, 'workspace');
        assertNotes(sheet);
    });

    it('uses fresh actor values after a rerender on another tab and survives appearance refreshes', async () => {
        preferences.layout = layout;
        const sheet = new Sheet({}, {});
        await sheet._render();
        click(sheet, 'fav');
        freshHP = '7';
        await sheet._render();
        expect(sheet._tabs[0].active).toBe('fav');
        preferences.theme = 'dark';
        sheet.applyPersonalLayout();
        click(sheet, 'workspace');
        assertNotes(sheet);
        expect(sheet.element[0].querySelector('input').value).toBe('7');
        const notes = sheet.element[0].querySelector('.qnotes');
        for (let i = 0; i < 3; i++) {
            click(sheet, 'combat');
            expect(sheet.element[0].querySelector('[data-tab="others"] .qnotes')).toBe(notes);
            click(sheet, 'workspace');
            assertNotes(sheet);
        }
    });

    it('handles programmatic tab activation and preserves the parent callback', async () => {
        preferences.layout = layout;
        const sheet = new Sheet({}, {});
        await sheet._render();
        sheet._tabs[0].activate('fav');
        sheet._tabs[0].activate('workspace');
        assertNotes(sheet);
        expect(parentTabChange).toHaveBeenLastCalledWith(null, sheet._tabs[0], 'workspace');
        const panel = sheet.element[0].querySelector('.slcs-workspace-panel');
        sheet._tabs[1].activate('ranged');
        expect(sheet.element[0].querySelector('.slcs-workspace-panel')).toBe(panel);
    });

    it('populates a fresh render when Workspace remains selected', async () => {
        preferences.layout = layout;
        const sheet = new Sheet({}, {});
        await sheet._render();
        const oldNotes = sheet.element[0].querySelector('.qnotes');
        await sheet._render();
        assertNotes(sheet);
        expect(sheet.element[0].querySelector('.qnotes')).not.toBe(oldNotes);
    });
});
