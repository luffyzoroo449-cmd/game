import Matter from 'matter-js';
import { getEngine } from '../engine/PhysicsWorld';
import { COIN_VALUE, GEM_VALUE } from '../constants/GameConstants';

const CollisionSystem = (entities, { dispatch }) => {
    const engine = getEngine();
    if (!engine) return entities;
    const player = entities['player'];
    if (!player || !player.isAlive) return entities;

    const collisions = Matter.Query.collides(player.body,
        Object.values(entities).filter(e => e.body && e.label !== 'player').map(e => e.body)
    );

    collisions.forEach(({ bodyA, bodyB }) => {
        const other = bodyA === player.body ? bodyB : bodyA;
        const key = Object.keys(entities).find(k => entities[k].body === other);
        if (!key) return;
        const entity = entities[key];

        switch (entity.label) {
            case 'platform':
            case 'floor': {
                // Determine if player is landing on top
                const playerBottom = player.body.position.y + 24;
                const platformTop = other.position.y - (entity.label === 'floor' ? 0 : 8);
                if (playerBottom <= platformTop + 8 && player.body.velocity.y >= 0) {
                    player.isGrounded = true;
                } else if (Math.abs(player.body.position.x - other.position.x) > (other.bounds.max.x - other.bounds.min.x) / 2 - 4) {
                    // Touching side wall
                    player.wallTouching = player.body.position.x < other.position.x ? 'right' : 'left';
                }
                break;
            }
            case 'enemy': {
                if (!entity.defeated && player.isAlive) {
                    // Stomp kill if player is falling on top of enemy
                    const playerBottom = player.body.position.y + 24;
                    const enemyTop = other.position.y - 20;
                    if (playerBottom <= enemyTop + 10 && player.body.velocity.y > 0) {
                        entity.health = (entity.health || 1) - 1;
                        dispatch({ type: 'spawn_particles', x: other.position.x, y: other.position.y, count: 10, color: '#ef4444', type: 'jump' });

                        if (entity.health <= 0) {
                            entity.defeated = true;
                            entity.body.isStatic = true;
                            dispatch({ type: 'sfx', name: 'enemyDeath' });
                            dispatch({ type: 'enemyDefeated' });
                        }

                        Matter.Body.setVelocity(player.body, { x: player.body.velocity.x, y: entity.type === 'boss' ? -10 : -8 });
                        dispatch({ type: 'sfx', name: 'jump' });
                    } else {
                        applyDamage(player, dispatch);
                    }
                }
                break;
            }
            case 'trap': {
                applyDamage(player, dispatch, entity.type === 'instakill' ? player.health : 1);
                break;
            }
            case 'coin': {
                if (!entity.collected) {
                    entity.collected = true;
                    Matter.World.remove(engine.world, other);
                    player.coins = (player.coins || 0) + COIN_VALUE;
                    dispatch({ type: 'sfx', name: 'collectCoin' });
                    dispatch({ type: 'coinCollected', value: COIN_VALUE });
                }
                break;
            }
            case 'gem': {
                if (!entity.collected) {
                    entity.collected = true;
                    Matter.World.remove(engine.world, other);
                    player.gems = (player.gems || 0) + GEM_VALUE;
                    dispatch({ type: 'sfx', name: 'collectGem' });
                    dispatch({ type: 'gemCollected', value: GEM_VALUE });
                }
                break;
            }
            case 'checkpoint': {
                if (!entity.activated) {
                    entity.activated = true;
                    dispatch({ type: 'sfx', name: 'checkpoint' });
                    dispatch({ type: 'checkpointReached', position: { ...other.position } });
                }
                break;
            }
            case 'exit': {
                if (player.isAlive) {
                    dispatch({ type: 'levelComplete' });
                }
                break;
            }
        }
    });

    return entities;
};

let lastDamageTime = 0;
function applyDamage(player, dispatch, amount = 1) {
    const now = Date.now();
    if (now - lastDamageTime < 1000) return; // invincibility frames
    lastDamageTime = now;
    player.health -= amount;
    player.damageTaken = (player.damageTaken || 0) + amount;
    dispatch({ type: 'sfx', name: 'damage' });
    dispatch({ type: 'shake', intensity: 5 });
    dispatch({ type: 'playerDamaged', health: player.health });
    if (player.health <= 0) {
        player.isAlive = false;
        dispatch({ type: 'sfx', name: 'death' });
        dispatch({ type: 'playerDied' });
    }
}

export default CollisionSystem;
