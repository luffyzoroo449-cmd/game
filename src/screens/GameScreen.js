import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions, Animated } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { LinearGradient } from 'expo-linear-gradient';
import { createPhysicsWorld, resetPhysicsWorld } from '../game/engine/PhysicsWorld';
import { loadLevel } from '../game/engine/LevelLoader';
import { getLevel } from '../game/levels';
import { WORLDS, WORLD_COLORS } from '../game/constants/WorldConfig';
import { SKINS, SCREEN } from '../game/constants/GameConstants';
import PhysicsSystem from '../game/systems/PhysicsSystem';
import InputSystem from '../game/systems/InputSystem';
import CollisionSystem from '../game/systems/CollisionSystem';
import AISystem from '../game/systems/AISystem';
import RewardSystem from '../game/systems/RewardSystem';
import CheckpointSystem from '../game/systems/CheckpointSystem';
import ParticleSystem from '../game/systems/ParticleSystem';
import HazardSystem from '../game/systems/HazardSystem';
import GameRenderer from '../components/GameRenderer';
import { useGameStore } from '../store/gameStore';
import { useAudio } from '../hooks/useAudio';

const { width: SW, height: SH } = Dimensions.get('window');
const SCALE_X = SW / SCREEN.WIDTH;
const SCALE_Y = SH / SCREEN.HEIGHT;
const SCALE = Math.min(SCALE_X, SCALE_Y);

