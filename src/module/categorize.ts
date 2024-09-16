import { skillCategories } from "./constants.ts";
import { filterObject } from "./util.ts";

export function categorizeSkills (skills : Object, category : string) : Object {

    if(category === 'others'){
        return filterObject (skills, (i => !skillCategories['all'].some( (n : string) => i.name.startsWith(n))));
    } 
    else{
        return filterObject (skills, (i => skillCategories[category].some( (n : string) => i.name.startsWith(n))));
    }
} 