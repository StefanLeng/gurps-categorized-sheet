import { skillCategories, adsCategories, CategoryList } from "./constants.ts";
import { filterObject } from "./util.ts";

export function categorize (categories : CategoryList, input : Object, category : string) : Object {

    if(category === 'others'){
        return filterObject (input, (i => !categories['all'].some( (n : string) => i.name.startsWith(n))));
    } 
    else{
        return filterObject (input, (i => categories[category].some( (n : string) => i.name.startsWith(n))));
    }
} 

export function categorizeSkills (skills : Object, category : string) : Object {
    return  categorize(skillCategories, skills, category);
} 

export function categorizeAds (ads : Object, category : string) : Object {
    return  categorize(adsCategories, ads, category);
} 