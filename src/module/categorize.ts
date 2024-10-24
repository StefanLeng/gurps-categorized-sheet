import { CategoryList, CATEGORIES } from "./constants.ts";
import { getSettings } from './settings.ts';
import { filterObject } from "./util.ts";

function isOthers(categories : CategoryList, name : string){
    return CATEGORIES.every(
        c => !categories[c].some( (n : string) => name.startsWith(n))
    )
}

export function categorize (categories : CategoryList, input : Object, category : string) : Object {

    if(category === 'others'){
        return filterObject (input, i => isOthers(categories, i.name));
    } 
    else{
        return filterObject (input, i => categories[category].some( (n : string) => i.name.startsWith(n)));
    }
} 

export function categorizeSkills (skills : Object, category : string) : Object {   
    return  categorize(getSettings().items.skills, skills, category);
} 

export function categorizeAds (ads : Object, category : string) : Object {
    return  categorize(getSettings().items.traits, ads, category);
} 