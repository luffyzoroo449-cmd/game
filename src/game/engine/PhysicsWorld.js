import Matter from 'matter-js';
import { PHYSICS, SCREEN } from '../constants/GameConstants';

let engine = null;
let world = null;

export function createPhysicsWorld(gravityScale = 1.0) {
    engine = Matter.Engine.create();
    world = engine.world;
    engine.gravity.x = PHYSICS.BASE_GRAVITY.x;
    engine.gravity.y = PHYSICS.BASE_GRAVITY.y * gravityScale;

    // World boundaries
    const walls = [
        Matter.Bodies.rectangle(SCREEN.WIDTH / 2, -10, SCREEN.WIDTH, 20, { isStatic: true, label: 'ceiling' }),
        Matter.Bodies.rectangle(-10, SCREEN.HEIGHT / 2, 20, SCREEN.HEIGHT, { isStatic: true, label: 'wallLeft' }),
        Matter.Bodies.rectangle(SCREEN.WIDTH + 10, SCREEN.HEIGHT / 2, 20, SCREEN.HEIGHT, { isStatic: true, label: 'wallRight' }),
    ];
    Matter.World.add(world, walls);
    return { engine, world };
}

export function addBody(body) {
    if (world) Matter.World.add(world, body);
}

export function removeBody(body) {
    if (world) Matter.World.remove(world, body);
}

export function updatePhysics(delta) {
    if (engine) Matter.Engine.update(engine, delta);
}

export function resetPhysicsWorld() {
    if (world) Matter.World.clear(world);
    if (engine) Matter.Engine.clear(engine);
    engine = null;
    world = null;
}

export function setGravity(scale) {
    if (engine) engine.gravity.y = PHYSICS.BASE_GRAVITY.y * scale;
}

export function getEngine() { return engine; }
export function getWorld() { return world; }
