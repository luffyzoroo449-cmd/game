import { WORLDS } from './WorldConfig';

export const TRAP_TYPES = [
    'spikes',        // World 1+
    'falling_rocks', // World 2+
    'ice_slide',     // World 3+
    'quicksand',     // World 4+
    'fireball',      // World 5+
    'wind_gust',     // World 6+
    'laser_beam',    // World 7+
    'ghost_hand',    // World 8+
    'emp_shockwave', // World 9+
    'shadow_clone',  // World 10+
];

export function getEnemySpeed(level) {
    return 1.5 + (level - 1) * 0.08;
}

export function getGravityScale(level) {
    const world = Math.ceil(level / 10);
    return (WORLDS[world]?.gravityScale ?? 1.0);
}

export function getAvailableTraps(world) {
    return TRAP_TYPES.slice(0, world);
}

export function useAdvancedAI(level) {
    return level >= 60;
}

export function getEnemyHealth(level) {
    return 1 + Math.floor((level - 1) / 20);
}

export function getParTime(level) {
    // par time in seconds — increases with level
    return Math.max(30, 90 - level * 0.4);
}

export function getLevelStars(timeTaken, parTime, damageTaken, coinsCollected, totalCoins) {
    let stars = 1;
    if (timeTaken <= parTime * 1.1 && damageTaken === 0) stars = 2;
    if (timeTaken <= parTime && damageTaken === 0 && coinsCollected >= totalCoins * 0.8) stars = 3;
    return stars;
}

export function computeXP(level, timeTaken, parTime, damageTaken, stars) {
    const base = level * 10;
    const speedBonus = timeTaken <= parTime ? 30 : 0;
    const noDamageBonus = damageTaken === 0 ? 20 : 0;
    const starBonus = (stars - 1) * 15;
    return base + speedBonus + noDamageBonus + starBonus;
}

export const RANKS = [
    { name: 'Bronze', minXP: 0 },
    { name: 'Silver', minXP: 500 },
    { name: 'Gold', minXP: 1500 },
    { name: 'Diamond', minXP: 4000 },
    { name: 'Shadow Legend', minXP: 10000 },
    { name: 'Shadow Emperor', minXP: 25000 },
];

export function getRank(totalXP) {
    let rank = RANKS[0];
    for (const r of RANKS) {
        if (totalXP >= r.minXP) rank = r;
    }
    return rank.name;
}
