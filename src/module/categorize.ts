import { CategoryList, CATEGORIES } from "./types.ts";
import { filterObject } from "./util.ts";
import { getMergedSettings } from "./actor-settings.ts";

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

export function categorizeSkills (actor : Actor, skills : Object, category : string) : Object {   
    return  categorize(getMergedSettings(actor).items.skills, skills, category);
} 

export function categorizeAds (actor : Actor, ads : Object, category : string) : Object {
    return  categorize(getMergedSettings(actor).items.traits, ads, category);
} 