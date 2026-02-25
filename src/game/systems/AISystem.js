import Matter from 'matter-js';
import { useAdvancedAI } from '../constants/DifficultyConfig';
import { addBody, removeBody } from '../engine/PhysicsWorld';
import { SCREEN } from '../constants/GameConstants';

const AISystem = (entities, { dispatch }) => {
    const player = entities['player'];
    const playerPos = player?.body?.position;

    Object.keys(entities).forEach((key) => {
        const e = entities[key];
        if (e.label !== 'enemy' || e.defeated) return;
        const body = e.body;
        if (!body) return;

        const level = entities['gameLevel'] ?? 1;
        const advanced = useAdvancedAI(level);

        // Player movement history for shadow clones
        if (playerPos) {
            player.history = player.history || [];
            player.history.push({ x: playerPos.x, y: playerPos.y });
            if (player.history.length > 45) player.history.shift();
        }

        if (e.type === 'shadow_stalker' && player.history && player.history.length > 40) {
            const target = player.history[0];
            Matter.Body.setPosition(body, target);
            return;
        }

        if (e.type === 'boss' && playerPos) {
            e.attackTimer = (e.attackTimer || 0) + 1;
            const dx = playerPos.x - body.position.x;
            const dir = dx > 0 ? 1 : -1;
            const isFinalBoss = level === 100;
            const cycle = isFinalBoss ? 240 : 180;
            const isRaging = e.health <= 2;
            const speedMult = isRaging ? 1.5 : 1;

            if (e.attackTimer % cycle < 60) {
                // Phase 1: Aggressive Chase
                Matter.Body.setVelocity(body, { x: dir * (e.speed * speedMult * (isFinalBoss ? 2 : 1.5)), y: body.velocity.y });
            } else if (e.attackTimer % cycle < 120) {
                // Phase 2: Jump Attacks & Shooting
                if (Math.abs(body.velocity.y) < 0.1) {
                    Matter.Body.setVelocity(body, { x: dir * e.speed, y: -10 });
                }

                // Shoot projectile half-way through the jump cycle
                if (e.attackTimer % cycle === 90) {
                    const boltId = `bolt_${Date.now()}`;
                    const boltBody = Matter.Bodies.circle(body.position.x, body.position.y, 10, {
                        isSensor: true,
                        label: 'trap', // Use trap label for collision damage
                    });
                    addBody(boltBody);
                    Matter.Body.setVelocity(boltBody, { x: dir * 7, y: 0 });
                    entities[boltId] = { body: boltBody, label: 'trap', type: 'shadow_bolt' };
                    dispatch({ type: 'sfx', name: 'dash' }); // Reuse dash sound for high-speed bolt
                }
            } else if (e.attackTimer % cycle < 180) {
                // Phase 3: Charge Attack
                Matter.Body.setVelocity(body, { x: dir * (e.speed * speedMult * (isFinalBoss ? 4 : 3)), y: body.velocity.y });
            } else if (isFinalBoss) {
                // Phase 4: Teleport (Level 100 only)
                if (e.attackTimer % 60 === 0) {
                    const targetX = playerPos.x + (dir * -50);
                    dispatch({ type: 'spawn_particles', x: body.position.x, y: body.position.y, count: 20, color: '#a855f7', type: 'dash' });
                    Matter.Body.setPosition(body, { x: targetX, y: playerPos.y - 40 });
                    dispatch({ type: 'spawn_particles', x: targetX, y: playerPos.y - 40, count: 20, color: '#a855f7', type: 'dash' });
                    dispatch({ type: 'sfx', name: 'dash' });
                    dispatch({ type: 'shake', intensity: 8 });
                }
            }

            e.isFacingRight = dir === 1;
            e.isRaging = isRaging;
            return;
        }

        if (advanced && playerPos && e.aggroRadius > 0) {
            // Advanced AI: chase player if in aggro radius
            const dx = playerPos.x - body.position.x;
            const dist = Math.abs(dx);
            if (dist < e.aggroRadius) {
                const dir = dx > 0 ? 1 : -1;
                Matter.Body.setVelocity(body, { x: dir * e.speed, y: body.velocity.y });
                e.isFacingRight = dir === 1;
                return;
            }
        }

        // Basic patrol
        const moved = { x: body.position.x + e.direction * e.speed, y: body.velocity.y };
        const atEdge = Math.abs(body.position.x - e.startX) > e.patrolRange;

        if (atEdge) {
            e.direction *= -1;
            e.isFacingRight = e.direction === 1;
        }
        Matter.Body.setVelocity(body, { x: e.direction * e.speed, y: body.velocity.y });
    });

    // Cleanup off-screen projectiles
    Object.keys(entities).forEach(key => {
        const e = entities[key];
        if (e && e.label === 'trap' && e.type === 'shadow_bolt' && e.body) {
            if (e.body.position.x < -100 || e.body.position.x > SCREEN.WIDTH + 100) {
                removeBody(e.body);
                delete entities[key];
            }
        }
    });

    return entities;
};

export default AISystem;
