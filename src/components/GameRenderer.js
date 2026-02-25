import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PLAYER, ENEMY, PLATFORM, SKINS, SCREEN } from '../game/constants/GameConstants';
import ParallaxBackground from './ParallaxBackground';

// A single unified renderer that draws all entities each frame via react-native-game-engine
const GameRenderer = (entities) => {
    const elements = [];
    const worldMeta = entities['worldMeta'] || { name: 'Forest', sky: '#87ceeb' };
    const screenMeta = entities['screenMeta'] || { shake: 0 };
    const scrollX = player?.body?.position?.x || 0;

    const shakeX = (Math.random() - 0.5) * screenMeta.shake * 2;
    const shakeY = (Math.random() - 0.5) * screenMeta.shake * 2;

    // Render themed background
    elements.push(<ParallaxBackground key="bg" world={worldMeta} scrollX={scrollX} />);

    // Render Particles first (behind entities)
    if (entities.particles && entities.particles.list) {
        entities.particles.list.forEach((p, i) => {
            elements.push(
                <View
                    key={`particle_${i}`}
                    style={[styles.particle, {
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        opacity: p.life,
                        borderRadius: p.size / 2,
                    }]}
                />
            );
        });
    }

    Object.keys(entities).forEach((key) => {
        const e = entities[key];
        if (!e || !e.body || key === 'particles') return;
        const { x, y } = e.body.position;

        switch (e.label) {
            case 'player': {
                if (!e.isAlive) return;
                const skin = SKINS.find(s => s.id === (entities.skinId ?? 'default'));
                const color = skin?.color ?? '#7c3aed';

                // Render dash trail (ghosts)
                if (e.dashTrail) {
                    e.dashTrail.forEach(t => {
                        elements.push(
                            <View key={t.id} style={[styles.player, {
                                left: t.x - PLAYER.WIDTH / 2,
                                top: t.y - PLAYER.HEIGHT / 2,
                                backgroundColor: color,
                                opacity: t.opacity,
                                borderColor: 'transparent'
                            }]} />
                        );
                    });
                }

                elements.push(
                    <View key={key} style={[styles.player, { left: x - PLAYER.WIDTH / 2, top: y - PLAYER.HEIGHT / 2, backgroundColor: '#0f172a', borderColor: color, transform: [{ scaleX: e.isFacingRight ? 1 : -1 }] }]}>
                        {/* Shadow Essence (inner glow) */}
                        <View style={[styles.glow, { backgroundColor: color, opacity: 0.3 }]} />
                        {/* Eyes */}
                        <View style={[styles.eye, { backgroundColor: color }]} />
                        <View style={[styles.eye, { backgroundColor: '#fff', width: 4, height: 4, top: 12, right: 8 }]} />
                    </View>
                );
                break;
            }
            case 'enemy': {
                const level = entities['gameLevel'] ?? 1;
                if (e.defeated) return;
                const isStalker = e.type === 'shadow_stalker';
                const color = e.type === 'boss' ? '#ef4444' : isStalker ? '#a855f7' : e.type === 'advanced' ? '#f97316' : '#94a3b8';
                const isFinalBoss = e.type === 'boss' && level === 100;

                elements.push(
                    <View key={key} style={[styles.enemy, {
                        left: x - ENEMY.WIDTH / 2,
                        top: y - ENEMY.HEIGHT / 2,
                        backgroundColor: e.isRaging ? '#450a0a' : '#1e293b',
                        borderColor: color,
                        opacity: isStalker ? 0.6 : 1,
                        transform: [
                            { scaleX: e.isFacingRight ? 1 : -1 },
                            { scale: isFinalBoss ? 2 : 1 }
                        ],
                        shadowColor: e.isRaging ? '#ef4444' : color,
                        shadowRadius: e.isRaging ? 20 : 0,
                        shadowOpacity: 0.8,
                    }]}>
                        {(isFinalBoss || e.isRaging) && <View style={[styles.aura, { borderColor: e.isRaging ? '#ef4444' : '#a855f7' }]} />}
                        <View style={[styles.enemyEye, { backgroundColor: color }]} />
                        {e.health > 1 && (
                            <View style={styles.healthBar}>
                                <View style={[styles.healthFill, { width: `${(e.health / (isFinalBoss ? 10 : 3)) * 100}%` }]} />
                            </View>
                        )}
                    </View>
                );
                break;
            }
            case 'platform': {
                const bounds = e.body.bounds;
                const w = bounds.max.x - bounds.min.x;
                const h = bounds.max.y - bounds.min.y;
                const platformColor =
                    e.type === 'moving' ? '#3b82f6' :
                        e.type === 'crumbling' ? '#ef4444' :
                            e.type === 'bouncy' ? '#fbbf24' :
                                e.type === 'ice_slide' ? '#0ea5e9' :
                                    e.type === 'quicksand' ? '#92400e' : '#334155';

                elements.push(
                    <View key={key} style={[styles.platform, {
                        left: bounds.min.x,
                        top: bounds.min.y,
                        width: w,
                        height: h,
                        backgroundColor: platformColor,
                        borderBottomWidth: 4,
                        borderBottomColor: 'rgba(0,0,0,0.3)'
                    }]} />
                );
                break;
            }
            case 'trap': {
                const trapColors = {
                    spikes: '#ef4444', falling_rocks: '#78350f', ice_slide: '#bae6fd',
                    quicksand: '#d97706', fireball: '#f97316', wind_gust: '#e0f2fe',
                    laser_beam: '#f0abfc', ghost_hand: '#c4b5fd', emp_shockwave: '#86efac',
                    shadow_clone: '#0f172a', shadow_bolt: '#a855f7',
                };
                const isBolt = e.type === 'shadow_bolt';
                elements.push(
                    <View key={key} style={[
                        styles.trap,
                        isBolt && { width: 14, height: 14, borderRadius: 7 },
                        {
                            left: x - (isBolt ? 7 : 12),
                            top: y - (isBolt ? 7 : 8),
                            backgroundColor: trapColors[e.type] ?? '#ef4444',
                            borderBottomWidth: isBolt ? 0 : 2,
                            borderBottomColor: 'rgba(0,0,0,0.5)',
                            shadowColor: isBolt ? '#a855f7' : 'transparent',
                            shadowRadius: 10,
                            shadowOpacity: 0.8
                        }
                    ]} />
                );
                break;
            }
            case 'coin': {
                if (e.collected) return;
                elements.push(
                    <View key={key} style={[styles.coin, { left: x - 8, top: y - 8 }]}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' }} />
                    </View>
                );
                break;
            }
            case 'gem': {
                if (e.collected) return;
                elements.push(
                    <View key={key} style={[styles.gem, { left: x - 10, top: y - 10 }]} />
                );
                break;
            }
            case 'checkpoint': {
                const color = e.activated ? '#22c55e' : '#64748b';
                elements.push(
                    <View key={key} style={[styles.checkpoint, { left: x - 10, top: y - 20, borderColor: color, shadowColor: color, shadowRadius: 10, shadowOpacity: 0.5 }]} />
                );
                break;
            }
            case 'exit': {
                elements.push(
                    <View key={key} style={[styles.exit, { left: x - 24, top: y - 24 }]}>
                        <View style={[StyleSheet.absoluteFill, { borderRadius: 24, backgroundColor: '#fbbf2433' }]} />
                    </View>
                );
                break;
            }
            case 'hazard': {
                let color = '#4b5563';
                let size = { w: 16, h: 32 };
                let radius = 4;

                if (e.type === 'icicle') {
                    color = '#bae6fd';
                } else if (e.type === 'ember') {
                    color = '#ef4444';
                    size = { w: 8, h: 8 };
                    radius = 2;
                } else if (e.type === 'void_orb') {
                    color = '#a855f7';
                    size = { w: 20, h: 20 };
                    radius = 10;
                } else if (e.type === 'debris') {
                    color = '#475569';
                    size = { w: 24, h: 24 };
                }

                elements.push(
                    <View key={key} style={[styles.hazard, {
                        left: x - size.w / 2, top: y - size.h / 2,
                        width: size.w, height: size.h,
                        backgroundColor: color,
                        borderRadius: radius,
                        shadowColor: color,
                        shadowOpacity: e.type === 'void_orb' ? 0.8 : 0,
                        shadowRadius: 10,
                    }]} />
                );
                break;
            }
        }
    });

    return <View style={[StyleSheet.absoluteFill, { transform: [{ translateX: shakeX }, { translateY: shakeY }] }]}>{elements}</View>;
};

