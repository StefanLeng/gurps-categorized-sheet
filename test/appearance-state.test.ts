/** @jest-environment jsdom */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { applyAppearance, refreshAppearance, refreshSheets } from '../src/module/appearance.ts';
import { personalAppearance, resetPersonalAppearance } from '../src/module/personal-appearance.ts';
import { SheetViewState } from '../src/module/view-state.ts';

jest.mock('../src/module/actor-settings.ts', () => ({ getMergedSettings: () => ({ appearanceTheme: 'fantasy' }) }));
jest.mock('../src/module/settings.ts', () => ({ getSettings: () => ({ appearanceTheme: 'classic' }) }));

let preferences: Record<string, any>;
let writes: any[];
beforeEach(() => {
    preferences = {};
    writes = [];
    (global as any).game = {
        user: {
            getFlag: () => preferences,
            setFlag: async (...args: any[]) => {
                writes.push(args);
                preferences = { ...preferences, ...args[2] };
            },
        },
        settings: { get: (_: string, key: string) => (key === 'appearanceAccessible' ? false : '1') },
    };
    (global as any).foundry = { ui: { windows: {} } };
    document.body.innerHTML =
        '<section class="sl-cat-sheet theme-light"><div class="window-content"><div class="slcs-main"><div class="tab" data-tab="combat"><div data-key="system.skills.0000"><details class="skill-name"><summary>Sword</summary></details></div></div></div></div></section>';
});

describe('Personal appearance', () => {
    it('still refreshes sheet content for world settings, but not unrelated windows', () => {
        const render = jest.fn();
        const unrelated = jest.fn();
        (global as any).foundry.ui.windows = {
            sheet: { element: [document.querySelector('.sl-cat-sheet')], render },
            other: { element: [document.createElement('aside')], render: unrelated },
        };
        refreshSheets();
        expect(render).toHaveBeenCalled();
        expect(unrelated).not.toHaveBeenCalled();
    });
    it('inherits the actor theme and restores original Foundry classes', () => {
        const root = document.querySelector<HTMLElement>('.sl-cat-sheet')!;
        applyAppearance(root, {} as Actor);
        expect(root.dataset.slcsTheme).toBe('fantasy');
        preferences = { theme: 'dark' };
        applyAppearance(root, null);
        expect(root.classList.contains('theme-dark')).toBe(true);
        preferences = { theme: 'original' };
        applyAppearance(root, null);
        expect(root.classList.contains('theme-light')).toBe(true);
        expect(root.classList.contains('theme-dark')).toBe(false);
    });
    it('updates only marked roots without rerendering any application', () => {
        const render = jest.fn();
        (global as any).foundry.ui.windows = { unrelated: { render } };
        preferences = { theme: 'dark', readable: true, decoration: 'off', contrast: 'light' };
        refreshAppearance();
        expect(render).not.toHaveBeenCalled();
        expect(document.querySelector<HTMLElement>('.sl-cat-sheet')!.dataset.slcsDecorative).toBe('false');
    });
    it('bounds invalid scale values', () => {
        preferences = { scale: '99', text: 'NaN' };
        const root = document.querySelector<HTMLElement>('.sl-cat-sheet')!;
        applyAppearance(root, null);
        expect(root.style.getPropertyValue('--slcs-scale')).toBe('1');
        expect(root.style.getPropertyValue('--slcs-text-scale')).toBe('1');
    });
    it('resets only the current user flag, with no actor APIs', async () => {
        preferences = { theme: 'dark', readable: true };
        await resetPersonalAppearance();
        expect(writes).toHaveLength(1);
        expect(writes[0][1]).toBe('appearance');
        expect(personalAppearance().theme).toBe('inherit');
        expect(personalAppearance().scale).toBe('1');
    });
});

describe('Presentation state', () => {
    it('restores expanded skills after DOM replacement without reverting resource values', () => {
        const root = document.querySelector<HTMLElement>('.sl-cat-sheet')!;
        root.insertAdjacentHTML('beforeend', '<input name="system.HP.value" value="8">');
        root.querySelector('details')!.open = true;
        const state = new SheetViewState();
        state.capture(root);
        root.innerHTML = root.innerHTML.replace(' open=""', '').replace('value="8"', 'value="7"');
        state.restore(root);
        expect(root.querySelector('details')!.open).toBe(true);
        expect(root.querySelector('input')!.value).toBe('7');
    });
});
