import { CategoryList, CATEGORIES, NamedItem } from './types.ts';
import { getMergedSettings } from './actor-settings.ts';
import { CategoryOrOthers, Category } from './types.ts';
import { DisplaySkill, DisplayTrait } from '@gurps-types/gurps/display-item.ts';
import { filterDisplayItems, recItem } from './displayItemUtils.ts';
import { GurpsActorV2 } from '@module/actor/gurps-actor.ts';
import { ActorType } from '@module/actor/types.ts';

function isOthers(categories: CategoryList, name: string) {
    return CATEGORIES.every((c) => !categories[c].some((n: string) => name.startsWith(n)));
}

function isInCategory(categories: CategoryList, category: Category, name: string): boolean {
    return categories[category].some((n: string) => name.startsWith(n));
}

export function categorize<T extends recItem>(categories: CategoryList, input: T[], category: CategoryOrOthers): T[] {
    if (category === 'others') {
        return filterDisplayItems(input, (i) => isOthers(categories, i.name));
    } else {
        return filterDisplayItems(input, (i) => isInCategory(categories, category, i.name));
    }
}

export function categorizeItem<T extends NamedItem>(
    categories: CategoryList,
    input: T[],
    category: CategoryOrOthers,
): T[] {
    if (category === 'others') {
        return input.filter((i) => isOthers(categories, i.name));
    } else {
        return input.filter((i) => isInCategory(categories, category, i.name));
    }
}

export function categorizeSkills(
    actor: GurpsActorV2<ActorType.Character>,
    skills: DisplaySkill[],
    category: CategoryOrOthers,
) {
    return categorize(getMergedSettings(actor).items.skills, skills, category);
}

export function categorizeTraits(
    actor: GurpsActorV2<ActorType.Character>,
    traits: DisplayTrait[],
    category: CategoryOrOthers,
) {
    return categorize(getMergedSettings(actor).items.traits, traits, category);
}
