import { WORLD1_LEVELS } from './world1';
import { WORLD2_LEVELS } from './world2';
import {
    WORLD3_LEVELS, WORLD4_LEVELS, WORLD5_LEVELS,
    WORLD6_LEVELS, WORLD7_LEVELS, WORLD8_LEVELS,
    WORLD9_LEVELS, WORLD10_LEVELS,
} from './worlds3to10';

export const ALL_LEVELS = [
    ...WORLD1_LEVELS,
    ...WORLD2_LEVELS,
    ...WORLD3_LEVELS,
    ...WORLD4_LEVELS,
    ...WORLD5_LEVELS,
    ...WORLD6_LEVELS,
    ...WORLD7_LEVELS,
    ...WORLD8_LEVELS,
    ...WORLD9_LEVELS,
    ...WORLD10_LEVELS,
];

export function getLevel(id) {
    return ALL_LEVELS.find(l => l.id === id) ?? ALL_LEVELS[0];
}

export function getLevelsForWorld(worldId) {
    return ALL_LEVELS.filter(l => l.world === worldId);
}
