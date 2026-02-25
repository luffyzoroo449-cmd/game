// World 2: Cave – Levels 11–20
import { getEnemySpeed } from '../constants/DifficultyConfig';

function mkLevel(id, overrides = {}) {
    const isBoss = id % 10 === 0;
    return {
        id, world: 2,
        name: overrides.name ?? `Cave Level ${id}`,
        bgmKey: 'cave_theme', gravityScale: 1.05, isBoss,
        platforms: overrides.platforms ?? defaultPlatforms(id),
        enemies: overrides.enemies ?? defaultEnemies(id),
        traps: overrides.traps ?? [{ x: 350, y: 405, type: 'spikes' }],
        coins: overrides.coins ?? defaultCoins(id),
        gems: overrides.gems ?? [],
        checkpoints: overrides.checkpoints ?? [{ x: 400, y: 350 }],
        exit: overrides.exit ?? { x: 730, y: 360 },
    };
}
function defaultPlatforms(id) {
    return [
        { x: 0, y: 420, w: 200, h: 16, type: 'static' },
        { x: 240, y: 360, w: 100, h: 16, type: 'static' },
        { x: 380, y: 310, w: 100, h: 16, type: 'static' },
        { x: 510, y: 260, w: 100, h: 16, type: 'static' },
        { x: 650, y: 370, w: 150, h: 16, type: 'static' },
        ...(id >= 14 ? [{ x: 300, y: 300, w: 60, h: 16, type: 'moving', moveAxis: 'y', range: 60, speed: 1.2 }] : []),
        ...(id >= 17 ? [{ x: 490, y: 245, w: 80, h: 16, type: 'crumbling' }] : []),
    ];
}
function defaultEnemies(id) {
    const speed = getEnemySpeed(id);
    return Array.from({ length: Math.min(2 + Math.floor((id - 11) / 2), 6) }, (_, i) => ({
        x: 200 + i * 130, y: 380, type: 'patrol', speed, patrolRange: 70,
    }));
}
function defaultCoins(id) {
    return Array.from({ length: 8 + (id - 10) }, (_, i) => ({ x: 80 + i * 55, y: 338 }));
}
export const WORLD2_LEVELS = Array.from({ length: 10 }, (_, i) => mkLevel(11 + i, {
    name: ['Cavern Entry', 'Dark Tunnels', 'Stalactite Run', 'Underground Lake', 'Bat Hollow', 'Crystal Caves', 'Lava Pockets', 'Deep Descent', 'Nightmare Depths', 'Cave Giant – BOSS'][i],
    gems: i % 3 === 2 ? [{ x: 390, y: 280 }] : [],
    traps: [
        { x: 250, y: 405, type: 'spikes' },
        ...(i >= 2 ? [{ x: 400, y: 295, type: 'falling_rocks' }] : []),
    ],
}));
