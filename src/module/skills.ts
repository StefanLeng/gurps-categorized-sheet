import { Skill } from './types.ts';
import { filterList, ElementList } from './recursiveList.ts';

function makeFloatingRollOTF(
    skillName: string,
    attribute: string,
    relativeLevel: string,
    attributeValue: number,
): string {
    const target = parseInt(relativeLevel) + attributeValue;
    return `["${attribute} based ${skillName}: ${target}" SK:"${skillName}" (Based:${attribute})]`;
}

export function enrichSkill(skill: Skill, attributes: ElementList<{ value: number }>): Skill {
    if (skill.type === 'SKILL') {
        const parts = skill.relativelevel.split(/(\+|-)/);
        if (parts.length !== 3) return skill;
        return {
            ...skill,
            additionalRolls: Object.keys(filterList(attributes, (a) => a.value > 0))
                .filter((a) => a !== parts[0])
                .map((a) => makeFloatingRollOTF(skill.name, a, parts[1] + parts[2], attributes[a].value)),
        };
    }
    return skill;
}
