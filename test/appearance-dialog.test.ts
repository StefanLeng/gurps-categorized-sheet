/** @jest-environment jsdom */
import { beforeEach, describe, expect, it } from '@jest/globals';
import { openPersonalAppearance } from '../src/module/appearance.ts';

let preferences: Record<string, any>;
let writes: number;
let config: any;
let template: string;
let context: any;

beforeEach(() => {
    preferences = { theme: 'dark', readable: true };
    writes = 0;
    document.body.innerHTML = '';
    (global as any).game = {
        user: {
            getFlag: () => preferences,
            setFlag: async (_module: string, _key: string, value: Record<string, any>) => {
                preferences = value;
                writes++;
            },
        },
        settings: { get: (_module: string, key: string) => (key === 'appearanceAccessible' ? false : '1') },
    };
    (global as any).foundry = {
        applications: {
            handlebars: {
                renderTemplate: async (path: string, data: any) => {
                    template = path;
                    context = data;
                    return '<p>Rendered template</p>';
                },
            },
            api: {
                DialogV2: class {
                    constructor(options: any) {
                        config = options;
                    }
                    render(options: any) {
                        expect(options).toEqual({ force: true });
                    }
                },
            },
        },
    };
});

describe('Personal appearance DialogV2', () => {
    it('renders a template with the saved selections and makes Cancel non-mutating', async () => {
        await openPersonalAppearance();
        expect(template).toBe('modules/gurps-categorized-sheet/templates/personal-appearance.hbs');
        expect(config.content).toBe('<p>Rendered template</p>');
        expect(
            context.fields
                .find((field: any) => field.key === 'theme')
                .options.find((option: any) => option.id === 'dark').selected,
        ).toBe(true);
        expect(context.readable).toBe(true);
        expect(config.buttons.find((button: any) => button.action === 'cancel').callback).toBeUndefined();
        expect(writes).toBe(0);
    });

    it('saves from the native button form and resets only user preferences', async () => {
        await openPersonalAppearance();
        const form = document.createElement('form');
        for (const field of context.fields) {
            const input = document.createElement('input');
            input.name = field.key;
            input.value = field.key === 'theme' ? 'fantasy' : field.options[0].id;
            form.append(input);
        }
        await config.buttons.find((button: any) => button.action === 'save').callback(null, { form });
        expect(preferences.theme).toBe('fantasy');
        expect(preferences.readable).toBe(false);
        expect(preferences.accessible).toBe(false);
        expect(writes).toBe(1);
        await config.buttons.find((button: any) => button.action === 'reset').callback();
        expect(preferences.theme).toBe('inherit');
        expect(preferences.scale).toBe('1');
        expect(writes).toBe(2);
    });
});
