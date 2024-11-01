import { CategoryList, CATEGORIES, NamedItem } from './types.ts';
import { getMergedSettings } from './actor-settings.ts';
import { CategoryOrOthers, Skill, AddDisad, Category } from './types.ts';
import * as RecursiveList from './recursiveList.ts';

function isOthers(categories: CategoryList, name: string) {
    return CATEGORIES.every((c) => !categories[c].some((n: string) => name.startsWith(n)));
}

function isInCategorie(categories: CategoryList, category: Category, name: string): boolean {
    return categories[category].some((n: string) => name.startsWith(n));
}

export function categorize<T extends RecursiveList.Rec<T> & NamedItem>(
    categories: CategoryList,
    input: RecursiveList.List<T>,
    category: CategoryOrOthers,
): object {
    if (category === 'others') {
        return RecursiveList.filter(input, (i) => isOthers(categories, i.name));
    } else {
        return RecursiveList.filter(input, (i) => isInCategorie(categories, category, i.name));
    }
}

export function categorizeSkills(actor: Actor, skills: RecursiveList.List<Skill>, category: CategoryOrOthers): object {
    return categorize(getMergedSettings(actor).items.skills, skills, category);
}

export function categorizeAds(actor: Actor, ads: RecursiveList.List<AddDisad>, category: CategoryOrOthers): object {
    return categorize(getMergedSettings(actor).items.traits, ads, category);
}
