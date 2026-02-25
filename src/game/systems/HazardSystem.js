import Matter from 'matter-js';
import { SCREEN } from '../constants/GameConstants';
import { addBody, removeBody } from '../engine/PhysicsWorld';

/**
 * ECS HazardSystem: Manages dynamic environmental threats like falling icicles, 
 * rocks, etc.
 */
const HazardSystem = (entities, { time, dispatch }) => {
    const world = entities['worldMeta'];
    if (!world) return entities;

    const weather = world.weather;
    const fallingType = weather === 'snow' ? 'icicle' : (world.name === 'Cave' ? 'rock' : (weather === 'ash' ? 'ember' : (weather === 'void' ? 'void_orb' : (weather === 'sand' ? 'debris' : null))));

    if (fallingType && Math.random() < 0.03) {
        const id = `hazard_${Date.now()}`;
        let x = Math.random() * SCREEN.WIDTH;
        let y = -20;
        let vx = 0;
        let vy = 0;
        let gravityScale = 1;

        if (fallingType === 'debris') {
            x = Math.random() > 0.5 ? -30 : SCREEN.WIDTH + 30;
            y = Math.random() * (SCREEN.HEIGHT - 100);
            vx = x < 0 ? 8 : -8;
            gravityScale = 0;
        } else if (fallingType === 'void_orb') {
            gravityScale = 0.2;
            vy = 2;
        }

        const body = Matter.Bodies.rectangle(x, y, 16, 16, {
            label: 'hazard',
            isSensor: true,
        });

        body.gravityScale = gravityScale;
        Matter.Body.setVelocity(body, { x: vx, y: vy });

        entities[id] = {
            body,
            label: 'hazard',
            type: fallingType,
            damage: 1,
        };

        addBody(body);
    }

    // Update Hazard positions and life
    Object.keys(entities).forEach(key => {
        const e = entities[key];
        if (e && e.label === 'hazard') {
            if (e.body.position.y > SCREEN.HEIGHT + 50) {
                removeBody(e.body);
                delete entities[key];
            }
        }
    });

    return entities;
};

export default HazardSystem;
