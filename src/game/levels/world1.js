// World 1: Forest – Levels 1–10
import { getEnemySpeed } from '../constants/DifficultyConfig';

function mkLevel(id, overrides = {}) {
    const world = 1;
    const isBoss = id % 10 === 0;
    return {
        id,
        world,
        name: overrides.name ?? `Forest Level ${id}`,
        bgmKey: 'forest_theme',
        gravityScale: 1.0,
        isBoss,
        platforms: overrides.platforms ?? defaultPlatforms(id),
        enemies: overrides.enemies ?? defaultEnemies(id, world),
        traps: overrides.traps ?? [],
        coins: overrides.coins ?? defaultCoins(id),
        gems: overrides.gems ?? [],
        checkpoints: overrides.checkpoints ?? [{ x: 400, y: 350 }],
        exit: overrides.exit ?? { x: 730, y: 360 },
    };
}

function defaultPlatforms(id) {
    const base = [
        { x: 0, y: 420, w: 220, h: 16, type: 'static' },
        { x: 260, y: 370, w: 120, h: 16, type: 'static' },
        { x: 430, y: 310, w: 120, h: 16, type: 'static' },
        { x: 600, y: 370, w: 200, h: 16, type: 'static' },
    ];
    if (id >= 4) base.push({ x: 330, y: 300, w: 80, h: 16, type: 'moving', moveAxis: 'x', range: 80, speed: 1 });
    if (id >= 7) base.push({ x: 160, y: 280, w: 80, h: 16, type: 'crumbling' });
    return base;
}

function defaultEnemies(id, world) {
    const speed = getEnemySpeed(id);
    const enemies = [];
    const count = Math.min(1 + Math.floor((id - 1) / 2), 5);
    for (let i = 0; i < count; i++) {
        enemies.push({ x: 200 + i * 150, y: 380, type: id < 10 ? 'patrol' : 'boss', speed, patrolRange: 80 });
    }
    return enemies;
}

function defaultCoins(id) {
    return Array.from({ length: 5 + id }, (_, i) => ({ x: 100 + i * 60, y: 340 }));
}

export const WORLD1_LEVELS = [
    mkLevel(1, { name: 'Into the Forest', traps: [] }),
    mkLevel(2, { name: 'Mossy Hollows', traps: [{ x: 300, y: 405, type: 'spikes' }] }),
    mkLevel(3, { name: 'Canopy Crossing', traps: [{ x: 350, y: 405, type: 'spikes' }], gems: [{ x: 320, y: 280 }] }),
    mkLevel(4, { name: 'Root Maze', traps: [{ x: 400, y: 295, type: 'spikes' }] }),
    mkLevel(5, { name: 'Treehouse Trail', traps: [{ x: 260, y: 355, type: 'spikes' }, { x: 430, y: 295, type: 'spikes' }] }),
    mkLevel(6, { name: 'Bramble Pass', traps: [{ x: 330, y: 355, type: 'spikes' }], gems: [{ x: 610, y: 340 }] }),
    mkLevel(7, { name: 'Crumble Cliff', traps: [{ x: 420, y: 295, type: 'spikes' }, { x: 600, y: 355, type: 'spikes' }] }),
    mkLevel(8, { name: 'Ancient Grove', traps: [{ x: 270, y: 355, type: 'spikes' }], gems: [{ x: 165, y: 250 }] }),
    mkLevel(9, { name: 'Shadow Woods', traps: [{ x: 265, y: 355, type: 'spikes' }, { x: 435, y: 295, type: 'spikes' }, { x: 610, y: 355, type: 'spikes' }] }),
    mkLevel(10, { name: 'Guardian of the Forest – BOSS', traps: [{ x: 300, y: 405, type: 'spikes' }, { x: 500, y: 405, type: 'spikes' }], gems: [{ x: 400, y: 280 }, { x: 600, y: 280 }], checkpoints: [] }),
];
