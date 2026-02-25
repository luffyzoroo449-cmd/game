import Matter from 'matter-js';
import { PLAYER } from '../constants/GameConstants';

const CheckpointSystem = (entities, { dispatch, events }) => {
    const player = entities['player'];
    if (!player) return entities;

    (events || []).forEach((e) => {
        if (e.type === 'checkpointReached') {
            entities['activeCheckpoint'] = { position: e.position };
            dispatch({ type: 'sfx', name: 'checkpoint' });
        }
        if (e.type === 'playerDied') {
            const cp = entities['activeCheckpoint'];
            const spawnPos = cp
                ? { x: cp.position.x, y: cp.position.y - PLAYER.HEIGHT }
                : entities['levelMeta']?.spawnPos ?? { x: 60, y: 380 };

            setTimeout(() => {
                if (player.body) {
                    Matter.Body.setPosition(player.body, spawnPos);
                    Matter.Body.setVelocity(player.body, { x: 0, y: 0 });
                }
                player.isAlive = true;
                player.health = PLAYER.MAX_HEALTH;
                player.damageTaken = 0;
                dispatch({ type: 'playerRespawned' });
            }, 1200);
        }
    });

    return entities;
};

export default CheckpointSystem;
