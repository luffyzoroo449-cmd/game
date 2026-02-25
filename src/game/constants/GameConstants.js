export const SCREEN = {
    WIDTH: 800,
    HEIGHT: 450,
};

export const PHYSICS = {
    BASE_GRAVITY: { x: 0, y: 2.5 },
    PLAYER_FRICTION: 0.001,
    PLAYER_RESTITUTION: 0,
    FIXED_DELTA: 1000 / 60,
};

export const PLAYER = {
    WIDTH: 32,
    HEIGHT: 48,
    MOVE_SPEED: 5,
    JUMP_FORCE: -12,
    DOUBLE_JUMP_FORCE: -10,
    DASH_FORCE: 18,
    DASH_DURATION: 150,   // ms
    DASH_COOLDOWN: 1500,  // ms
    WALL_JUMP_FORCE: { x: 8, y: -10 },
    COYOTE_TIME: 100,     // ms
    JUMP_BUFFER: 50,      // ms
    MAX_HEALTH: 3,
};

export const ENEMY = {
    WIDTH: 32,
    HEIGHT: 40,
};

export const PLATFORM = {
    HEIGHT: 16,
};

export const COIN_VALUE = 1;
export const GEM_VALUE = 10;

export const SKINS = [
    { id: 'default', name: 'Shadow Warrior', cost: 0, color: '#7c3aed' },
    { id: 'fire', name: 'Flame Reaper', cost: 50, color: '#ef4444' },
    { id: 'ice', name: 'Frost Blade', cost: 50, color: '#60a5fa' },
    { id: 'gold', name: 'Golden Guardian', cost: 100, color: '#fbbf24' },
    { id: 'shadow', name: 'Shadow Phantom', cost: 150, color: '#1f2937' },
    { id: 'cyber', name: 'Neon Ghost', cost: 200, color: '#10b981' },
    { id: 'premium', name: 'Void Emperor', cost: 0, color: '#8b5cf6', premiumOnly: true },
];
