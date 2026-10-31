import { MODULE_ID } from './constants.ts';

/** User flags travel with the user and never change a shared actor's appearance. */
export const PERSONAL_DEFAULTS = {
    theme: 'inherit',
    decoration: 'full',
    density: 'comfortable',
    contrast: 'theme',
    readable: false,
};

export function personalAppearance(): Record<string, any> {
    const saved = game.user?.getFlag(MODULE_ID, 'appearance') as Record<string, unknown> | undefined;
    return { ...PERSONAL_DEFAULTS, ...(saved ?? {}) };
}

export async function savePersonalAppearance(value: Record<string, any>): Promise<void> {
    await game.user?.setFlag(MODULE_ID, 'appearance', value);
}

export async function resetPersonalAppearance(): Promise<void> {
    await savePersonalAppearance({ ...PERSONAL_DEFAULTS, scale: '1', text: '1', accessible: false });
}
