import Matter from 'matter-js';
import { updatePhysics } from '../engine/PhysicsWorld';
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

    // Update moving platforms
    Object.values(entities).forEach((e) => {
        if (e && e.label === 'platform' && e.type === 'moving' && e.body) {
            const elapsed = ((time && time.current) || 0) / 1000;
            const offset = Math.sin(elapsed * (e.moveSpeed || 1)) * (e.range || 60);
            const newX = e.moveAxis === 'x' ? e.startX + offset : e.startX;
            const newY = e.moveAxis === 'y' ? e.startY + offset : e.startY;
            Matter.Body.setPosition(e.body, { x: newX, y: newY });
        }
    });

    return entities;
};

export default PhysicsSystem;
