// Worlds 3-10: Level data stubs with increasing difficulty
import { getEnemySpeed } from '../constants/DifficultyConfig';

const WORLD_META = {
    3: { name: 'Snow', bgmKey: 'snow_theme', gravityScale: 1.08, trapTypes: ['spikes', 'falling_rocks', 'ice_slide'] },
    4: { name: 'Desert', bgmKey: 'desert_theme', gravityScale: 1.12, trapTypes: ['spikes', 'falling_rocks', 'ice_slide', 'quicksand'] },
    5: { name: 'Lava', bgmKey: 'lava_theme', gravityScale: 1.18, trapTypes: ['spikes', 'falling_rocks', 'fireball'] },
    6: { name: 'Sky', bgmKey: 'sky_theme', gravityScale: 0.88, trapTypes: ['spikes', 'wind_gust', 'fireball'] },
    7: { name: 'Factory', bgmKey: 'factory_theme', gravityScale: 1.22, trapTypes: ['laser_beam', 'fireball', 'falling_rocks', 'spikes'] },
    8: { name: 'Haunted', bgmKey: 'haunted_theme', gravityScale: 1.25, trapTypes: ['ghost_hand', 'spikes', 'falling_rocks'] },
    9: { name: 'Cyber', bgmKey: 'cyber_theme', gravityScale: 1.28, trapTypes: ['emp_shockwave', 'laser_beam', 'fireball', 'spikes'] },
    10: { name: 'Shadow Kingdom', bgmKey: 'shadow_theme', gravityScale: 1.35, trapTypes: ['shadow_clone', 'emp_shockwave', 'laser_beam', 'ghost_hand', 'spikes'] },
};

const WORLD_NAMES = {
    3: ['Blizzard Start', 'Frozen Path', 'Ice Bridges', 'Snowdrift Maze', 'Permafrost', 'Arctic Gorge', 'Glacier Run', 'Crystal Spire', 'Whiteout', 'Snow Queen - BOSS'],
    4: ['Dune Entry', 'Scorched Earth', 'Sand Trap', 'Pyramid Ruins', 'Mirage Pass', 'Oasis Gambit', 'Sphinx Maze', 'Sandstorm', 'Desert Night', 'Sand Titan - BOSS'],
    5: ['Magma Shore', 'Lava Flow', 'Ember Fields', 'Volcanic Vent', 'Inferno Path', 'Molten Core', 'Fire Gauntlet', 'Lava Falls', 'Hellgate', 'Fire Colossus - BOSS'],
    6: ['Cloud Walk', 'Sky Bridge', 'Wind Tunnels', 'Storm Peak', 'Cumulus Climb', 'Gale Force', 'Thunder Spire', 'Tempest Zone', "Heaven's Edge", 'Sky Leviathan - BOSS'],
    7: ['Assembly Line', 'Gear Grind', 'Piston Peril', 'Robot Patrol', 'Electro Grid', 'Toxic Vats', 'Crusher Hall', 'Mech Maze', 'Power Core', 'Iron Overlord - BOSS'],
    8: ['Ghost Halls', 'Spirit Pass', 'Cursed Manor', 'Specter Run', 'Dark Crypt', 'Nightmare Web', 'Phantom Reach', 'Soul Forge', 'Veil Crossing', 'Baron Dreadmore - BOSS'],
    9: ['Neon Entry', 'Digital Plains', 'Data Stream', 'Holo Maze', 'Byte Rush', 'Firewall', 'Neural Grid', 'Code Break', 'System Crash', 'Cyber Daemon - BOSS'],
    10: ['Shadow Gate', 'Dark Void', 'Abyss Walk', 'Cursed Throne', 'Soul Prison', 'Shadow Maze', 'Demon Halls', 'Voidborn', 'Final Stand', 'Shadow King - FINAL BOSS'],
};

function buildWorld(worldId) {
    const meta = WORLD_META[worldId];
    const startLevel = (worldId - 1) * 10 + 1;
    return Array.from({ length: 10 }, (_, i) => {
        const id = startLevel + i;
        const isBoss = id % 10 === 0;
        const speed = getEnemySpeed(id);
        const enemyCount = Math.min(2 + Math.floor(i / 2), 7);
        const trapCount = Math.min(2 + Math.floor(i / 3), 5);
        const traps = meta.trapTypes.slice(0, trapCount).map((type, ti) => ({
            x: 200 + ti * 120, y: 405, type,
        }));
        return {
            id,
            world: worldId,
            name: WORLD_NAMES[worldId][i],
            bgmKey: meta.bgmKey,
            gravityScale: meta.gravityScale,
            isBoss,
            platforms: [
                { x: 0, y: 420, w: 180, h: 16, type: 'static' },
                { x: 220, y: 370, w: 100, h: 16, type: i >= 3 ? 'moving' : 'static', moveAxis: 'x', range: 60, speed: 1 + i * 0.1 },
                { x: 360, y: 320, w: 100, h: 16, type: i >= 5 ? 'crumbling' : 'static' },
                { x: 500, y: 270, w: 100, h: 16, type: 'static' },
                { x: 640, y: 370, w: 160, h: 16, type: 'static' },
            ],
            enemies: Array.from({ length: isBoss ? 1 : enemyCount }, (_, ei) => ({
                x: 220 + ei * 100, y: 384,
                type: isBoss ? 'boss' : (id >= 60 ? 'advanced' : 'patrol'),
                speed: isBoss ? speed * 1.5 : speed,
                patrolRange: isBoss ? 200 : 80,
            })),
            traps: isBoss ? traps.slice(0, 3) : traps,
            coins: Array.from({ length: 10 + i * 2 }, (_, ci) => ({ x: 80 + ci * 45, y: 338 })),
            gems: isBoss || i % 3 === 2 ? [{ x: 370, y: 295 }, { x: 510, y: 245 }] : [],
            checkpoints: isBoss ? [] : [{ x: 400, y: 350 }],
            exit: { x: 730, y: 360 },
        };
    });
}

export const WORLD3_LEVELS = buildWorld(3);
export const WORLD4_LEVELS = buildWorld(4);
export const WORLD5_LEVELS = buildWorld(5);
export const WORLD6_LEVELS = buildWorld(6);
export const WORLD7_LEVELS = buildWorld(7);
export const WORLD8_LEVELS = buildWorld(8);
export const WORLD9_LEVELS = buildWorld(9);
export const WORLD10_LEVELS = buildWorld(10);
