import Matter from 'matter-js';
import { PLAYER, ENEMY, PLATFORM, SCREEN } from '../constants/GameConstants';
import { addBody } from './PhysicsWorld';

export function loadLevel(levelData, skinColor = '#7c3aed') {
    const entities = {};

    // Floor
    const floorBody = Matter.Bodies.rectangle(SCREEN.WIDTH / 2, SCREEN.HEIGHT + 8, SCREEN.WIDTH, 16, { isStatic: true, label: 'floor' });
    addBody(floorBody);
    entities['floor'] = { body: floorBody, label: 'floor', renderer: null };

    // Platforms
    levelData.platforms.forEach((p, i) => {
        const body = Matter.Bodies.rectangle(p.x + p.w / 2, p.y + PLATFORM.HEIGHT / 2, p.w, PLATFORM.HEIGHT, {
            isStatic: true,
            label: 'platform',
            friction: p.type === 'ice_slide' ? 0.001 : 0.5,
            restitution: p.type === 'bouncy' ? 0.8 : 0,
        });
        addBody(body);
        entities[`platform_${i}`] = {
            body, label: 'platform', type: p.type,
            moveAxis: p.moveAxis, range: p.range, moveSpeed: p.speed,
            startX: p.x + p.w / 2, startY: p.y + PLATFORM.HEIGHT / 2,
        };
    });

    // Player spawn (above first platform)
    const p0 = levelData.platforms[0] || { x: 0, y: 400 };
    const spawnX = p0.x + 40;
    const spawnY = p0.y - PLAYER.HEIGHT;
    const playerBody = Matter.Bodies.rectangle(spawnX, spawnY, PLAYER.WIDTH, PLAYER.HEIGHT, {
        label: 'player',
        friction: PLAYER.FRICTION ?? 0.001,
        restitution: PLAYER.RESTITUTION ?? 0,
        inertia: Infinity,
        frictionAir: 0.02,
    });
    addBody(playerBody);
    entities['player'] = {
        body: playerBody,
        label: 'player',
        health: PLAYER.MAX_HEALTH,
        maxHealth: PLAYER.MAX_HEALTH,
        isGrounded: false,
        canDoubleJump: true,
        canDash: true,
        dashCooldown: 0,
        isFacingRight: true,
        isAlive: true,
        wallTouching: null,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        coins: 0,
        gems: 0,
        skinColor,
    };

    // Enemies
    levelData.enemies.forEach((e, i) => {
        const body = Matter.Bodies.rectangle(e.x, e.y, ENEMY.WIDTH, ENEMY.HEIGHT, {
            label: 'enemy',
            isStatic: false,
            inertia: Infinity,
            friction: 0.5,
        });
        addBody(body);
        entities[`enemy_${i}`] = {
            body, label: 'enemy',
            type: e.type,
            speed: e.speed,
            patrolRange: e.patrolRange ?? 80,
            startX: e.x,
            health: e.type === 'boss' ? 5 : 1,
            direction: 1,
            isFacingRight: true,
            aggroRadius: e.type === 'advanced' || e.type === 'boss' ? 200 : 0,
        };
    });

    // Traps (static sensor bodies)
    levelData.traps.forEach((t, i) => {
        const body = Matter.Bodies.rectangle(t.x, t.y, 24, 16, { isStatic: true, isSensor: true, label: 'trap' });
        addBody(body);
        entities[`trap_${i}`] = { body, label: 'trap', type: t.type };
    });

    // Coins
    levelData.coins.forEach((c, i) => {
        const body = Matter.Bodies.circle(c.x, c.y, 8, { isStatic: true, isSensor: true, label: 'coin' });
        addBody(body);
        entities[`coin_${i}`] = { body, label: 'coin', collected: false };
    });

    // Gems
    levelData.gems.forEach((g, i) => {
        const body = Matter.Bodies.circle(g.x, g.y, 10, { isStatic: true, isSensor: true, label: 'gem' });
        addBody(body);
        entities[`gem_${i}`] = { body, label: 'gem', collected: false };
    });

    // Checkpoints
    levelData.checkpoints.forEach((cp, i) => {
        const body = Matter.Bodies.rectangle(cp.x, cp.y, 20, 40, { isStatic: true, isSensor: true, label: 'checkpoint' });
        addBody(body);
        entities[`checkpoint_${i}`] = { body, label: 'checkpoint', activated: false };
    });

    // Exit portal
    const exitBody = Matter.Bodies.circle(levelData.exit.x, levelData.exit.y, 24, { isStatic: true, isSensor: true, label: 'exit' });
    addBody(exitBody);
    entities['exit'] = { body: exitBody, label: 'exit' };

    return entities;
}
