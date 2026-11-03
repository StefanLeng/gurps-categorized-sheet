/** @jest-environment jsdom */
import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const less = jest.requireActual<{
    render: (source: string, options: { filename: string }) => Promise<{ css: string }>;
}>('less');
let css: string;

beforeAll(async () => {
    const filename = resolve('src/styles/gurps-categorized-sheet.less');
    css = (await less.render(readFileSync(filename, 'utf8'), { filename })).css;
});

beforeEach(() => {
    document.head.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
    document.body.innerHTML = `<section class="sl-cat-sheet"><div class="slcs-sheet">
        <nav class="slcs-sheet-tabs slcs-main-tabs"><li class="slcs-workspace-link">Workspace</li><li>Combat</li></nav>
        <div class="slcs-workspace"><section class="slcs-workspace-panel"><h3>Skills</h3><div class="gga-table">A long table</div></section></div>
        <aside class="slcs-tactical-aside"></aside>
    </div></section>`;
});

describe('Compiled layout stylesheet', () => {
    it.each(['standard', 'tactical'])('hides Workspace in %s while keeping Combat visible', (layout) => {
        const root = document.querySelector<HTMLElement>('.sl-cat-sheet')!;
        root.dataset.slcsLayout = layout;
        const link = root.querySelector<HTMLElement>('.slcs-workspace-link')!;
        link.hidden = true;
        expect(getComputedStyle(link).display).toBe('none');
        expect(getComputedStyle(link.nextElementSibling!).display).toBe('inline-block');
    });

    it.each(['field', 'investigator', 'powers', 'dashboard'])(
        'keeps %s navigation inline with the original tabs',
        (layout) => {
            document.querySelector<HTMLElement>('.sl-cat-sheet')!.dataset.slcsLayout = layout;
            expect(getComputedStyle(document.querySelector('.slcs-workspace-link')!).display).toBe('inline-block');
        },
    );

    it('uses content-sized tracks for scrollable workspaces and their moved blocks', () => {
        document.querySelector<HTMLElement>('.sl-cat-sheet')!.dataset.slcsLayout = 'tactical';
        for (const selector of ['.slcs-workspace', '.slcs-tactical-aside', '.slcs-workspace-panel']) {
            const style = getComputedStyle(document.querySelector(selector)!);
            expect(style.display).toBe('grid');
            expect(style.gridAutoRows).toBe('max-content');
        }
    });
});
