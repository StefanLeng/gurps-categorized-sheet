/** @jest-environment jsdom */
import { beforeEach, describe, expect, it } from '@jest/globals';
import { arrangeLayout, selectedLayout } from '../src/module/layouts.ts';

let preferences: Record<string, any>;
beforeEach(() => {
    preferences = { layout: 'dashboard', panels: ['notes', 'defenses', 'resources'] };
    (global as any).game = { user: { getFlag: () => preferences } };
    document.body.innerHTML = `<section class="sl-cat-sheet"><div class="slcs-main">
        <div class="tab" data-tab="workspace"><div class="slcs-workspace"></div></div>
        <div class="tab" data-tab="combat"><div class="tab" data-tab="defenses"><div class="col-tabcontent"><button class="slcs-defenses" data-otf="Dodge">10</button></div></div>
        <div class="tab" data-tab="resources"><div class="col-tabcontent"><input name="tracker" value="4"></div></div><aside class="slcs-tactical-aside"></aside></div>
        <div class="tab" data-tab="others"><div class="qnotes">A note</div></div></div></section>`;
});

describe('Optional layouts', () => {
    it('moves and returns the same nodes, retaining event handlers and input values', () => {
        const root = document.querySelector<HTMLElement>('.sl-cat-sheet')!;
        const notes = root.querySelector('.qnotes')!;
        const button = root.querySelector('button')!;
        const input = root.querySelector('input')!;
        let rolls = 0;
        button.addEventListener('click', () => rolls++);
        input.value = '3';
        for (let i = 0; i < 3; i++) {
            arrangeLayout(root, true);
            expect(root.querySelector('.slcs-workspace .qnotes')).toBe(notes);
            expect(root.querySelectorAll('[name="tracker"]')).toHaveLength(1);
            button.click();
            arrangeLayout(root, false);
            expect(root.querySelector('[data-tab="others"] .qnotes')).toBe(notes);
        }
        expect(rolls).toBe(3);
        expect(input.value).toBe('3');
    });
    it('places defences and resources alongside Tactical combat controls', () => {
        preferences.layout = 'tactical';
        const root = document.querySelector<HTMLElement>('.sl-cat-sheet')!;
        arrangeLayout(root, false);
        expect(root.querySelector('.slcs-tactical-aside .slcs-defenses')).not.toBeNull();
        expect(root.querySelector('.slcs-tactical-aside input')).not.toBeNull();
        preferences.layout = 'standard';
        arrangeLayout(root, false);
        expect(root.querySelector('.slcs-tactical-aside')!.children).toHaveLength(0);
        expect(root.querySelector('[data-tab="resources"] input')).not.toBeNull();
    });
    it('provides an empty-dashboard explanation and rejects unknown layout IDs', () => {
        preferences.panels = [];
        const root = document.querySelector<HTMLElement>('.sl-cat-sheet')!;
        arrangeLayout(root, true);
        expect(root.querySelector('.slcs-workspace')!.textContent).toContain('Choose panels');
        preferences.layout = 'unknown';
        expect(selectedLayout()).toBe('standard');
    });
});