export default function GameScreen({ route, navigation }) {
    const levelId = route.params?.levelId ?? 1;
    const levelData = getLevel(levelId);

    // Safely retrieve world data
    const world = WORLDS[levelData.world] || WORLDS[1];
    const wc = WORLD_COLORS[world.name] || { primary: '#7c3aed', secondary: '#a855f7', bg: '#0a0a0f' };

    const { completeLevel, activeSkin, progressMission } = useGameStore();
    const { playSFX, playBGM, stopBGM } = useAudio();
    const engineRef = useRef(null);
    const inputRef = useRef({ left: false, right: false, jumpPressed: false, dashPressed: false });
    const [entities, setEntities] = useState(null);
    const [hud, setHud] = useState({ coins: 0, gems: 0, health: 3, time: 0 });
    const [paused, setPaused] = useState(false);
    const [shake, setShake] = useState(0);
    const timerRef = useRef(null);
    const timeRef = useRef(0);

    const skinColor = SKINS.find(s => s.id === activeSkin)?.color ?? '#7c3aed';
    const introAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(introAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.delay(1200),
            Animated.timing(introAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, [levelId]);

    // Init Level
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const isRevive = route.params?.revive;
            resetPhysicsWorld();
            createPhysicsWorld(levelData.gravityScale);

            const totalCoins = levelData.coins?.length || 0;
            const ents = loadLevel(levelData, skinColor);

            if (ents) {
                ents['input'] = inputRef.current;
                ents['gameLevel'] = levelId;
                ents['worldMeta'] = world;
                ents['levelMeta'] = {
                    levelId,
                    totalCoins,
                    spawnPos: {
                        x: (levelData.platforms[0]?.x ?? 0) + 40,
                        y: (levelData.platforms[0]?.y ?? 400) - 60
                    }
                };

                if (mounted) {
                    setEntities(ents);
                    if (!isRevive) {
                        setHud({ coins: 0, gems: 0, health: 3, time: 0 });
                        timeRef.current = 0;
                    } else {
                        setHud(h => ({ ...h, health: 3 }));
                    }

                    playBGM(world.bgmKey || 'forest_theme');
                }
            }
        };

        init();

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!paused) timeRef.current += 1;
        }, 1000);

        return () => {
            mounted = false;
            clearInterval(timerRef.current);
            stopBGM();
        };
    }, [levelId, route.params?.revive]);

    // HUD Sync
    useEffect(() => {
        const hInterval = setInterval(() => {
            if (entities && entities['player']) {
                const p = entities['player'];
                setHud(prev => ({
                    ...prev,
                    coins: p.coins || 0,
                    gems: p.gems || 0,
                    health: p.health || 0,
                    time: timeRef.current
                }));
            }
        }, 100);
        return () => clearInterval(hInterval);
    }, [entities]);

    const handleEvent = useCallback((e) => {
        switch (e.type) {
            case 'sfx': playSFX(e.name); break;
            case 'shake': setShake(e.intensity || 5); setTimeout(() => setShake(0), 200); break;
            case 'levelComplete': {
                const finalCoins = entities['player']?.coins || 0;
                const finalGems = entities['player']?.gems || 0;
                const stars = e.stars || 1;
                completeLevel(levelId, stars, e.xp || 0, finalCoins, finalGems);
                progressMission('levels', 1);
                navigation.replace('LevelComplete', { levelId, stars, xp: e.xp, coins: finalCoins, gems: finalGems });
                break;
            }
            case 'gameOver': {
                navigation.replace('GameOver', { levelId });
                break;
            }
            case 'collectCoin': progressMission('coins', 1); break;
            case 'defeatEnemy': progressMission('enemies', 1); break;
        }
    }, [levelId, entities, completeLevel, navigation, playSFX, progressMission]);

    useEffect(() => {
        if (entities) {
            entities['screenMeta'] = { shake };
        }
    }, [shake, entities]);

    if (!entities) {
        return (
            <View style={[styles.loading, { backgroundColor: wc.bg }]}>
                <Text style={styles.loadingText}>LOADING TRIAL...</Text>
            </View>
        );
    }

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <View style={styles.root}>
            <StatusBar hidden />
            <View style={[styles.canvas, { transform: [{ scale: SCALE }], transformOrigin: 'top left' }]}>
                <GameEngine
                    ref={engineRef}
                    style={{ width: SCREEN.WIDTH, height: SCREEN.HEIGHT }}
                    systems={[PhysicsSystem, InputSystem, CollisionSystem, AISystem, RewardSystem, CheckpointSystem, ParticleSystem, HazardSystem]}
                    entities={entities}
                    onEvent={handleEvent}
                    running={!paused}
                    renderer={GameRenderer}
                />
            </View>

            <Animated.View style={[styles.introOverlay, { opacity: introAnim, transform: [{ scale: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]} pointerEvents="none">
                <Text style={styles.introLevel}>TRIAL {levelId}</Text>
                <Text style={styles.introName}>{levelData.name}</Text>
                <View style={[styles.introLine, { backgroundColor: wc.primary }]} />
            </Animated.View>

            <View style={styles.hud} pointerEvents="none">
                <View style={styles.hudLeft}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Text key={i} style={{ fontSize: 20, opacity: i < hud.health ? 1 : 0.2 }}>❤️</Text>
                    ))}
                </View>
                <View style={styles.hudCenter}>
                    <Text style={styles.hudTimer}>{fmt(hud.time)}</Text>
                    <Text style={styles.hudLevel}>{world.name} – {levelId}</Text>
                </View>
                <View style={styles.hudRight}>
                    <Text style={styles.hudStat}>🪙 {hud.coins}</Text>
                    <Text style={styles.hudStat}>💎 {hud.gems}</Text>
                </View>
            </View>

            <View style={styles.controls} pointerEvents="box-none">
                <View style={styles.dpad}>
                    <TouchableOpacity style={styles.ctrlBtn}
                        onPressIn={() => { inputRef.current.left = true; }}
                        onPressOut={() => { inputRef.current.left = false; }}>
                        <Text style={styles.ctrlText}>◀</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ctrlBtn}
                        onPressIn={() => { inputRef.current.right = true; }}
                        onPressOut={() => { inputRef.current.right = false; }}>
                        <Text style={styles.ctrlText}>▶</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.pauseBtn} onPress={() => setPaused(p => !p)}>
                        <Text style={styles.ctrlTextSm}>{paused ? '▶' : '⏸'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ctrlBtn, styles.dashBtn]}
                        onPress={() => { inputRef.current.dashPressed = true; setTimeout(() => { inputRef.current.dashPressed = false; }, 100); }}>
                        <Text style={styles.ctrlText}>💨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ctrlBtn, styles.jumpBtn]}
                        onPress={() => { inputRef.current.jumpPressed = true; setTimeout(() => { inputRef.current.jumpPressed = false; }, 100); }}>
                        <Text style={styles.ctrlText}>▲</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {paused && (
                <View style={styles.pauseOverlay}>
                    <Text style={styles.pauseTitle}>PAUSED</Text>
                    <TouchableOpacity style={styles.resumeBtn} onPress={() => setPaused(false)}>
                        <Text style={styles.resumeText}>RESUME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exitBtn} onPress={() => { stopBGM(); navigation.replace('MainMenu'); }}>
                        <Text style={styles.exitText}>QUIT</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 4 },
    canvas: { width: SCREEN.WIDTH, height: SCREEN.HEIGHT, backgroundColor: '#000' },
    hud: { position: 'absolute', top: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    hudLeft: { flexDirection: 'row', gap: 4 },
    hudCenter: { alignItems: 'center' },
    hudTimer: { color: '#fff', fontSize: 24, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 4 },
    hudLevel: { color: '#94a3b8', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    hudRight: { alignItems: 'flex-end' },
    hudStat: { color: '#fff', fontSize: 14, fontWeight: '800' },
    controls: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30 },
    dpad: { flexDirection: 'row', gap: 20 },
    actionBtns: { flexDirection: 'row', gap: 20, alignItems: 'flex-end' },
    ctrlBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    jumpBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(124, 58, 237, 0.3)', borderColor: '#7c3aed' },
    dashBtn: { marginBottom: 10 },
    pauseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    ctrlText: { color: '#fff', fontSize: 32 },
    ctrlTextSm: { color: '#fff', fontSize: 18 },
    introOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    introLevel: { color: '#a855f7', fontSize: 14, fontWeight: '900', letterSpacing: 4 },
    introName: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 8, textAlign: 'center' },
    introLine: { width: 100, height: 4, marginTop: 16, borderRadius: 2 },
    pauseOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    pauseTitle: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: 10, marginBottom: 40 },
    resumeBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 60, paddingVertical: 16, borderRadius: 30, marginBottom: 20 },
    resumeText: { color: '#fff', fontSize: 18, fontWeight: '900' },
    exitBtn: { padding: 10 },
    exitText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
});