const styles = StyleSheet.create({
    player: {
        position: 'absolute',
        width: PLAYER.WIDTH,
        height: PLAYER.HEIGHT,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    eye: {
        width: 8, height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 10, right: 6,
    },
    enemy: {
        position: 'absolute',
        width: ENEMY.WIDTH,
        height: ENEMY.HEIGHT,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enemyEye: {
        width: 6, height: 6,
        borderRadius: 3,
        position: 'absolute',
        top: 8, right: 6,
    },
    aura: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderRadius: 6,
        margin: -4,
        opacity: 0.6,
    },
    healthBar: {
        position: 'absolute',
        top: -10,
        width: '120%',
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    healthFill: {
        height: '100%',
        backgroundColor: '#ef4444',
    },
    platform: {
        position: 'absolute',
        borderRadius: 4,
    },
    trap: {
        position: 'absolute',
        width: 24, height: 16,
        borderRadius: 2,
    },
    coin: {
        position: 'absolute',
        width: 16, height: 16,
        borderRadius: 8,
        backgroundColor: '#fbbf24',
        borderWidth: 2,
        borderColor: '#f59e0b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gem: {
        position: 'absolute',
        width: 20, height: 20,
        borderRadius: 4,
        backgroundColor: '#818cf8',
        borderWidth: 2,
        borderColor: '#6366f1',
        transform: [{ rotate: '45deg' }],
    },
    checkpoint: {
        position: 'absolute',
        width: 20, height: 40,
        borderRadius: 4,
        borderWidth: 3,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    exit: {
        position: 'absolute',
        width: 48, height: 48,
        borderRadius: 24,
        borderWidth: 4,
        borderColor: '#fbbf24',
        justifyContent: 'center',
        alignItems: 'center',
    },
    particle: {
        position: 'absolute',
    },
    hazard: {
        position: 'absolute',
        width: 16,
        height: 32,
    },
});

export default GameRenderer;
