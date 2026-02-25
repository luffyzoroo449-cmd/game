import { SCREEN } from '../constants/GameConstants';

/**
 * ECS ParticleSystem: Manages visual effects like jump dust, dash trails, and death sparks.
 * Particles are purely visual and don't use Matter.js physics.
 */
const ParticleSystem = (entities, { time, events }) => {
    const delta = time.delta || 16.67;

    // Initialize particle container if it doesn't exist
    if (!entities.particles) {
        entities.particles = {
            list: [],
            renderer: null // We'll handle rendering in GameRenderer but this marks it as an "entity"
        };
    }

    const { list } = entities.particles;

    // Process incoming particle requests from events
    events.filter(e => e.type === 'spawn_particles').forEach(e => {
        const { x, y, count, color, type } = e;
        for (let i = 0; i < (count || 5); i++) {
            list.push({
                x, y,
                vx: (Math.random() - 0.5) * (type === 'dash' ? 10 : 4),
                vy: (Math.random() - 0.5) * 4 - (type === 'jump' ? 2 : 0),
                size: Math.random() * 4 + 2,
                life: 1.0, // 1.0 to 0.0
                decay: Math.random() * 0.05 + 0.02,
                color: color || '#ffffff',
                type
            });
        }
    });

    // Update existing particles
    for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;

        // Apply gravity to some types
        if (p.type !== 'dash') {
            p.vy += 0.1;
        }

        p.life -= p.decay;

        if (p.life <= 0) {
            list.splice(i, 1);
        }
    }

    return entities;
};

export default ParticleSystem;
