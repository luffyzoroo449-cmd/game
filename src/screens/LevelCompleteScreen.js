import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '../hooks/useAudio';
import { getLevel } from '../game/levels';

const RANK_LABELS = { 1: 'BRONZE', 2: 'SILVER', 3: 'DIAMOND SHADOW' };
const STAR_COLORS = ['#94a3b8', '#fbbf24', '#f97316'];

export default function LevelCompleteScreen({ route, navigation }) {
    const { levelId, stars = 1, xp = 0, coins = 0, gems = 0, timeTaken = 0 } = route.params ?? {};
    const level = getLevel(levelId);
    const nextId = levelId + 1;
    const hasNext = nextId <= 100;
    const { playSFX } = useAudio();

    const scale = useRef(new Animated.Value(0)).current;
    const starAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

    useEffect(() => {
        playSFX('levelComplete');
        Animated.spring(scale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start(() => {
            starAnims.slice(0, stars).forEach((a, i) =>
                setTimeout(() => Animated.spring(a, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true }).start(), i * 300)
            );
        });
    }, []);

    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    return (
        <LinearGradient colors={['#0a0a0f', '#1a0a3a', '#0a0a0f']} style={styles.container}>
            <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                <Text style={styles.title}>✨ LEVEL CLEAR!</Text>
                <Text style={styles.lvlName}>{level?.name}</Text>

                {/* Stars */}
                <View style={styles.starsRow}>
                    {starAnims.map((anim, i) => (
                        <Animated.Text key={i} style={[styles.star, { transform: [{ scale: anim }], color: i < stars ? STAR_COLORS[i] : '#334155' }]}>★</Animated.Text>
                    ))}
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.stat}><Text style={styles.statLabel}>TIME</Text><Text style={styles.statVal}>{fmt(timeTaken)}</Text></View>
                    <View style={styles.stat}><Text style={styles.statLabel}>🪙 COINS</Text><Text style={styles.statVal}>{coins}</Text></View>
                    <View style={styles.stat}><Text style={styles.statLabel}>💎 GEMS</Text><Text style={styles.statVal}>{gems}</Text></View>
                    <View style={styles.stat}><Text style={styles.statLabel}>✨ XP</Text><Text style={styles.statVal}>+{xp}</Text></View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {hasNext && (
                        <TouchableOpacity onPress={() => navigation.replace('Game', { levelId: nextId })} activeOpacity={0.8}>
                            <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.btn}>
                                <Text style={styles.btnText}>Next Level ▶</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => navigation.replace('Game', { levelId })} style={[styles.btn, styles.btnSecondary]}>
                        <Text style={[styles.btnText, { color: '#94a3b8' }]}>↺ Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.replace('WorldMap')} style={[styles.btn, styles.btnSecondary]}>
                        <Text style={[styles.btnText, { color: '#94a3b8' }]}>🗺 World Map</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#12102a', borderRadius: 24, padding: 32, alignItems: 'center', width: '85%', shadowColor: '#a855f7', shadowOpacity: 0.4, shadowRadius: 24, elevation: 12 },
    title: { fontSize: 30, color: '#a855f7', fontWeight: '900', letterSpacing: 4 },
    lvlName: { color: '#64748b', fontSize: 14, marginTop: 4, letterSpacing: 2 },
    starsRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
    star: { fontSize: 52 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 24 },
    stat: { backgroundColor: '#1e1b2e', borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 90 },
    statLabel: { color: '#64748b', fontSize: 11, letterSpacing: 1, fontWeight: '700' },
    statVal: { color: '#e2e8f0', fontSize: 20, fontWeight: '800', marginTop: 4 },
    actions: { gap: 12, width: '100%' },
    btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    btnSecondary: { backgroundColor: '#1e1b2e' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
});
