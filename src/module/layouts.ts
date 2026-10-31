import { personalAppearance, savePersonalAppearance } from './personal-appearance.ts';

export const LAYOUTS: Record<string, string> = {
    standard: 'Standard tabs',
    tactical: 'Tactical Wide',
    field: 'Field focus',
    investigator: 'Investigator',
    powers: 'Powers desk',
    dashboard: 'Personal dashboard',
};
export const DASHBOARD_PANELS: Record<string, string> = {
    favourites: 'Favourites',
    defenses: 'Defences',
    resources: 'Resources',
    notes: 'Quick Notes',
    equipment: 'Equipment',
    movement: 'Movement & lifting',
    senses: 'Senses',
};
const DEFAULT_PANELS = ['favourites', 'defenses', 'resources', 'notes'];
const borrowed = new WeakMap<HTMLElement, { node: HTMLElement; marker: Comment }[]>();

export function selectedLayout(): string {
    const value = personalAppearance().layout;
    return Object.hasOwn(LAYOUTS, value) ? value : 'standard';
}

/** Move real panels, never clones: IDs, data-key, form inputs, and handlers survive. */
export function arrangeLayout(root: HTMLElement, workspaceActive: boolean): void {
    for (const { node, marker } of borrowed.get(root) ?? []) {
        marker.replaceWith(node);
    }
    borrowed.set(root, []);
    const layout = selectedLayout();
    root.dataset.slcsLayout = layout;
    const workspace = root.querySelector<HTMLElement>('.slcs-workspace');
    const aside = root.querySelector<HTMLElement>('.slcs-tactical-aside');
    if (!workspace || !aside) return;
    workspace.replaceChildren();
    aside.replaceChildren();
    const source = (tab: string, selector: string) => `.slcs-main > .tab[data-tab="${tab}"] ${selector}`;
    function move(title: string, selectors: string[], host: HTMLElement) {
        const panel = document.createElement('section');
        panel.className = 'slcs-workspace-panel';
        panel.dataset.slcsPanel = title;
        const heading = document.createElement('h3');
        heading.textContent = title;
        panel.append(heading);
        let count = 0;
        for (const selector of selectors)
            root.querySelectorAll<HTMLElement>(selector).forEach((node) => {
                node.dataset.slcsOrigin ??=
                    node.closest<HTMLElement>('[data-group="primary-tabs"][data-tab]')?.dataset.tab ?? '';
                const marker = document.createComment('slcs panel origin');
                node.before(marker);
                borrowed.get(root)!.push({ node, marker });
                panel.append(node);
                count++;
            });
        if (!count) {
            const empty = document.createElement('p');
            empty.className = 'slcs-empty-panel';
            empty.textContent = 'No entries configured.';
            panel.append(empty);
        }
        host.append(panel);
    }
    const notes = [source('others', '.qnotes')];
    const resources = [source('combat', '[data-tab="resources"] .col-tabcontent > *')];
    const defenses = [source('combat', '[data-tab="defenses"] .col-tabcontent > *')];
    const senses = [source('exploration', '.slcs-sense-rolls')];
    const movement = [source('exploration', '.slcs-lifting')];
    if (layout === 'tactical') {
        move('Defences', defenses, aside);
        move('Resources', resources, aside);
        return;
    }
    if (!workspaceActive || layout === 'standard') return;
    if (layout === 'field') {
        move('Exploration skills & traits', [source('exploration', '.slcs-col1 > *')], workspace);
        move('Movement & lifting', movement, workspace);
        move('Senses', senses, workspace);
        move('Resources', resources, workspace);
        move('Quick Notes', notes, workspace);
    } else if (layout === 'investigator') {
        move('Social skills & traits', [source('social', '.slcs-col1 > *')], workspace);
        move('Research & technical skills', [source('technical', '.slcs-skills')], workspace);
        move('Quick Notes', notes, workspace);
        move('Senses', senses, workspace);
        move('Reactions', [source('social', '.slcs-reactions'), source('social', '.slcs-reaction-roll')], workspace);
    } else if (layout === 'powers') {
        move('Power skills & traits', [source('powers', '.slcs-col1 > *')], workspace);
        move('Spells & configured actions', [source('powers', '.slcs-col2 > *')], workspace);
        move('Resources', resources, workspace);
        move('Quick Notes', notes, workspace);
    } else if (layout === 'dashboard') {
        const selectors: Record<string, string[]> = {
            favourites: [source('fav', '.slcs-skills'), source('fav', '.slcs-advantages')],
            defenses,
            resources,
            notes,
            senses,
            movement,
            equipment: [source('equipment', '.slcs-equipment-tab > *')],
        };
        const preference = personalAppearance().panels;
        const panels = Array.isArray(preference)
            ? preference.filter((key) => Object.hasOwn(DASHBOARD_PANELS, key))
            : DEFAULT_PANELS;
        for (const key of panels) move(DASHBOARD_PANELS[key], selectors[key], workspace);
        if (!panels.length) workspace.textContent = 'Choose panels in Appearance to build your dashboard.';
    }
}

export async function saveLayoutPreference(layout: string): Promise<void> {
    if (Object.hasOwn(LAYOUTS, layout)) await savePersonalAppearance({ ...personalAppearance(), layout });
}
