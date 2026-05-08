import { CategoryList, CATEGORIES, NamedItem } from './types.ts';
import { getMergedSettings } from './actor-settings.ts';
import { CategoryOrOthers, AddDisad, Category } from './types.ts';
import * as RecursiveList from './recursiveList.ts';
import { DisplaySkill } from '@gurps-types/gurps/display-item.ts';
import { filterDisplayItems, recItem } from './displayItemUtils.ts';

function isOthers(categories: CategoryList, name: string) {
    return CATEGORIES.every((c) => !categories[c].some((n: string) => name.startsWith(n)));
}

function isInCategory(categories: CategoryList, category: Category, name: string): boolean {
    return categories[category].some((n: string) => name.startsWith(n));
}

export function categorize<T extends RecursiveList.Rec<T> & NamedItem>(
    categories: CategoryList,
    input: RecursiveList.List<T>,
    category: CategoryOrOthers,
): RecursiveList.List<T> {
    if (category === 'others') {
        return RecursiveList.filter(input, (i) => isOthers(categories, i.name));
    } else {
        return RecursiveList.filter(input, (i) => isInCategory(categories, category, i.name));
    }
}

export function categorize2<T extends recItem>(categories: CategoryList, input: T[], category: CategoryOrOthers): T[] {
    if (category === 'others') {
        return filterDisplayItems(input, (i) => isOthers(categories, i.name));
    } else {
        return filterDisplayItems(input, (i) => isInCategory(categories, category, i.name));
    }
}

export function categorizeSkills(actor: Actor, skills: DisplaySkill[], category: CategoryOrOthers) {
    return categorize2(getMergedSettings(actor).items.skills, skills, category);
}

export function categorizeAds(actor: Actor, ads: RecursiveList.List<AddDisad>, category: CategoryOrOthers) {
    return categorize(getMergedSettings(actor).items.traits, ads, category);
}
