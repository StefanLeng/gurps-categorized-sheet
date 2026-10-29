import { getMergedSettings } from './actor-settings.ts';
import SLCatSheet from './cat-sheet.ts';
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

function setting(key: 'appearanceAccessible'): boolean;
function setting(key: 'appearanceScale' | 'appearanceText'): string;
function setting(key: 'appearanceAccessible' | 'appearanceScale' | 'appearanceText') {
    return game.settings?.get(MODULE_ID, key);
}

export function refreshSheets(): void {
    //@ts-expect-error foundry global unknown
    for (const k in foundry.ui.windows) {
        //@ts-expect-error foundry global unknown
        foundry.ui.windows[k].render();
    }
}

export function registerAppearance(): void {
    game.settings?.register(MODULE_ID, 'appearanceAccessible', {
        name: 'Categorized Sheet: colour-independent indicators',
        hint: 'Underline selected actions and use neutral, labelled resource states. Applies with any theme.',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: refreshSheets,
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
            onChange: refreshSheets,
        });
    }
}

function scaleValue(value: string, choices: number[]): number {
    const n = Number(value);
    return choices.includes(n) ? n : 1;
}

export function applyAppearance(root: HTMLElement, actor: Actor | null): void {
    if (!root?.matches(ROOTS)) return;

    if (!originals.has(root))
        originals.set(root, {
            light: root.classList.contains('theme-light'),
            dark: root.classList.contains('theme-dark'),
        });

    const chosen = (actor ? getMergedSettings(actor).appearanceTheme : getSettings().appearanceTheme) ?? 'original';
    const theme = Object.prototype.hasOwnProperty.call(THEMES, chosen) ? chosen : 'original';
    const accessible = setting('appearanceAccessible');
    const scale = scaleValue(setting('appearanceScale'), [0.8, 0.9, 1, 1.1, 1.25, 1.5]);
    const text = scaleValue(setting('appearanceText'), [1, 1.1, 1.25, 1.5]);

    root.dataset.slcsTheme = theme;
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
