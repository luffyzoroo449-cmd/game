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
    const world = WORLDS[levelData.world];
    const wc = WORLD_COLORS[world.name] ?? { primary: '#7c3aed', sky: '#0a0a0f' };

    const { completeLevel, activeSkin, progressMission } = useGameStore();
    const { playSFX, playBGM, stopBGM } = useAudio();
    const engineRef = useRef(null);
    const inputRef = useRef({ left: false, right: false, jumpPressed: false, dashPressed: false });
    const [entities, setEntities] = useState(null);
    const [hud, setHud] = useState({ coins: 0, gems: 0, health: 3, time: 0 });
    const [paused, setPaused] = useState(false);
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

    // Init
    useEffect(() => {
        const isRevive = route.params?.revive;
        resetPhysicsWorld();
        createPhysicsWorld(levelData.gravityScale);
        const totalCoins = levelData.coins.length;
        const ents = loadLevel(levelData, skinColor);
        ents['input'] = inputRef.current;
        ents['gameLevel'] = levelId;
        ents['worldMeta'] = world;

        // If reviving, start at the "start" of the level but keep items
        ents['levelMeta'] = { levelId, totalCoins, spawnPos: { x: (levelData.platforms[0]?.x ?? 0) + 40, y: (levelData.platforms[0]?.y ?? 400) - 60 } };

        setEntities(ents);

        if (!isRevive) {
            setHud({ coins: 0, gems: 0, health: 3, time: 0 });
            timeRef.current = 0;
        } else {
            setHud(h => ({ ...h, health: 3 }));
        }

        playBGM(levelData.bgmKey);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            timeRef.current += 1;
            setHud(h => ({ ...h, time: timeRef.current }));
        }, 1000);

        return () => { clearInterval(timerRef.current); stopBGM(); resetPhysicsWorld(); };
    }, [levelId, route.params?.revive]);

    const handleEvent = useCallback((e) => {
        switch (e.type) {
            case 'sfx': playSFX(e.name); break;
            case 'coinCollected':
                setHud(h => ({ ...h, coins: h.coins + e.value }));
                progressMission('coins', e.value);
                break;
            case 'gemCollected': setHud(h => ({ ...h, gems: h.gems + e.value })); break;
            case 'enemyDefeated':
                progressMission('enemies', 1);
                break;
            case 'playerDamaged': setHud(h => ({ ...h, health: e.health })); break;
            case 'playerDied':
                clearInterval(timerRef.current);
                setTimeout(() => navigation.replace('GameOver', { levelId }), 1500);
                break;
            case 'shake':
                setShake(e.intensity || 5);
                break;
            case 'levelReward':
                clearInterval(timerRef.current);
                completeLevel(levelId, e.stars, e.xp, e.coins, e.gems);
                progressMission('levels', 1);
                navigation.replace('LevelComplete', { levelId, stars: e.stars, xp: e.xp, coins: e.coins, gems: e.gems, timeTaken: e.timeTaken });
                break;
        }
    }, [levelId, progressMission]);

    const [shake, setShake] = useState(0);
    useEffect(() => {
        if (shake > 0) {
            const timer = setTimeout(() => setShake(s => Math.max(0, s - 1)), 50);
            return () => clearTimeout(timer);
        }
    }, [shake]);

    useEffect(() => {
        if (entities) {
            entities['screenMeta'] = { shake };
        }
    }, [shake, entities]);

    if (!entities) return <View style={[styles.loading, { backgroundColor: wc.bg ?? '#0a0a0f' }]}><Text style={styles.loadingText}>Loading...</Text></View>;

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <View style={styles.root}>
            <StatusBar hidden />
            {/* Game canvas */}
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

            {/* Level Intro */}
            <Animated.View style={[styles.introOverlay, { opacity: introAnim, transform: [{ scale: introAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]} pointerEvents="none">
                <Text style={styles.introLevel}>TRIAL {levelId}</Text>
                <Text style={styles.introName}>{levelData.name}</Text>
                <View style={styles.introLine} />
            </Animated.View>

            {/* HUD */}
            <View style={styles.hud} pointerEvents="none">
                <View style={styles.hudLeft}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Text key={i} style={{ fontSize: 20, opacity: i < hud.health ? 1 : 0.25 }}>❤️</Text>
                    ))}
                </View>
                <View style={styles.hudCenter}>
                    <Text style={styles.hudTimer}>{fmt(hud.time)}</Text>
                    <Text style={styles.hudLevel}>Level {levelId} – {levelData.isBoss ? '👑 BOSS' : world.name}</Text>
                </View>
                <View style={styles.hudRight}>
                    <Text style={styles.hudStat}>🪙 {hud.coins}</Text>
                    <Text style={styles.hudStat}>💎 {hud.gems}</Text>
                </View>
            </View>

            {/* D-Pad + Action buttons */}
            <View style={styles.controls} pointerEvents="box-none">
                {/* Left / Right */}
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
                {/* Jump + Dash + Pause */}
                <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.pauseBtn} onPress={() => setPaused(p => !p)}>
                        <Text style={styles.ctrlTextSm}>{paused ? '▶' : '⏸'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ctrlBtn, styles.dashBtn]}
                        onPress={() => { inputRef.current.dashPressed = true; setTimeout(() => { inputRef.current.dashPressed = false; }, 100); }}>
                        <Text style={styles.ctrlText}>💨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ctrlBtn, styles.jumpBtn]}
                        onPress={() => { inputRef.current.jumpPressed = true; setTimeout(() => { inputRef.current.jumpPressed = false; }, 80); }}>
                        <Text style={styles.ctrlText}>▲</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Pause overlay */}
            {paused && (
                <View style={styles.pauseOverlay}>
                    <Text style={styles.pauseTitle}>PAUSED</Text>
                    <TouchableOpacity style={styles.pauseItem} onPress={() => setPaused(false)}><Text style={styles.pauseItemText}>▶  Resume</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.pauseItem} onPress={() => navigation.replace('Game', { levelId })}><Text style={styles.pauseItemText}>↺  Restart</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.pauseItem} onPress={() => { stopBGM(); navigation.replace('MainMenu'); }}><Text style={styles.pauseItemText}>⌂  Main Menu</Text></TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#a855f7', fontSize: 22, fontWeight: '700' },
    canvas: { position: 'absolute', top: 0, left: 0 },
    hud: { position: 'absolute', top: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
    hudLeft: { flexDirection: 'row', gap: 4 },
    hudCenter: { alignItems: 'center' },
    hudTimer: { color: '#e2e8f0', fontWeight: '800', fontSize: 18, letterSpacing: 2 },
    hudLevel: { color: '#94a3b8', fontSize: 11, letterSpacing: 1 },
    hudRight: { alignItems: 'flex-end', gap: 2 },
    hudStat: { color: '#e2e8f0', fontWeight: '700', fontSize: 14 },
    controls: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
    dpad: { flexDirection: 'row', gap: 10 },
    actionBtns: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
    ctrlBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#ffffff22', borderWidth: 2, borderColor: '#ffffff44', justifyContent: 'center', alignItems: 'center' },
    jumpBtn: { backgroundColor: '#7c3aed55', borderColor: '#a855f7' },
    dashBtn: { backgroundColor: '#0f766e55', borderColor: '#14b8a6' },
    pauseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff15', borderWidth: 1, borderColor: '#ffffff33', justifyContent: 'center', alignItems: 'center' },
    ctrlText: { fontSize: 22, color: '#e2e8f0' },
    ctrlTextSm: { fontSize: 18, color: '#94a3b8' },
    pauseOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000cc', justifyContent: 'center', alignItems: 'center', gap: 18 },
    pauseTitle: { color: '#a855f7', fontSize: 36, fontWeight: '900', letterSpacing: 6, marginBottom: 10 },
    pauseItem: { paddingHorizontal: 40, paddingVertical: 14, backgroundColor: '#1e1b2e', borderRadius: 12, width: 220, alignItems: 'center' },
    pauseItemText: { color: '#e2e8f0', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
    introOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 50 },
    introLevel: { color: '#a855f7', fontSize: 16, fontWeight: '900', letterSpacing: 6, marginBottom: 8 },
    introName: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 4, textAlign: 'center' },
    introLine: { width: 100, height: 4, backgroundColor: '#a855f7', marginTop: 12, borderRadius: 2, shadowColor: '#a855f7', shadowRadius: 10, shadowOpacity: 0.8 },
});
