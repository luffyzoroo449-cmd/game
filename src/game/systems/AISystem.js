import Matter from 'matter-js';
import { useAdvancedAI } from '../constants/DifficultyConfig';

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

        if (e.type === 'boss' && playerPos) {
            e.attackTimer = (e.attackTimer || 0) + 1;
            const dx = playerPos.x - body.position.x;
            const dir = dx > 0 ? 1 : -1;

            if (e.attackTimer % 180 < 60) {
                // Phase 1: Aggressive Chase
                Matter.Body.setVelocity(body, { x: dir * (e.speed * 1.5), y: body.velocity.y });
            } else if (e.attackTimer % 180 < 120) {
                // Phase 2: Jump Attacks
                if (Math.abs(body.velocity.y) < 0.1) {
                    Matter.Body.setVelocity(body, { x: dir * e.speed, y: -10 });
                }
            } else {
                // Phase 3: Charge Attack
                Matter.Body.setVelocity(body, { x: dir * (e.speed * 3), y: body.velocity.y });
            }

            e.isFacingRight = dir === 1;
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

    return entities;
};

export default AISystem;
