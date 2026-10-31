import { getMergedSettings } from './actor-settings.ts';
import { personalAppearance, savePersonalAppearance, resetPersonalAppearance } from './personal-appearance.ts';
import { MODULE_ID } from './constants.ts';
import { getSettings } from './settings.ts';

export const THEMES: Record<string, string> = {
    original: 'Original (unchanged)',
    classic: 'Classic Light',
    dark: 'Dark',
    fantasy: 'Fantasy',
    scifi: 'Sci-Fi',
    horror: 'Horror',
    action: 'Action / Espionage',
    pulp: 'Pulp / Historical',
    supers: 'Supers',
    contrast: 'High Contrast',
};

const ROOTS = '.sl-cat-sheet, .slcs-settingsForm, .slcs-actorSettingsForm';
const originals = new WeakMap<HTMLElement, { light: boolean; dark: boolean }>();
const rootActors = new WeakMap<HTMLElement, Actor | null>();

function setting(key: 'appearanceAccessible'): boolean;
function setting(key: 'appearanceScale' | 'appearanceText'): string;
function setting(key: 'appearanceAccessible' | 'appearanceScale' | 'appearanceText') {
    return game.settings?.get(MODULE_ID, key);
}

export function refreshSheets(): void {
    // World settings can change categories and configured actions, so refresh content.
    const windows = (foundry as any).ui?.windows ?? (globalThis as any).ui?.windows ?? {};
    for (const app of Object.values(windows) as any[]) {
        const root = app.element?.[0] ?? app.element;
        if (root instanceof HTMLElement && root.matches(ROOTS)) app.render(false);
    }
}

export function refreshAppearance(): void {
    // Appearance updates do not destroy focused controls or GGA's Quick Notes editor.
    document.querySelectorAll<HTMLElement>(ROOTS).forEach((root) => {
        const windows = (foundry as any).ui?.windows ?? (globalThis as any).ui?.windows ?? {};
        const app = Object.values(windows).find((w: any) => (w.element?.[0] ?? w.element) === root) as any;
        applyAppearance(root, app?.actor ?? rootActors.get(root) ?? null);
    });
}

export function openPersonalAppearance(): void {
    const value = personalAppearance();
    const choices: Record<string, Record<string, string>> = {
        theme: { inherit: 'Use actor / world theme', ...THEMES },
        decoration: { off: 'Off', subtle: 'Subtle', full: 'Full' },
        density: { comfortable: 'Comfortable', compact: 'Compact' },
        contrast: { theme: 'Theme colours', light: 'High contrast light', dark: 'High contrast dark' },
        scale: { '0.8': '80%', '0.9': '90%', '1': '100%', '1.1': '110%', '1.25': '125%', '1.5': '150%' },
        text: { '1': '100%', '1.1': '110%', '1.25': '125%', '1.5': '150%' },
    };
    value.scale ??= setting('appearanceScale');
    value.text ??= setting('appearanceText');
    value.accessible ??= setting('appearanceAccessible');
    const labels: Record<string, string> = {
        theme: 'Theme',
        decoration: 'Decoration',
        density: 'Spacing',
        contrast: 'Contrast',
        scale: 'Overall scale',
        text: 'Text size',
    };
    const content =
        '<form><p>Personal preferences for your sheets. Shared character settings and data stay unchanged.</p>' +
        Object.entries(choices)
            .map(
                ([key, values]) =>
                    '<div class="form-group"><label for="slcs-personal-' +
                    key +
                    '">' +
                    labels[key] +
                    '</label><select id="slcs-personal-' +
                    key +
                    '" name="' +
                    key +
                    '">' +
                    Object.entries(values)
                        .map(
                            ([id, label]) =>
                                '<option value="' +
                                id +
                                '"' +
                                (value[key] === id ? ' selected' : '') +
                                '>' +
                                label +
                                '</option>',
                        )
                        .join('') +
                    '</select></div>',
            )
            .join('') +
        ['readable', 'accessible']
            .map(
                (key) =>
                    '<div class="form-group"><label><input type="checkbox" name="' +
                    key +
                    '"' +
                    (value[key] ? ' checked' : '') +
                    '> ' +
                    (key === 'readable' ? 'Plain typography' : 'Colour-independent indicators') +
                    '</label></div>',
            )
            .join('') +
        '</form>';
    new foundry.appv1.api.Dialog({
        title: 'Categorized Sheet: personal appearance',
        content,
        buttons: {
            save: {
                label: 'Save',
                callback: async (html: any) => {
                    const form = html[0].querySelector('form');
                    const next = { ...value };
                    for (const key of Object.keys(choices)) next[key] = form.elements.namedItem(key).value;
                    for (const key of ['readable', 'accessible']) next[key] = form.elements.namedItem(key).checked;
                    await savePersonalAppearance(next);
                    refreshAppearance();
                },
            },
            reset: {
                label: 'Reset my appearance',
                callback: async () => {
                    await resetPersonalAppearance();
                    refreshAppearance();
                },
            },
            cancel: { label: 'Cancel' },
        },
        default: 'save',
    }).render(true);
}

