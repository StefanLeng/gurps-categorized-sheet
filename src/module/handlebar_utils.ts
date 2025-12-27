import { encumberanceName } from './util.ts';

const partialPath = 'modules/gurps-categorized-sheet/templates/partials/';
// === register Handlebars partials ===
// Partial name will be the last component of the path name, e.g.: 'systems/gurps/templates/actor/foo.hbs" -- the name is "foo".
// Use it in an HTML/HBS file like this: {{> foo }}.
// See https://handlebarsjs.com/guide/partials.html#partials for more documentation.
export async function registerHandlebarsPartials() {
    const templates = [
        'slcs-basic-attributes',
        'slcs-portrait',
        'slcs-secondary-attributes',
        'slcs-modifierlist',
        'slcs-conditions',
        'slcs-skills',
        'slcs-melee-attacks',
        'slcs-ranged-attacks',
        'slcs-defences',
        'slcs-advantages',
        'slcs-hpfptracker',
        'slcs-hpfp',
        'slcs-melee-weapons',
        'slcs-ranged-weapons',
        'slcs-target',
        'slcs-lifting',
        'slcs-reactions',
        'slcs-description',
        'slcs-equipment',
        'slcs-spells',
        'slcs-criticalRolls',
        'slcs-traitSorter',
        'slcs-sense-rolls',
        'slcs-otf-region',
        'slcs-qnotes',
        'slcs-resource-tracker',
        'slcs-trackers',
    ];

    for (const name of templates) {
        const filename = partialPath + name + '.hbs';
        const it = await fetch(filename);
        const text = await it.text();
        Handlebars.registerPartial(name, text);
    }
}

export function registerHandlebarsHelpers() {
    Handlebars.registerHelper('stripes', function (obj, even, odd, options) {
        let buffer = '';
        const data = Handlebars.createFrame(options.data);

        if (foundry.utils.getType(obj) === 'Array' && obj.length > 0) {
            for (let i = 0, j = obj.length; i < j; i++) {
                const item = obj[i];
                data.index = i;
                data.first = i === 0;
                data.last = i === j - 1;

                // we'll just put the appropriate stripe class name onto the item for now
                item.stripeClass = i % 2 == 0 ? odd : even;

                // show the inside of the block
                buffer += options.fn(item, { data: data });
            }

            // return the finished buffer
            return buffer;
        } else if (foundry.utils.getType(obj) === 'Object' && Object.values(obj).length > 0) {
            let i = 0;
            for (const key in obj) {
                const item = obj[key];
                data.first = i === 0;

                // we'll just put the appropriate stripe class name onto the item for now
                item.stripeClass = i % 2 == 0 ? odd : even;

                // show the inside of the block
                data.key = key;
                buffer += options.fn(item, { data: data });
                i += 1;
            }
            // return the finished buffer
            return buffer;
        } else {
            return options.inverse();
        }
    });

    Handlebars.registerHelper('stripesouter', function (obj, even, odd, inner, options) {
        let buffer = '';
        const data = Handlebars.createFrame(options.data);

        let innerCount = 0;
        if (foundry.utils.getType(obj) === 'Array' && obj.length > 0) {
            for (let i = 0, j = obj.length; i < j; i++) {
                const item = obj[i];
                data.index = i;
                data.first = i === 0;
                data.last = i === j - 1;

                // we'll just put the appropriate stripe class name onto the item for now
                item.stripeClass = innerCount % 2 == 0 ? odd : even;

                // show the inside of the block
                buffer += options.fn(item, { data: data });
                innerCount += item[inner].length;
            }

            // return the finished buffer
            return buffer;
        } else {
            return options.inverse();
        }
    });

    Handlebars.registerHelper('encumberanceName', encumberanceName);

    Handlebars.registerHelper('select-if-included', function (value: string, expectedArray: string[] | undefined) {
        return expectedArray?.some((i) => i === value) ? 'selected' : '';
    });
}
