import { encumberanceName } from './util.ts';

// === register Handlebars partials ===
// Partial name will be the last component of the path name, e.g.: 'systems/gurps/templates/actor/foo.hbs" -- the name is "foo".
// Use it in an HTML/HBS file like this: {{> foo }}.
// See https://handlebarsjs.com/guide/partials.html#partials for more documentation.
export function registerHandlebarsPartials() {
    const templates = [
        'modules/gurps-categorized-sheet/templates/partials/slcs-basic-attributes.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-portrait.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-secondary-attributes.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-modifierlist.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-conditions.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-skills.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-melee-attacks.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-ranged-attacks.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-defences.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-advantages.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-hpfptracker.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-hpfp.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-melee-weapons.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-ranged-weapons.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-target.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-lifting.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-reactions.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-description.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-equipment.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-spells.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-criticalRolls.hbs',
        'modules/gurps-categorized-sheet/templates/partials/slcs-traitSorter.hbs',
    ];

    templates.forEach((filename) => {
        const name = filename.substr(filename.lastIndexOf('/') + 1).replace(/(.*)\.hbs/, '$1');
        fetch(filename)
            .then((it) => it.text())
            .then(async (text) => {
                Handlebars.registerPartial(name, text);
            });
    });
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
}
