import Matter from 'matter-js';
import { updatePhysics, removeBody } from '../engine/PhysicsWorld';
import { PHYSICS } from '../constants/GameConstants';

const PhysicsSystem = (entities, { time }) => {
    const delta = (time && time.delta) || PHYSICS.FIXED_DELTA;
    updatePhysics(delta);

    // Sync all entity render positions from physics bodies
    Object.values(entities).forEach((e) => {
        if (e && e.body) {
            e.x = e.body.position.x;
            e.y = e.body.position.y;
        }
    });

    const player = entities['player'];
    if (player && player.standingOnType === 'quicksand' && player.body) {
        Matter.Body.setPosition(player.body, {
            x: player.body.position.x,
            y: player.body.position.y + 0.8
        });
    }

    // Update platforms: moving and crumbling
    Object.keys(entities).forEach((key) => {
        const e = entities[key];
        if (!e || e.label !== 'platform' || !e.body) return;

        if (e.type === 'moving') {
            const elapsed = ((time && time.current) || 0) / 1000;
            const offset = Math.sin(elapsed * (e.moveSpeed || 1)) * (e.range || 60);
            const newX = e.moveAxis === 'x' ? e.startX + offset : e.startX;
            const newY = e.moveAxis === 'y' ? e.startY + offset : e.startY;
            Matter.Body.setPosition(e.body, { x: newX, y: newY });
        }

        if (e.isCrumbling) {
            e.crumbleTime -= 1;
            if (e.crumbleTime <= 0) {
                removeBody(e.body);
                delete entities[key];
            }
        }
    });

    return entities;
};

export default PhysicsSystem;
