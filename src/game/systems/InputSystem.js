import Matter from 'matter-js';
import { PLAYER } from '../constants/GameConstants';

const InputSystem = (entities, { touches, dispatch, events }) => {
    const player = entities['player'];
    if (!player || !player.isAlive) return entities;

    const body = player.body;
    const input = entities['input'] || {};
    const now = Date.now();

    // Coyote time & jump buffer
    if (player.isGrounded) {
        player.coyoteTimer = now;
        player.canDoubleJump = true;
    }
    const canCoyoteJump = (now - player.coyoteTimer) < PLAYER.COYOTE_TIME;

    // Handle jump buffer
    if (player.jumpBufferTimer > 0 && player.isGrounded) {
        player.jumpBufferTimer = 0;
        doJump(player, body);
    }

    const qScale = player.standingOnType === 'quicksand' ? 0.4 : 1.0;

    if (input.left) {
        Matter.Body.setVelocity(body, { x: -PLAYER.MOVE_SPEED * qScale, y: body.velocity.y });
        player.isFacingRight = false;
    } else if (input.right) {
        Matter.Body.setVelocity(body, { x: PLAYER.MOVE_SPEED * qScale, y: body.velocity.y });
        player.isFacingRight = true;
    } else {
        // Decelerate horizontally - slippery on ice
        const friction = player.standingOnType === 'ice_slide' ? 0.98 : 0.7;
        Matter.Body.setVelocity(body, { x: body.velocity.x * friction, y: body.velocity.y });
    }

    if (input.jumpPressed) {
        input.jumpPressed = false;

        if (player.standingOnType === 'quicksand') {
            // Struggle effect: slight pop up but no real jump
            Matter.Body.setVelocity(body, { x: body.velocity.x, y: -2 });
            dispatch({ type: 'spawn_particles', x: body.position.x, y: body.position.y, count: 3, color: '#78350f', type: 'jump' });
            return entities;
        }

        if (player.isGrounded || canCoyoteJump) {
            doJump(player, body);
            dispatch({ type: 'spawn_particles', x: body.position.x, y: body.position.y + 20, count: 5, color: '#e2e8f0', type: 'jump' });
        } else if (player.canDoubleJump) {
            player.canDoubleJump = false;
            Matter.Body.setVelocity(body, { x: body.velocity.x, y: PLAYER.DOUBLE_JUMP_FORCE });
            dispatch({ type: 'sfx', name: 'doubleJump' });
            dispatch({ type: 'spawn_particles', x: body.position.x, y: body.position.y, count: 8, color: player.skinColor, type: 'jump' });
        } else {
            player.jumpBufferTimer = now + PLAYER.JUMP_BUFFER;
        }
    }

    // Wall jump
    if (input.jumpPressed && player.wallTouching) {
        input.jumpPressed = false;
        const dir = player.wallTouching === 'right' ? -1 : 1;
        Matter.Body.setVelocity(body, {
            x: dir * PLAYER.WALL_JUMP_FORCE.x,
            y: PLAYER.WALL_JUMP_FORCE.y,
        });
        dispatch({ type: 'sfx', name: 'wallJump' });
        dispatch({ type: 'spawn_particles', x: body.position.x + (dir * -15), y: body.position.y, count: 6, color: '#94a3b8', type: 'jump' });
    }

    // Dash trail management
    player.dashTrail = player.dashTrail || [];
    if (player.dashTimer > 0) {
        player.dashTimer -= 1;
        player.dashTrail.push({ x: body.position.x, y: body.position.y, opacity: 0.5, id: Date.now() });
    }
    if (player.dashTrail.length > 8) player.dashTrail.shift();
    player.dashTrail.forEach(t => t.opacity -= 0.05);
    player.dashTrail = player.dashTrail.filter(t => t.opacity > 0);

    // ... existing dash logic inside the input block ...
    if (input.dashPressed && player.canDash && (now - (player.lastDash || 0)) > PLAYER.DASH_COOLDOWN) {
        input.dashPressed = false;
        player.canDash = false;
        player.lastDash = now;
        player.dashTimer = 8; // Trail for 8 frames
        const dir = player.isFacingRight ? 1 : -1;
        Matter.Body.setVelocity(body, { x: dir * PLAYER.DASH_FORCE, y: 0 });
        dispatch({ type: 'sfx', name: 'dash' });
        dispatch({ type: 'spawn_particles', x: body.position.x, y: body.position.y, count: 12, color: player.skinColor, type: 'dash' });
        setTimeout(() => { player.canDash = true; }, PLAYER.DASH_COOLDOWN);
    }

    // Re-set grounded to false each frame; collision system will set it to true
    player.isGrounded = false;
    player.wallTouching = null;
    player.standingOnType = null;

    return entities;
};

function doJump(player, body) {
    Matter.Body.setVelocity(body, { x: body.velocity.x, y: PLAYER.JUMP_FORCE });
    player.isGrounded = false;
}

export default InputSystem;
