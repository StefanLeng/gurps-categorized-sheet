import { DisplaySkillEx } from './types.ts';
import { filterList, ElementList } from './recursiveList.ts';
import { DisplaySkill } from '@gurps-types/gurps/display-item.ts';

function makeFloatingRollOTF(
    skillName: string,
    attribute: string,
    relativeLevel: string,
    attributeValue: number,
): string {
    const target = parseInt(relativeLevel) + attributeValue;
    return `["${attribute} based ${skillName}: ${target}" SK:"${skillName}" (Based:${attribute})]`;
}

export function enrichSkill(skill: DisplaySkill, attributes: ElementList<{ value: number }>): DisplaySkillEx {
    if (skill.type === 'skill') {
        const parts = skill.relativeLevel.split(/(\+|-)/);
        if (parts.length !== 3 || !attributes[parts[0].toUpperCase()]) return skill;
        return {
            ...skill,
            additionalRolls: Object.keys(filterList(attributes, (a) => a.value > 0))
                .filter((a) => a !== parts[0].toUpperCase())
                .map((a) => makeFloatingRollOTF(skill.name, a, parts[1] + parts[2], attributes[a].value)),
        };
    }
    return skill;
}
