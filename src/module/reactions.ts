import { rollTableExists, drawTableRoll } from './rollTables.ts';

export function reactionTableExists() {
    return rollTableExists('Reaction Rolls');
}

export function drawReactionRoll() {
    drawTableRoll('Reaction Rolls');
    GURPS.ModifierBucket.clear();
}
