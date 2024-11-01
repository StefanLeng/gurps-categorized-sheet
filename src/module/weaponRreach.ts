/*The funktions in this file are currently unused*/

import { keyedMeleeMode } from './types.ts';

function isReachFixed(reach: string): boolean {
    return reach.includes('*');
}

export function splitReach(reach: string): string[] {
    if (!isReachFixed(reach)) {
        return [reach];
    } else {
        const result: string[] = [];
        const r = reach.replace('*', '');
        const rl = r.split(',');
        for (let x of rl) {
            x = x.trim();
            if (x.includes('-')) {
                const xl = x.split('-');
                if (xl.length === 2) {
                    let start = 0;
                    if (xl[0] !== 'C') {
                        start = parseInt(xl[0]);
                    }
                    const end = parseInt(xl[1]);
                    if (!isNaN(start) && !isNaN(end)) {
                        for (let i = start; i <= end; i++) result.push((i === 0 ? 'C' : i.toString()) + '*');
                    }
                } //should not happen ...
                else {
                    result.push(x + '*');
                }
            } else {
                result.push(x + '*');
            }
        }
        return result;
    }
}

export function splitByReach(melee: keyedMeleeMode): keyedMeleeMode[] {
    const reaches = splitReach(melee.reach ?? '');
    return reaches.map((r) => {
        return { ...melee, reach: r };
    });
}

export function areReachsCompatible(r1: string, r2: string): boolean {
    if (r1 === r2) return true;
    if (!r1.includes('*') && !r2.includes('*')) return true;
    return false;
}