export function registerAppearance(): void {
    game.settings?.register(MODULE_ID, 'appearanceAccessible', {
        name: 'Categorized Sheet: colour-independent indicators',
        hint: 'Underline selected actions and use neutral, labelled resource states. Applies with any theme.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: refreshAppearance,
    });

    for (const [key, name, hint, choices] of [
        [
            'appearanceScale',
            'Categorized Sheet: overall scale',
            'Scales text, boxes, controls and spacing. Larger scales require a larger window or scrolling.',
            { '0.8': '80%', '0.9': '90%', '1': '100%', '1.1': '110%', '1.25': '125%', '1.5': '150%' },
        ],
        [
            'appearanceText',
            'Categorized Sheet: text size',
            'Additional text enlargement, independent of overall scale. Dense tables may need scrolling.',
            { '1': '100%', '1.1': '110%', '1.25': '125%', '1.5': '150%' },
        ],
    ] as const) {
        game.settings?.register(MODULE_ID, key, {
            name,
            hint,
            scope: 'client',
            config: true,
            type: String,
            choices,
            default: '1',
            onChange: refreshAppearance,
        });
    }
}

function scaleValue(value: string, choices: number[]): number {
    const n = Number(value);
    return choices.includes(n) ? n : 1;
}

export function applyAppearance(root: HTMLElement, actor: Actor | null): void {
    if (!root?.matches(ROOTS)) return;
    rootActors.set(root, actor);

    if (!originals.has(root))
        originals.set(root, {
            light: root.classList.contains('theme-light'),
            dark: root.classList.contains('theme-dark'),
        });

    const personal = personalAppearance();
    const inherited = (actor ? getMergedSettings(actor).appearanceTheme : getSettings().appearanceTheme) ?? 'original';
    const chosen = personal.theme === 'inherit' ? inherited : personal.theme;
    const contrast = ['light', 'dark'].includes(personal.contrast) ? personal.contrast : 'theme';
    const effective = chosen === 'original' && contrast !== 'theme' ? 'classic' : chosen;
    const theme = Object.prototype.hasOwnProperty.call(THEMES, effective) ? effective : 'original';
    const accessible = personal.accessible ?? setting('appearanceAccessible');
    const scale = scaleValue(personal.scale ?? setting('appearanceScale'), [0.8, 0.9, 1, 1.1, 1.25, 1.5]);
    const text = scaleValue(personal.text ?? setting('appearanceText'), [1, 1.1, 1.25, 1.5]);

    root.dataset.slcsTheme = theme;
    root.dataset.slcsContrast = contrast;
    root.dataset.slcsDecoration = personal.decoration;
    root.dataset.slcsDecorative = String(personal.decoration !== 'off' && contrast === 'theme');
    root.dataset.slcsDensity = personal.density;
    root.dataset.slcsReadable = String(personal.readable);
    root.dataset.slcsAccessible = String(accessible);
    root.dataset.slcsAppearance = 'true';

    root.style.setProperty('--slcs-scale', String(scale));
    root.style.setProperty('--slcs-text-scale', String(text));
    root.dataset.slcsTextScaled = String(text !== 1);
    root.dataset.slcsScaled = String(scale !== 1 || text !== 1);

    const dark = ['dark', 'scifi', 'horror', 'action', 'contrast'].includes(theme);
    if (theme !== 'original') {
        root.classList.toggle('theme-dark', dark);
        root.classList.toggle('theme-light', !dark);
    } else {
        const initial = originals.get(root)!;
        root.classList.toggle('theme-dark', initial.dark);
        root.classList.toggle('theme-light', initial.light);
    }

    if (contrast !== 'theme') {
        root.classList.toggle('theme-dark', contrast === 'dark');
        root.classList.toggle('theme-light', contrast === 'light');
    }

    // Read the rendered threshold colour only. Preserve configured colours and labels.
    root.querySelectorAll<HTMLElement>('.tracked-resource .condition').forEach((el) => {
        el.style.removeProperty('--slcs-threshold-text');
        if (theme === 'original' || accessible) return;
        const bg = getComputedStyle(el)
            .backgroundColor.match(/[\d.]+/g)
            ?.map(Number);
        if (!bg || bg.length < 3) return;
        const surface = getComputedStyle(root).getPropertyValue('--slcs-surface').trim();
        const hex = /^#([0-9a-f]{6})$/i.exec(surface);
        const base = hex ? [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)) : [255, 255, 255];
        const alpha = bg[3] ?? 1;
        const rgb = bg
            .slice(0, 3)
            .map((v, i) => (v * alpha + base[i] * (1 - alpha)) / 255)
            .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        el.style.setProperty('--slcs-threshold-text', luminance > 0.179 ? '#000000' : '#ffffff');
    });
}
